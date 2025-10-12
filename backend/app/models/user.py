from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum
from ..utils.database import Base
from sqlalchemy.sql import func
import enum
import uuid

class UserRole(enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    # Core fields
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.FREE, nullable=False)
    
    # Account status
    is_active = Column(Boolean, server_default='true', nullable=False)
    
    # Usage limits
    credits = Column(Integer, server_default='5', nullable=False)  # Free credits on signup
    requests_count = Column(Integer, server_default='0', nullable=False)  # Total number of requests made
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
    last_login = Column(DateTime)

    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def full_name(self):
        """Returns the user's full name or email if name not set"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        return self.email
    
    @property
    def is_premium(self):
        """Check if user has premium access"""
        return self.role == UserRole.PREMIUM
    
    @property
    def is_admin(self):
        """Check if user has admin privileges"""
        return self.role == UserRole.ADMIN
