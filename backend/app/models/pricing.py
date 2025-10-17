"""Models for pricing system."""
from sqlalchemy import Column, Integer, String

from app.utils.database import Base


class PricingTable(Base):
    """Model for pricing table."""
    __tablename__ = "pricing_table"
    
    id = Column(Integer, primary_key=True)
    action_type = Column(String, unique=True, nullable=False)
    unit = Column(String, nullable=False)
    base_shobeis = Column(Integer, nullable=False)
    min_charge = Column(Integer, nullable=False)