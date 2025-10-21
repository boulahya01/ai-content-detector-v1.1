from sqlalchemy import text
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import logging
import importlib

# Configure logging
logger = logging.getLogger(__name__)

# Read DATABASE_URL from environment with a safe default for production
import os

def get_db_url():
    """Get database URL from environment with a safe default"""
    return os.environ.get('DATABASE_URL', 'sqlite:///./backend.db')

DATABASE_URL = get_db_url()
Base = declarative_base()

# Create SQLite engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables"""
    try:
        # Import models in dependency order to avoid circular imports
        from app.models.user import User, UserType, SubscriptionStatus
        from app.models.blacklisted_token import BlacklistedToken
        from app.models.shobeis_transaction import ShobeisTransaction, TransactionType
        from app.models.pricing import PricingTable
        from app.models.user_analytics import UserAnalytics

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Add initial pricing table data
        try:
            session = SessionLocal()
            session.execute(
                text("""
                INSERT INTO pricing_table (action_type, unit, base_shobeis, min_charge)
                VALUES ('word_analysis', 'WORD', 1, 10)
                ON CONFLICT (action_type) DO UPDATE SET
                    unit = excluded.unit,
                    base_shobeis = excluded.base_shobeis,
                    min_charge = excluded.min_charge
                """)
            )
            session.commit()
            session.close()
            logger.info("Added initial pricing data")
        except Exception as e:
            logger.error(f"Failed to add initial pricing: {e}")
            
        # (Removed hardcoded user seeding. Use /api/auth/register for real users.)
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_session():
    """Compatibility helper for older code/tests expecting get_session."""
    return SessionLocal()

# Expose engine and SessionLocal for external scripts/tests
__all__ = ["DATABASE_URL", "Base", "engine", "SessionLocal", "init_db", "get_db", "get_session"]

# Note: Do not auto-initialize the DB here to avoid circular imports. Call init_db() from application startup.