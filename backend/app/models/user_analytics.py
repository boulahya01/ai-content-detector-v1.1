from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.utils.database import Base
import uuid


class UserAnalytics(Base):
    __tablename__ = "user_analytics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    date = Column(Date, nullable=False)
    words_analyzed = Column(Integer, nullable=False, default=0)
    api_calls = Column(Integer, nullable=False, default=0)
    exports = Column(Integer, nullable=False, default=0)
    shobeis_spent = Column(Integer, nullable=False, default=0)
    shobeis_earned = Column(Integer, nullable=False, default=0)

    # Relationships
    user = relationship("User", back_populates="analytics")

    def __repr__(self):
        return f"<UserAnalytics user_id={self.user_id} date={self.date}>"


__all__ = ["UserAnalytics"]