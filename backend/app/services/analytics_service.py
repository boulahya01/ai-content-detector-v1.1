from typing import Dict, List, Optional
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from app.models import User, UserAnalysisStats, UserApiUsage
from app.utils.cache import RedisCache
from fastapi import BackgroundTasks
from app.utils.exceptions import SystemError

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(
        self,
        session: Session,
        cache: Optional[RedisCache] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ):
        self.session = session
        self.cache = cache
        self.background_tasks = background_tasks

    def get_user_analytics(self, user_id: str) -> Dict:
        """Get comprehensive analytics for a specific user (synchronous)"""
        try:
            cache_key = f"user_analytics:{user_id}"

            # Try cache first (if cache configured)
            if self.cache is not None:
                try:
                    cached = self.cache.get(cache_key)
                    if cached:
                        return cached
                except Exception as e:
                    logger.warning(f"Cache read failed for user {user_id}: {str(e)}")

            # Get user data with related stats
            user = self.session.query(User).filter(User.id == user_id).first()

            if not user:
                logger.info(f"No analytics found for user {user_id}")
                return {}
        except SQLAlchemyError as e:
            logger.error(f"Database error fetching user analytics for {user_id}: {str(e)}")
            raise SystemError("Failed to fetch user analytics")

        analytics = {
            "user": {
                "id": user.id,
                "user_type": getattr(user, 'user_type', None) or getattr(user, 'subscription_tier', None),
                "shobeis_balance": getattr(user, 'shobeis_balance', 0),
                "bonus_balance": getattr(user, 'bonus_balance', 0),
                "total_words_analyzed": getattr(user, 'total_words_analyzed', 0),
                "total_api_calls": getattr(user, 'total_api_calls', 0),
                "total_exports": getattr(user, 'total_exports', 0)
            },
            "analysis": {},
            "api_usage": []
        }

        # analysis_stats may be a relationship object or a dynamic query; normalize
        stats_rel = getattr(user, 'analysis_stats', None)
        stats_obj = None
        if stats_rel is None:
            stats_obj = None
        elif hasattr(stats_rel, 'first'):
            try:
                stats_obj = stats_rel.first()
            except Exception:
                stats_obj = None
        else:
            stats_obj = stats_rel

        # api_usage may be a relationship collection or a dynamic query; normalize
        api_usage_rel = getattr(user, 'api_usage', None)
        api_usage_list = []
        if api_usage_rel is None:
            api_usage_list = []
        elif hasattr(api_usage_rel, 'all'):
            try:
                api_usage_list = api_usage_rel.all()
            except Exception:
                api_usage_list = []
        else:
            # assume iterable
            try:
                api_usage_list = list(api_usage_rel)
            except Exception:
                api_usage_list = []

        analytics["analysis"] = {
            "total_count": int(getattr(stats_obj, 'total_analyses', 0) or 0),
            "ai_count": int(getattr(stats_obj, 'ai_detected_count', 0) or 0),
            "human_count": int(getattr(stats_obj, 'human_detected_count', 0) or 0),
            "avg_confidence": float(getattr(stats_obj, 'avg_confidence', 0) or 0),
            "avg_processing_time": float(getattr(stats_obj, 'avg_processing_time', 0) or 0)
        }

        analytics["api_usage"] = [
            {
                "endpoint": usage.endpoint,
                "request_count": int(getattr(usage, 'request_count', 0) or 0),
                "success_rate": (float(getattr(usage, 'success_count', 0)) / getattr(usage, 'request_count', 1) * 100) if getattr(usage, 'request_count', 0) else 0,
                "avg_response_time": float(getattr(usage, 'avg_response_time', 0) or 0)
            }
            for usage in api_usage_list
        ]
        

        # Cache for 5 minutes (if cache configured)
        if self.cache is not None:
            try:
                self.cache.set(cache_key, analytics, 300)
            except Exception:
                pass
        return analytics

    def update_analysis_stats(self, user_id: str, is_ai: bool, confidence: float, processing_time: int) -> None:
        """Update user's analysis statistics (synchronous)"""
        try:
            stats = self.session.query(UserAnalysisStats).filter(UserAnalysisStats.user_id == user_id).first()
            if not stats:
                logger.info(f"Creating new analytics stats for user {user_id}")
                stats = UserAnalysisStats(user_id=user_id)
                self.session.add(stats)

            total = int(getattr(stats, 'total_analyses', 0) or 0) + 1
            ai_count = int(getattr(stats, 'ai_detected_count', 0) or 0) + (1 if is_ai else 0)
            human_count = int(getattr(stats, 'human_detected_count', 0) or 0) + (0 if is_ai else 1)

            stats.total_analyses = total
            stats.ai_detected_count = ai_count
            stats.human_detected_count = human_count

            prev_avg_conf = float(getattr(stats, 'avg_confidence', 0) or 0)
            stats.avg_confidence = (prev_avg_conf * (total - 1) + confidence) / total

            prev_avg_time = float(getattr(stats, 'avg_processing_time', 0) or 0)
            stats.avg_processing_time = (prev_avg_time * (total - 1) + processing_time) / total

            stats.last_analysis_date = datetime.utcnow()
            self.session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database error updating analysis stats for {user_id}: {str(e)}", exc_info=True)
            try:
                self.session.rollback()
            except Exception:
                pass
            raise SystemError("Failed to update analysis stats")

    def track_api_usage(self, user_id: str, endpoint: str, response_time: int, success: bool) -> None:
        """Track API usage statistics (synchronous)"""
        try:
            usage = self.session.query(UserApiUsage).filter(
                UserApiUsage.user_id == user_id,
                UserApiUsage.endpoint == endpoint
            ).first()
            if not usage:
                logger.info(f"Creating new API usage tracking for user {user_id} endpoint {endpoint}")
                usage = UserApiUsage(user_id=user_id, endpoint=endpoint)
                self.session.add(usage)

            usage.request_count = int(getattr(usage, 'request_count', 0) or 0) + 1
            usage.success_count = int(getattr(usage, 'success_count', 0) or 0) + (1 if success else 0)
            usage.error_count = int(getattr(usage, 'error_count', 0) or 0) + (0 if success else 1)

            prev_avg = float(getattr(usage, 'avg_response_time', 0) or 0)
            usage.avg_response_time = (prev_avg * (usage.request_count - 1) + response_time) / usage.request_count
            usage.last_request = datetime.utcnow()
            self.session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database error tracking API usage for {user_id} {endpoint}: {str(e)}", exc_info=True)
            try:
                self.session.rollback()
            except Exception:
                pass
            raise SystemError("Failed to track API usage")

    def get_system_analytics(self) -> Dict:
        """Get system-wide analytics (synchronous)"""
        cache_key = "system_analytics"

        # Try cache first (if cache configured)
        if self.cache is not None:
            try:
                cached = self.cache.get(cache_key)
                if cached:
                    return cached
            except Exception:
                pass

        # Total users
        user_count = self.session.query(func.count(User.id)).scalar() or 0

        # Analysis aggregates
        analysis_stats = self.session.query(
            func.sum(UserAnalysisStats.total_analyses),
            func.sum(UserAnalysisStats.ai_detected_count),
            func.avg(UserAnalysisStats.avg_confidence),
            func.sum(UserAnalysisStats.total_credits_used),
            func.sum(UserAnalysisStats.total_content_length)
        ).one()

        api_stats = self.session.query(
            func.sum(UserApiUsage.request_count),
            func.sum(UserApiUsage.success_count),
            func.avg(UserApiUsage.avg_response_time)
        ).one()

        analytics = {
            "users": {
                "total": int(user_count),
                "activeToday": self.get_active_users_count("day"),
                "activeWeek": self.get_active_users_count("week"),
                "activeMonth": self.get_active_users_count("month")
            },
            "analysis": {
                "total": int(analysis_stats[0] or 0),
                "ai_detected": int(analysis_stats[1] or 0),
                "avg_confidence": float(analysis_stats[2] or 0),
                "total_credits_used": int(analysis_stats[3] or 0),
                "total_content_analyzed": int(analysis_stats[4] or 0),
                "daily_average": self.get_daily_average_analyses(),
                "weekly_trend": self.get_weekly_trend()
            },
            "api": {
                "total_requests": int(api_stats[0] or 0),
                "success_rate": (float(api_stats[1]) / api_stats[0] * 100) if api_stats[0] else 0,
                "avg_response_time": float(api_stats[2] or 0),
                "recent_errors": self.get_recent_errors()
            }
        }

        if self.cache is not None:
            try:
                self.cache.set(cache_key, analytics, 300)
            except Exception:
                pass

        return analytics

    def get_active_users_count(self, period: str) -> int:
        """Get count of active users for a given period"""
        now = datetime.utcnow()
        if period == "day":
            cutoff = now - timedelta(days=1)
        elif period == "week":
            cutoff = now - timedelta(days=7)
        else:  # month
            cutoff = now - timedelta(days=30)

        return self.session.query(func.count(UserAnalysisStats.user_id))\
            .filter(UserAnalysisStats.last_analysis_date >= cutoff)\
            .scalar() or 0

    def get_daily_average_analyses(self) -> float:
        """Calculate daily average analyses for the past week"""
        week_ago = datetime.utcnow() - timedelta(days=7)
        stats = self.session.query(
            func.sum(UserAnalysisStats.total_analyses)
        ).filter(
            UserAnalysisStats.last_analysis_date >= week_ago
        ).scalar() or 0
        return float(stats) / 7

    def get_analytics_trend(self, timeframe: str) -> List[Dict]:
        """Get analysis trend for a specified timeframe"""
        now = datetime.utcnow()
        if timeframe == "24h":
            cutoff = now - timedelta(hours=24)
            interval = "hour"
        elif timeframe == "7d":
            cutoff = now - timedelta(days=7)
            interval = "day"
        elif timeframe == "30d":
            cutoff = now - timedelta(days=30)
            interval = "day"
        else:  # all-time
            cutoff = None
            interval = "month"

        query = self.session.query(
            func.date_trunc(interval, UserAnalysisStats.last_analysis_date).label('date'),
            func.count(UserAnalysisStats.id).label('count'),
            func.sum(UserAnalysisStats.total_credits_used).label('credits')
        )

        if cutoff:
            query = query.filter(UserAnalysisStats.last_analysis_date >= cutoff)

        daily_stats = query.group_by(
            func.date_trunc(interval, UserAnalysisStats.last_analysis_date)
        ).order_by(
            func.date_trunc(interval, UserAnalysisStats.last_analysis_date)
        ).all()

        return [{
            "date": str(stat.date),
            "analyses": stat.count,
            "creditsUsed": int(stat.credits or 0)
        } for stat in daily_stats]

    def get_recent_errors(self) -> List[Dict]:
        """Get recent API errors"""
        day_ago = datetime.utcnow() - timedelta(days=1)
        errors = self.session.query(
            UserApiUsage.endpoint,
            func.sum(UserApiUsage.error_count).label('errors')
        ).filter(
            UserApiUsage.last_request >= day_ago,
            UserApiUsage.error_count > 0
        ).group_by(
            UserApiUsage.endpoint
        ).all()

        return [{"endpoint": err.endpoint, "count": err.errors} for err in errors]