from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import logging
import importlib

# Configure logging
logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///./test.db"
Base = declarative_base()

# Create SQLite engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables"""
    try:
        # Import models to register with Base
        importlib.import_module('app.models.user')
        # If there are other model modules, import them here as needed
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
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

# Note: Do not auto-initialize the DB here to avoid circular imports. Call init_db() from application startup.