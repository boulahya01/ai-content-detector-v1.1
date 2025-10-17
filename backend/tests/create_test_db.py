"""Create or update test database and pro test user."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.blacklisted_token import BlacklistedToken  # Import first to avoid circular dependency
from app.models.user import User, UserType
from app.utils.security import get_password_hash
from app.utils.database import Base
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_database():
    """Create or update test database and pro test user."""
    try:
        # Create test database engine
        engine = create_engine('sqlite:///./test.db', connect_args={"check_same_thread": False})
        
        # Create all tables
        Base.metadata.create_all(engine)
        logger.info("Database tables created")
        
        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        try:
            # Create or update pro test user
            user = session.query(User).filter_by(email='pro.test@aidetector.com').first()
            if not user:
                user = User(
                    email='pro.test@aidetector.com',
                    password_hash=get_password_hash('Test123!@#'),
                    user_type=UserType.PRO.value,
                    first_name='Pro',
                    last_name='User',
                    is_active=True,
                    shobeis_balance=1000,
                    monthly_refresh_amount=1000
                )
                session.add(user)
                session.commit()
                logger.info("Pro test user created")
            else:
                user.user_type = UserType.PRO.value
                user.shobeis_balance = 1000
                user.monthly_refresh_amount = 1000
                session.commit()
                logger.info("Pro test user updated")
            
            # Return user data for verification
            return {
                "email": user.email,
                "user_type": user.user_type,
                "shobeis_balance": user.shobeis_balance,
                "monthly_refresh_amount": user.monthly_refresh_amount
            }
        
        except Exception as e:
            session.rollback()
            logger.error(f"Error while creating/updating user: {e}")
            raise
        
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Error while setting up database: {e}")
        raise

if __name__ == "__main__":
    user_data = create_test_database()
    print("\nTest Database Setup Complete")
    print("----------------------------")
    print(f"Email: {user_data['email']}")
    print(f"User Type: {user_data['user_type']}")
    print(f"Balance: {user_data['shobeis_balance']} Shobeis")
    print(f"Monthly Refresh: {user_data['monthly_refresh_amount']} Shobeis")