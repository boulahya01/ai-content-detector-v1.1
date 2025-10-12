from app.models.user import User, UserRole
from app.utils.database import SessionLocal, init_db
from app.utils.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test123@gmail.com").first()
        if existing_user:
            print("Test user already exists!")
            return

        # Create test user
        test_user = User(
            email="test123@gmail.com",
            password_hash=get_password_hash("Test123!"),
            first_name="Test",
            last_name="User",
            role=UserRole.FREE,
            is_active=True,
            credits=5,
            requests_count=0
        )
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()  # Ensure database is initialized
    create_test_user()