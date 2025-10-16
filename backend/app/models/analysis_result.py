from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    content = Column(Text, nullable=False)
    ai_probability = Column(Float, nullable=False)
    length = Column(Integer, nullable=False)
    language = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    from sqlalchemy.orm import backref
    user = relationship("User", backref=backref("analysis_results", lazy="dynamic"))