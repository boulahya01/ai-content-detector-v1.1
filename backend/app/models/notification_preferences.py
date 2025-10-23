from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..utils.database import Base
import uuid

class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    email_preferences = Column(JSON, nullable=False, default=lambda: {
        "analysisResults": True,
        "accountActivity": True,
        "marketingUpdates": False,
        "securityAlerts": True
    })
    in_app_preferences = Column(JSON, nullable=False, default=lambda: {
        "analysisComplete": True,
        "subscriptionUpdates": True,
        "creditAlerts": True,
        "newFeatures": True
    })
    created_at = Column(DateTime(timezone=True), server_default='now()')
    updated_at = Column(DateTime(timezone=True), onupdate='now()')

    # Relationships
    user = relationship("User", back_populates="notification_preferences")