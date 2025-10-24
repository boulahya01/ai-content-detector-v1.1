from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..utils.database import Base

class UserAnalysisStats(Base):
    __tablename__ = 'user_analysis_stats'
    
    # Use string UUIDs for SQLite compatibility
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    total_analyses = Column(Integer, default=0)
    ai_detected_count = Column(Integer, default=0)
    human_detected_count = Column(Integer, default=0)
    avg_confidence = Column(Numeric(5, 2))
    avg_processing_time = Column(Integer)
    last_analysis_date = Column(DateTime)
    total_credits_used = Column(Integer, default=0)
    total_content_length = Column(Integer, default=0)
    daily_analyses = Column(Integer, default=0)  # Reset daily
    weekly_analyses = Column(Integer, default=0)  # Reset weekly
    monthly_analyses = Column(Integer, default=0)  # Reset monthly
    last_reset_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    from sqlalchemy.orm import backref
    user = relationship("User", backref=backref("analysis_stats", lazy="dynamic"))

class UserApiUsage(Base):
    __tablename__ = 'user_api_usage'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    endpoint = Column(String(255))
    request_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    avg_response_time = Column(Integer)
    last_request = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    from sqlalchemy.orm import backref
    user = relationship("User", backref=backref("api_usage", lazy="dynamic"))