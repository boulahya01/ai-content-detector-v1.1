"""Seed test users for testing."""
from sqlalchemy.orm import Session
from app.models.user import User, UserType
from app.utils.security import get_password_hash
from app.utils.database import SessionLocal

def seed_test_users(db: Session):
    """Create test users for various roles if they don't exist."""
    test_users = [
        {
            "email": "admin@aidetector.com",
            "password": "Admin@123",
            "user_type": UserType.ENTERPRISE.value,
            "first_name": "Admin",
            "last_name": "User",
            "shobeis_balance": 99999,
            "monthly_refresh_amount": 10000
        },
        {
            "email": "pro.test@aidetector.com",
            "password": "Test123!@#",
            "user_type": UserType.PRO.value,
            "first_name": "Pro",
            "last_name": "User",
            "shobeis_balance": 1000,
            "monthly_refresh_amount": 1000
        },
        {
            "email": "pro@example.com",
            "password": "Pro@123",
            "user_type": UserType.PRO.value,
            "first_name": "Pro",
            "last_name": "Example",
            "shobeis_balance": 500
        },
        {
            "email": "free@example.com",
            "password": "Free@123",
            "user_type": UserType.FREE.value,
            "first_name": "Free",
            "last_name": "User",
            "shobeis_balance": 50
        }
    ]

    for user_data in test_users:
        email = user_data["email"]
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create new user
            user = User(
                email=email,
                password_hash=get_password_hash(user_data["password"]),
                user_type=user_data["user_type"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                is_active=1,
                shobeis_balance=int(user_data["shobeis_balance"]),
                monthly_refresh_amount=1000 if user_data["user_type"] == UserType.PRO.value else 0
            )
            db.add(user)
        else:
            # Update existing user
            user.user_type = user_data["user_type"]
            user.shobeis_balance = int(user_data["shobeis_balance"])
            user.monthly_refresh_amount = 1000 if user_data["user_type"] == UserType.PRO.value else 0
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_test_users(db)
        print("Test users seeded successfully")
    finally:
        db.close()