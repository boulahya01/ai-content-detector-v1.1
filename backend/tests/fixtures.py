import pytest
from sqlalchemy.orm import Session
from app.models.user import User, UserType
from app.utils.security import get_password_hash
import uuid

@pytest.fixture(autouse=True)
def setup_pricing(db):
    """Create test pricing data."""
    db.execute("""
        CREATE TABLE IF NOT EXISTS pricing_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL UNIQUE,
            unit TEXT NOT NULL,
            base_shobeis INTEGER NOT NULL,
            min_charge INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Add test pricing
    db.execute("""
        INSERT INTO pricing_table (action_type, unit, base_shobeis, min_charge)
        VALUES ('word_analysis', 'WORD', 1, 10)
        ON CONFLICT (action_type) DO UPDATE SET
            unit = excluded.unit,
            base_shobeis = excluded.base_shobeis,
            min_charge = excluded.min_charge
    """)
    db.commit()

@pytest.fixture(scope="function")
def test_user(db: Session):
    user = db.query(User).filter(User.email == "pro.test@aidetector.com").first()
    return user