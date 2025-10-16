from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.utils.database import Base
from typing import Optional


class ActionCost(Base):
	__tablename__ = "action_costs"

	action_type = Column(String(50), primary_key=True)
	free_tier_cost = Column(Integer, nullable=False)
	basic_tier_cost = Column(Integer, nullable=False)
	pro_tier_cost = Column(Integer, nullable=False)
	created_at = Column(DateTime, server_default=func.now())
	updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

	def get_cost_for_tier(self, tier: str) -> int:
		tier = (tier or 'free').lower()
		if tier == 'free':
			return int(self.free_tier_cost or 0)
		if tier == 'basic':
			return int(self.basic_tier_cost or 0)
		if tier in ('pro', 'enterprise'):
			return int(self.pro_tier_cost or 0)
		return int(self.free_tier_cost or 0)


__all__ = ["ActionCost"]