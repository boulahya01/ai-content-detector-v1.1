from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.utils.database import Base
from sqlalchemy.sql import func
import enum
import uuid
from typing import Optional, Dict, Any


class TransactionType(enum.Enum):
    CHARGE = "CHARGE"
    REFUND = "REFUND"
    MONTHLY_REFRESH = "MONTHLY_REFRESH"
    BONUS = "BONUS"
    SIGNUP_BONUS = "SIGNUP_BONUS"
    PURCHASE = "PURCHASE"


class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class ShobeisTransaction(Base):
    __tablename__ = "shobeis_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    amount = Column(Integer, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(String(255))
    balance_before = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    status = Column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.COMPLETED)
    # 'metadata' is a reserved attribute on Declarative Base, expose column as 'metadata' in DB but attribute as 'meta'
    meta = Column('metadata', JSON, nullable=True)
    idempotency_key = Column(String(255), nullable=True, unique=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")

    @classmethod
    def create(
        cls,
        db,
        user,
        amount: int,
        transaction_type: TransactionType,
        description: Optional[str] = None,
        meta: Optional[Dict[str, Any]] = None,
        idempotency_key: Optional[str] = None,
    ):
        """Create a new transaction with proper balance tracking"""
        # Use getattr to support SQLAlchemy Column attributes in static analysis
        balance_before = int(getattr(user, 'shobeis_balance', 0) or 0)
        balance_after = balance_before + int(amount)

        transaction = cls(
            user_id=str(user.id),
            amount=int(amount),
            transaction_type=transaction_type,
            description=description,
            balance_before=balance_before,
            balance_after=balance_after,
            meta=meta,
            idempotency_key=idempotency_key,
        )

        # Persist changes to user balance
        user.shobeis_balance = balance_after
        return transaction


__all__ = ["ShobeisTransaction", "TransactionType", "TransactionStatus"]