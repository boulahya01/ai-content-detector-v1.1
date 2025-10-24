from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from typing import Dict, List, Optional
import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..services.analytics_service import AnalyticsService
from ..utils.database import get_db
from ..utils.cache import RedisCache
from ..utils.security import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analytics"])

# Dependency to get analytics service 
def get_analytics_service(
    session: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks(),
) -> AnalyticsService:
    # For now, we'll pass None as cache since Redis isn't set up yet
    return AnalyticsService(session=session, cache=None, background_tasks=background_tasks)

@router.get("/user/{user_id}")
async def get_user_analytics(
    user_id: str,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Get analytics data for a specific user"""
    try:
        analytics = analytics_service.get_user_analytics(user_id)
        if analytics:
            return analytics
            
        # If user doesn't exist, return empty stats structure
        return {
            "user": {
                "id": user_id, 
                "subscription_tier": "free",
                "shobeis_balance": 0,
                "bonus_balance": 0,
                "total_words_analyzed": 0,
                "total_api_calls": 0,
                "total_exports": 0
            },
            "analysis": {
                "total_count": 0,
                "ai_count": 0,
                "human_count": 0,
                "avg_confidence": 0,
                "avg_processing_time": 0
            },
            "api_usage": []
        }
    except Exception as e:
        logger.error(f"Error fetching analytics for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to fetch user analytics",
                "error": str(e),
                "code": "ANALYTICS_ERROR"
            }
        )

@router.get("/system")
async def get_system_analytics(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Get system-wide analytics data"""
    try:
        analytics = analytics_service.get_system_analytics()
        if not analytics:
            # Return empty system stats structure if no data
            return {
                "users": {
                    "total": 0,
                    "active_last_24h": 0,
                    "active_last_7d": 0
                },
                "analysis": {
                    "total": 0, 
                    "ai_detected": 0,
                    "human_detected": 0,
                    "avg_confidence": 0.0,
                    "avg_processing_time": 0
                },
                "api": {
                    "total_requests": 0,
                    "success_rate": 0.0,
                    "avg_response_time": 0,
                    "errors_24h": 0
                }
            }
        return analytics
    except Exception as e:
        logger.error(f"Error fetching system analytics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to fetch system analytics",
                "error": str(e),
                "code": "SYSTEM_ANALYTICS_ERROR"
            }
        )


@router.get("/system/status")
async def get_system_status(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Compatibility alias: system/status"""
    return await get_system_analytics(analytics_service)

@router.post("/track/{user_id}")
async def track_analysis(
    user_id: str,
    is_ai: bool,
    confidence: float,
    processing_time: int,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Track a new analysis result"""
    try:
        analytics_service.update_analysis_stats(
            user_id=user_id,
            is_ai=is_ai,
            confidence=confidence,
            processing_time=processing_time
        )
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error tracking analysis for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to track analysis stats",
                "error": str(e),
                "code": "TRACK_ANALYSIS_ERROR"
            }
        )

@router.post("/track/api/{user_id}")
async def track_api_usage(
    user_id: str,
    endpoint: str,
    response_time: int,
    success: bool,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Track API usage"""
    try:
        analytics_service.track_api_usage(
            user_id=user_id,
            endpoint=endpoint,
            response_time=response_time,
            success=success
        )
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error tracking API usage for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to track API usage",
                "error": str(e),
                "code": "TRACK_API_ERROR"
            }
        )

@router.get("/usage-stats")
async def get_usage_stats(
    timeframe: str = Query("7d", regex="^(24h|7d|30d|all)$"),
    current_user: User = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Get detailed usage statistics for the current user"""
    try:
        # Calculate date range based on timeframe
        end_date = datetime.utcnow()
        if timeframe == "24h":
            start_date = end_date - timedelta(days=1)
        elif timeframe == "7d":
            start_date = end_date - timedelta(days=7)
        elif timeframe == "30d":
            start_date = end_date - timedelta(days=30)
        else:
            start_date = None

            # Get user's analysis stats and API usage
            stats = analytics_service.get_user_analytics(current_user.id)

            if stats:
                analysis_stats = stats.get("analysis", {})
                api_stats = stats.get("api_usage", [])

                return {
                    "summary": {
                        "totalAnalyses": analysis_stats.get("total_count", 0),
                        "aiDetected": analysis_stats.get("ai_count", 0),
                        "humanDetected": analysis_stats.get("human_count", 0),
                        "avgConfidence": analysis_stats.get("avg_confidence", 0),
                        "avgProcessingTime": analysis_stats.get("avg_processing_time", 0),
                        "totalCreditsUsed": stats.get("user", {}).get("total_credits_used", 0),
                        "timeframe": timeframe
                    },
                    "apiUsage": [
                        {
                            "endpoint": usage.get("endpoint"),
                            "requests": usage.get("request_count", 0),
                            "successRate": usage.get("success_rate", 0),
                            "avgResponseTime": usage.get("avg_response_time", 0)
                        }
                        for usage in api_stats
                    ],
                    "timeline": analytics_service.get_analytics_trend(timeframe)
                }        return {"error": "No statistics available"}
    except Exception as e:
        logger.error(f"Error fetching usage stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to fetch usage statistics",
                "error": str(e),
                "code": "USAGE_STATS_ERROR"
            }
        )

@router.get("/system-health")
async def get_system_health(
    current_user: User = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Get system health metrics (admin only)"""
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        system_stats = analytics_service.get_system_analytics()
        
        return {
            "status": "operational",
            "uptime": "100%",  # Placeholder - implement actual uptime tracking
            "loadMetrics": {
                "requestsPerMinute": system_stats["api"]["total_requests"] / (24 * 60),  # Daily average
                "avgResponseTime": system_stats["api"]["avg_response_time"],
                "errorRate": 100 - system_stats["api"]["success_rate"]
            },
            "userMetrics": {
                "totalUsers": system_stats["users"]["total"],
                "activeUsers": {
                    "daily": system_stats["users"]["activeToday"],
                    "weekly": system_stats["users"]["activeWeek"],
                    "monthly": system_stats["users"]["activeMonth"]
                }
            },
            "analysisMetrics": {
                "totalAnalyses": system_stats["analysis"]["total"],
                "dailyAverage": system_stats["analysis"]["daily_average"],
                "successRate": system_stats["api"]["success_rate"]
            },
            "recentErrors": analytics_service.get_recent_errors()
        }
    except Exception as e:
        logger.error(f"Error fetching system health: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to fetch system health metrics",
                "error": str(e),
                "code": "SYSTEM_HEALTH_ERROR"
            }
        )