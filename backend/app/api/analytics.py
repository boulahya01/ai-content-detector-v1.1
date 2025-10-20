from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict
import logging
from sqlalchemy.orm import Session
from ..services.analytics_service import AnalyticsService
from ..utils.database import get_db
from ..utils.cache import RedisCache

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