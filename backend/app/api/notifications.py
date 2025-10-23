from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from ..models.user import User
from ..models.notification_preferences import NotificationPreferences
from ..utils.database import get_db
from ..utils.security import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class NotificationPreferencesUpdate(BaseModel):
    email: Dict[str, bool]
    inApp: Dict[str, bool]

class NotificationPreferencesResponse(BaseModel):
    email: Dict[str, bool]
    inApp: Dict[str, bool]

    class Config:
        from_attributes = True

@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's notification preferences."""
    preferences = db.query(NotificationPreferences)\
        .filter(NotificationPreferences.user_id == current_user.id)\
        .first()

    if not preferences:
        # Create default preferences
        preferences = NotificationPreferences(user_id=current_user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return {
        "email": preferences.email_preferences,
        "inApp": preferences.in_app_preferences
    }

@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's notification preferences."""
    user_preferences = db.query(NotificationPreferences)\
        .filter(NotificationPreferences.user_id == current_user.id)\
        .first()

    if not user_preferences:
        user_preferences = NotificationPreferences(user_id=current_user.id)
        db.add(user_preferences)

    user_preferences.email_preferences = preferences.email
    user_preferences.in_app_preferences = preferences.inApp

    db.commit()
    db.refresh(user_preferences)

    return {
        "email": user_preferences.email_preferences,
        "inApp": user_preferences.in_app_preferences
    }