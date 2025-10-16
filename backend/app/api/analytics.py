from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..utils.database import get_session
from ..services.analytics_service import AnalyticsService
from ..utils.cache import RedisCache
from fastapi import BackgroundTasks
from typing import Dict

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Dependency to get analytics service
async def get_analytics_service(
    session: AsyncSession = Depends(get_session),
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
        analytics = await analytics_service.get_user_analytics(user_id)
        if not analytics:
            raise HTTPException(status_code=404, detail="User not found")
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/system")
async def get_system_analytics(
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict:
    """Get system-wide analytics data"""
    try:
        return await analytics_service.get_system_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        await analytics_service.update_analysis_stats(
            user_id=user_id,
            is_ai=is_ai,
            confidence=confidence,
            processing_time=processing_time
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        await analytics_service.track_api_usage(
            user_id=user_id,
            endpoint=endpoint,
            response_time=response_time,
            success=success
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))