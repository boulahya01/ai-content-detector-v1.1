from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum, CheckConstraint
from sqlalchemy.orm import relationship
from app.utils.database import Base
from sqlalchemy.sql import func
import enum
import uuid
from typing import Optional
from datetime import datetime, timedelta
from app.models.shobeis_transaction import TransactionType


class UserRole(enum.Enum):
	FREE = "free"
	BASIC = "basic"
	PRO = "pro"
	ADMIN = "admin"


class User(Base):
	__tablename__ = "users"

	id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
	email = Column(String(255), unique=True, nullable=False, index=True)
	password_hash = Column(String(255), nullable=False)

	first_name = Column(String(100), nullable=True)
	last_name = Column(String(100), nullable=True)
	role = Column(Enum(UserRole), default=UserRole.FREE, nullable=False)

	is_active = Column(Boolean, server_default='true', nullable=False)

	shobeis_balance = Column(Integer, server_default='50', nullable=False)
	monthly_refresh_amount = Column(Integer, server_default='0', nullable=False)
	bonus_balance = Column(Integer, server_default='0', nullable=False)
	last_refresh_date = Column(DateTime, nullable=True)

	requests_count = Column(Integer, server_default='0', nullable=False)

	created_at = Column(DateTime, server_default=func.now(), nullable=False)
	updated_at = Column(DateTime, onupdate=func.now())
	last_login = Column(DateTime, nullable=True)
	last_activity = Column(DateTime, nullable=True)

	subscription_tier = Column(String(50), default='free')
	# Backwards-compatible column name used in older tests/code
	subscription_plan = Column(String(50), default='free')
	# Total allocated shobeis (legacy name expected by tests)
	shobeis_total_allocated = Column(Integer, default=0)

	transactions = relationship("ShobeisTransaction", back_populates="user", lazy="dynamic")

	__table_args__ = (
		CheckConstraint('shobeis_balance >= 0', name='shobeis_balance_check'),
		CheckConstraint('bonus_balance >= 0', name='bonus_balance_check'),
	)

	def __repr__(self):
		return f"<User {self.email}>"

	def full_name(self) -> str:
		if self.first_name and self.last_name:
			return f"{self.first_name} {self.last_name}"
		if self.first_name:
			return self.first_name
		return self.email

	# Provide property-like access for Pydantic/JSON serialization
	@property
	def full_name_prop(self) -> str:
		return self.full_name()

	def has_sufficient_balance(self, amount: int) -> bool:
		return (int(self.shobeis_balance or 0) + int(self.bonus_balance or 0)) >= int(amount or 0)

	def process_monthly_refresh(self, db) -> bool:
		if not self.monthly_refresh_amount:
			return False
		now = datetime.utcnow()
		if not self.last_refresh_date or (now - self.last_refresh_date) >= timedelta(days=30):
			rollover = min(int((self.shobeis_balance or 0) * 0.2), int(self.monthly_refresh_amount))
			self.shobeis_balance = (rollover + int(self.monthly_refresh_amount))
			self.last_refresh_date = now
			from app.models.shobeis_transaction import ShobeisTransaction
			tx = ShobeisTransaction.create(db, self, int(self.monthly_refresh_amount),
										   TransactionType.MONTHLY_REFRESH,
										   description='Monthly refresh', meta={'rollover': rollover})
			db.add(tx)
			return True
		return False

	def add_bonus(self, bonus_type: str, amount: int, db):
		from app.models.shobeis import UserBonus
		bonus = UserBonus(
			user_id=self.id,
			bonus_type=bonus_type,
			amount=amount
		)
		self.bonus_balance = int(self.bonus_balance or 0) + int(amount)
		db.add(bonus)
		from app.models.shobeis_transaction import ShobeisTransaction
		tx = ShobeisTransaction.create(db, self, int(amount),
					   TransactionType.SIGNUP_BONUS,
					   description=f'Bonus {bonus_type}', meta={'bonus_type': bonus_type})
		db.add(tx)


__all__ = ["User", "UserRole"]
