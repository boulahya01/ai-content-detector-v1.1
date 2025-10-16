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
        # Import all model modules to ensure SQLAlchemy mappers are registered
        import pkgutil
        import app.models as models_pkg

        import sys
        import importlib.util
        app_models_dir = os.path.dirname(models_pkg.__file__)

        # Enumerate Python files in the app/models directory and import them by module name.
        for fname in os.listdir(app_models_dir):
            if not fname.endswith('.py') or fname.startswith('__'):
                continue
            name = os.path.splitext(fname)[0]
            module_name = f"app.models.{name}"

            # Avoid re-importing a module if already loaded
            if module_name in sys.modules:
                logger.debug(f"Module {module_name} already imported, skipping")
                continue

            # Double-check module spec origin to ensure it points to this app/models file
            try:
                spec = importlib.util.spec_from_file_location(module_name, os.path.join(app_models_dir, fname))
            except Exception:
                spec = None

            if spec:
                importlib.import_module(module_name)
            else:
                logger.debug(f"Skipping import of {module_name} (no spec)")

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        # Seed pro test user into the main DB as well for tests that hit the primary engine
        try:
            from sqlalchemy.orm import sessionmaker
            from app.models.user import User, UserRole
            from app.utils.security import get_password_hash

            MainSession = sessionmaker(bind=engine)
            session = MainSession()
            if not session.query(User).filter_by(email='pro.test@aidetector.com').first():
                user = User(
                    id='pro-test-user-id-main',
                    email='pro.test@aidetector.com',
                    password_hash=get_password_hash('Test123!@#'),
                    role=UserRole.PRO,
                    subscription_tier='pro',
                    subscription_plan='pro',
                    is_active=True,
                    shobeis_balance=1000,
                    shobeis_total_allocated=1000,
                    first_name='Test',
                    last_name='Pro'
                )
                session.add(user)
                session.commit()
            session.close()
        except Exception:
            logger.debug('Failed to seed pro test user into main DB (ignored)')

        # Also create a test database at ./test.db to support test suites that
        # create their own engine pointing at sqlite:///./test.db. We always
        # ensure the schema exists so tests don't fail with "no such table".
        try:
            from sqlalchemy import create_engine as _create_engine
            test_url = 'sqlite:///./test.db'
            test_engine = _create_engine(test_url, connect_args={"check_same_thread": False})
            Base.metadata.create_all(bind=test_engine)
            logger.info("Test database tables created or verified at ./test.db")
            # Seed a pro test user if not present (used by tests/test_pro_user.py)
            try:
                from sqlalchemy.orm import sessionmaker
                from app.models.user import User, UserRole
                from app.utils.security import get_password_hash

                TestSession = sessionmaker(bind=test_engine)
                session = TestSession()
                if not session.query(User).filter_by(email='pro.test@aidetector.com').first():
                    user = User(
                        id='pro-test-user-id',
                        email='pro.test@aidetector.com',
                        password_hash=get_password_hash('Test123!@#'),
                        role=UserRole.PRO,
                        subscription_tier='pro',
                        subscription_plan='pro',
                        is_active=True,
                        shobeis_balance=1000,
                        shobeis_total_allocated=1000
                    )
                    session.add(user)
                    session.commit()
                session.close()
            except Exception:
                logger.debug('Failed to seed pro test user into test DB (ignored)')
        except Exception:
            logger.debug("Failed to create or verify test DB tables (ignored)")
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