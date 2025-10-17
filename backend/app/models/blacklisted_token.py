from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..utils.database import Base
from datetime import datetime

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"

    token = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship with User model
    user = relationship("User", back_populates="blacklisted_tokens")

    @classmethod
    def is_blacklisted(cls, session, token: str) -> bool:
        """Check if a token is blacklisted."""
        return session.query(cls).filter(cls.token == token).first() is not None