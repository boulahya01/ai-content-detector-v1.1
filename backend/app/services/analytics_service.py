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
            return None

        # Compile analytics
        analytics = {
            "user": {
                "id": user.id,
                "subscription_tier": user.subscription_tier,
                "credits_used": user.credits_used,
                "credits_total": user.credits_total
            },
            "analysis": {
                "total_count": user.analysis_stats.total_analyses if user.analysis_stats else 0,
                "ai_count": user.analysis_stats.ai_detected_count if user.analysis_stats else 0,
                "human_count": user.analysis_stats.human_detected_count if user.analysis_stats else 0,
                "avg_confidence": float(user.analysis_stats.avg_confidence) if user.analysis_stats else 0,
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
            
            # Update stats
            stats.total_analyses += 1
            if is_ai:
                stats.ai_detected_count += 1
            else:
                stats.human_detected_count += 1
            
            # Update averages
            stats.avg_confidence = (
                (stats.avg_confidence * (stats.total_analyses - 1) + confidence)
                / stats.total_analyses
            )
            stats.avg_processing_time = (
                (stats.avg_processing_time * (stats.total_analyses - 1) + processing_time)
                / stats.total_analyses
            )
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
            usage.request_count += 1
            if success:
                usage.success_count += 1
            else:
                usage.error_count += 1
            
            # Update average response time
            usage.avg_response_time = (
                (usage.avg_response_time * (usage.request_count - 1) + response_time)
                / usage.request_count
            )
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