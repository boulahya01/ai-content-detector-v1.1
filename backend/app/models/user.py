from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum, CheckConstraint, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from app.utils.database import Base
from sqlalchemy.sql import func
import enum
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, UTC
from app.models.shobeis_transaction import TransactionType, ShobeisTransaction
from app.models.user_analytics import UserAnalytics


class UserType(enum.Enum):
    FREE = "FREE"
    BASIC = "BASIC"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(enum.Enum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"


# Backwards compatibility: many modules import UserRole. Provide an alias.
# Use simple assignment alias instead of subclassing Enum (subclassing raises TypeError).
UserRole = UserType


from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Personal info
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    user_type = Column(String(20), default=UserType.FREE.value, nullable=False)
    is_active = Column(Boolean, server_default='true', nullable=False)

    # Subscription info
    subscription_status = Column(String(20), default=SubscriptionStatus.INACTIVE.value, nullable=False)
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    billing_cycle_start = Column(DateTime, nullable=True)
    billing_cycle_end = Column(DateTime, nullable=True)

    # Balance and usage
    shobeis_balance = Column(Integer, server_default='50', nullable=False)
    bonus_balance = Column(Integer, server_default='0', nullable=False)
    monthly_refresh_amount = Column(Integer, server_default='0', nullable=False)
    last_refresh_date = Column(DateTime, nullable=True)

    # Usage tracking
    total_words_analyzed = Column(BigInteger, server_default='0', nullable=False)
    total_api_calls = Column(BigInteger, server_default='0', nullable=False)
    total_exports = Column(BigInteger, server_default='0', nullable=False)
    requests_count = Column(Integer, server_default='0', nullable=False)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
    last_login = Column(DateTime, nullable=True)
    last_activity = Column(DateTime, nullable=True)

    # Relationships

    # Relationships
    blacklisted_tokens = relationship("BlacklistedToken", back_populates="user", lazy="dynamic")
    transactions = relationship("ShobeisTransaction", back_populates="user", lazy="dynamic")
    analytics = relationship("UserAnalytics", back_populates="user", lazy="dynamic")

    __table_args__ = (
        CheckConstraint('shobeis_balance >= 0', name='shobeis_balance_check'),
        CheckConstraint('bonus_balance >= 0', name='bonus_balance_check'),
    )

    def __repr__(self):
        return f"<User {self.email}>"

    @hybrid_property
    def full_name(self) -> str:
        first = str(self.first_name or "")
        last = str(self.last_name or "")
        if first and last:
            return f"{first} {last}"
        if first:
            return first
        return str(self.email)

    @property
    def full_name_prop(self) -> str:
        return self.full_name

    def has_sufficient_balance(self, amount: int) -> bool:
        """Check if user has sufficient balance for an operation"""
        current_balance = getattr(self, 'shobeis_balance', 0) or 0
        bonus_balance = getattr(self, 'bonus_balance', 0) or 0
        return (current_balance + bonus_balance) >= amount

    def get_usage_limits(self) -> Dict[str, Any]:
        """Get usage limits based on user type"""
        limits = {
            UserType.FREE: {
                'words_per_month': 50000,
                'api_calls_per_month': 0,
                'exports_per_month': 10,
                'batch_size': 1,
                'rollover_percent': 0
            },
            UserType.BASIC: {
                'words_per_month': 100000,
                'api_calls_per_month': 1000,
                'exports_per_month': 50,
                'batch_size': 10,
                'rollover_percent': 0.25
            },
            UserType.PRO: {
                'words_per_month': float('inf'),
                'api_calls_per_month': 10000,
                'exports_per_month': float('inf'),
                'batch_size': float('inf'),
                'rollover_percent': 0.50
            },
            UserType.ENTERPRISE: {
                'words_per_month': float('inf'),
                'api_calls_per_month': float('inf'),
                'exports_per_month': float('inf'),
                'batch_size': float('inf'),
                'rollover_percent': 0.75
            }
        }
        user_type = getattr(self, 'user_type', UserType.FREE)
        return limits[user_type if isinstance(user_type, UserType) else UserType.FREE]

    def get_discount_rate(self) -> float:
        """Get discount rate based on user type"""
        discounts = {
            UserType.FREE: 0.0,
            UserType.BASIC: 0.20,
            UserType.PRO: 0.40,
            UserType.ENTERPRISE: 0.50
        }
        user_type = getattr(self, 'user_type', UserType.FREE)
        return discounts[user_type if isinstance(user_type, UserType) else UserType.FREE]

    def process_monthly_refresh(self, db) -> bool:
        """Process monthly Shobeis refresh based on user type"""
        refresh_amount = getattr(self, 'monthly_refresh_amount', 0)
        if not refresh_amount:
            return False

        now = datetime.now(UTC)
        last_refresh = getattr(self, 'last_refresh_date', None)
        
        if not last_refresh or (now - last_refresh) >= timedelta(days=30):
            limits = self.get_usage_limits()
            current_balance = getattr(self, 'shobeis_balance', 0) or 0
            rollover = min(
                int(current_balance * limits['rollover_percent']), 
                refresh_amount
            )
            self.shobeis_balance = rollover + refresh_amount
            self.last_refresh_date = now
            tx = ShobeisTransaction.create(
                db, self, 
                refresh_amount,
                TransactionType.MONTHLY_REFRESH,
                description='Monthly refresh', 
                meta={'rollover': rollover}
            )
            db.add(tx)
            return True
        return False

    def add_bonus(self, bonus_type: str, amount: int, db):
        """Add bonus Shobeis to user account"""
        current_bonus = getattr(self, 'bonus_balance', 0) or 0
        self.bonus_balance = current_bonus + amount
        
        tx = ShobeisTransaction.create(
            db, self, 
            amount,
            TransactionType.BONUS,
            description=f'Bonus {bonus_type}', 
            meta={'bonus_type': bonus_type}
        )
        db.add(tx)

    def track_usage(self, action_type: str, amount: int = 1):
        """Track usage statistics"""
        if action_type == 'words_analyzed':
            current = getattr(self, 'total_words_analyzed', 0) or 0
            self.total_words_analyzed = current + amount
        elif action_type == 'api_call':
            current = getattr(self, 'total_api_calls', 0) or 0
            self.total_api_calls = current + amount
        elif action_type == 'export':
            current = getattr(self, 'total_exports', 0) or 0
            self.total_exports = current + amount
        
        current_requests = getattr(self, 'requests_count', 0) or 0
        self.requests_count = current_requests + 1
        self.last_activity = datetime.now(UTC)

    def check_subscription_status(self) -> bool:
        """Check and update subscription status"""
        now = datetime.now(UTC)
        end_date = getattr(self, 'subscription_end_date', None)
        
        if end_date and now > end_date:
            self.subscription_status = SubscriptionStatus.INACTIVE
            self.user_type = UserType.FREE
            return False
            
        return getattr(self, 'subscription_status', SubscriptionStatus.INACTIVE) == SubscriptionStatus.ACTIVE


__all__ = ["User", "UserType", "SubscriptionStatus"]
