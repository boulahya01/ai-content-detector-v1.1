"""Create a pro test user directly for testing."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.utils.database import Base
from app.models.user import User, UserType
from app.utils.security import get_password_hash

# Create SQLite test database engine
engine = create_engine('sqlite:///./test.db', connect_args={"check_same_thread": False})

# Create tables
Base.metadata.create_all(engine)

# Create session
Session = sessionmaker(bind=engine)
session = Session()

# Create pro test user if not exists
try:
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
        print("Pro test user created successfully")
    else:
        # Update existing user
        user.user_type = UserType.PRO.value
        user.shobeis_balance = 1000
        user.monthly_refresh_amount = 1000
        session.commit()
        print("Pro test user updated successfully")
finally:
    session.close()