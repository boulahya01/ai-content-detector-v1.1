from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from app.models import User, UserAnalysisStats, UserApiUsage
from app.utils.cache import RedisCache
from fastapi import BackgroundTasks

class AnalyticsService:
    def __init__(
        self,
        session: AsyncSession,
        cache: RedisCache,
        background_tasks: BackgroundTasks
    ):
        self.session = session
        self.cache = cache
        self.background_tasks = background_tasks

    async def get_user_analytics(self, user_id: str) -> Dict:
        """Get comprehensive analytics for a specific user"""
        cache_key = f"user_analytics:{user_id}"
        
        # Try cache first
        if cached := await self.cache.get(cache_key):
            return cached

        # Get user data with related stats
        query = select(User).options(
            joinedload(User.analysis_stats),
            joinedload(User.api_usage)
        ).where(User.id == user_id)
        
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            return {}

        # Compile analytics (use unified user fields)
        analytics = {
            "user": {
                "id": user.id,
                "user_type": user.user_type.name if getattr(user, 'user_type', None) is not None else getattr(user, 'subscription_tier', None),
                "shobeis_balance": getattr(user, 'shobeis_balance', 0),
                "bonus_balance": getattr(user, 'bonus_balance', 0),
                "total_words_analyzed": getattr(user, 'total_words_analyzed', 0),
                "total_api_calls": getattr(user, 'total_api_calls', 0),
                "total_exports": getattr(user, 'total_exports', 0)
            },
            "analysis": {
                "total_count": user.analysis_stats.total_analyses if user.analysis_stats else 0,
                "ai_count": user.analysis_stats.ai_detected_count if user.analysis_stats else 0,
                "human_count": user.analysis_stats.human_detected_count if user.analysis_stats else 0,
                "avg_confidence": float(user.analysis_stats.avg_confidence) if user.analysis_stats and user.analysis_stats.avg_confidence is not None else 0,
                "avg_processing_time": user.analysis_stats.avg_processing_time if user.analysis_stats else 0,
            },
            "api_usage": [
                {
                    "endpoint": usage.endpoint,
                    "request_count": usage.request_count,
                    "success_rate": (usage.success_count / usage.request_count * 100) if usage.request_count > 0 else 0,
                    "avg_response_time": usage.avg_response_time
                }
                for usage in user.api_usage
            ] if user.api_usage else []
        }

        # Cache for 5 minutes
        await self.cache.set(cache_key, analytics, 300)
        return analytics

    async def update_analysis_stats(
        self,
        user_id: str,
        is_ai: bool,
        confidence: float,
        processing_time: int
    ) -> None:
        """Update user's analysis statistics"""
        async with self.session.begin():
            # Get or create stats
            query = select(UserAnalysisStats).where(UserAnalysisStats.user_id == user_id)
            result = await self.session.execute(query)
            stats = result.scalar_one_or_none()
            
            if not stats:
                stats = UserAnalysisStats(user_id=user_id)
                self.session.add(stats)

            # Convert current values to ints/floats to avoid ColumnElement issues
            total = int(getattr(stats, 'total_analyses', 0) or 0) + 1
            ai_count = int(getattr(stats, 'ai_detected_count', 0) or 0) + (1 if is_ai else 0)
            human_count = int(getattr(stats, 'human_detected_count', 0) or 0) + (0 if is_ai else 1)

            # Update stats
            stats.total_analyses = total
            stats.ai_detected_count = ai_count
            stats.human_detected_count = human_count

            # Update averages safely
            prev_avg_conf = float(getattr(stats, 'avg_confidence', 0) or 0)
            stats.avg_confidence = (prev_avg_conf * (total - 1) + confidence) / total

            prev_avg_time = float(getattr(stats, 'avg_processing_time', 0) or 0)
            stats.avg_processing_time = (prev_avg_time * (total - 1) + processing_time) / total

            stats.last_analysis_date = datetime.utcnow()

    async def track_api_usage(
        self,
        user_id: str,
        endpoint: str,
        response_time: int,
        success: bool
    ) -> None:
        """Track API usage statistics"""
        async with self.session.begin():
            # Get or create usage record
            query = select(UserApiUsage).where(
                UserApiUsage.user_id == user_id,
                UserApiUsage.endpoint == endpoint
            )
            result = await self.session.execute(query)
            usage = result.scalar_one_or_none()
            
            if not usage:
                usage = UserApiUsage(user_id=user_id, endpoint=endpoint)
                self.session.add(usage)
            
            # Update stats
            # Update counters with safe int conversions
            usage.request_count = int(getattr(usage, 'request_count', 0) or 0) + 1
            usage.success_count = int(getattr(usage, 'success_count', 0) or 0) + (1 if success else 0)
            usage.error_count = int(getattr(usage, 'error_count', 0) or 0) + (0 if success else 1)

            # Update average response time
            prev_avg = float(getattr(usage, 'avg_response_time', 0) or 0)
            usage.avg_response_time = (prev_avg * (usage.request_count - 1) + response_time) / usage.request_count
            usage.last_request = datetime.utcnow()

    async def get_system_analytics(self) -> Dict:
        """Get system-wide analytics"""
        cache_key = "system_analytics"
        
        # Try cache first
        if cached := await self.cache.get(cache_key):
            return cached

        # Get system-wide stats
        async with self.session.begin():
            # Total users
            user_count = await self.session.scalar(
                select(func.count(User.id))
            )

            # Analysis stats
            analysis_stats = await self.session.scalar(
                select(
                    func.sum(UserAnalysisStats.total_analyses),
                    func.sum(UserAnalysisStats.ai_detected_count),
                    func.avg(UserAnalysisStats.avg_confidence)
                )
            )

            # API usage
            api_stats = await self.session.scalar(
                select(
                    func.sum(UserApiUsage.request_count),
                    func.sum(UserApiUsage.success_count),
                    func.avg(UserApiUsage.avg_response_time)
                )
            )

            analytics = {
                "users": {
                    "total": user_count,
                },
                "analysis": {
                    "total": analysis_stats[0] or 0,
                    "ai_detected": analysis_stats[1] or 0,
                    "avg_confidence": float(analysis_stats[2] or 0),
                },
                "api": {
                    "total_requests": api_stats[0] or 0,
                    "success_rate": (api_stats[1] / api_stats[0] * 100) if api_stats[0] else 0,
                    "avg_response_time": api_stats[2] or 0
                }
            }

            # Cache for 5 minutes
            await self.cache.set(cache_key, analytics, 300)
            return analytics