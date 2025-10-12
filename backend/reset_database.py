import os
from app.utils.database import DATABASE_URL, init_db
from app.models.user import User, UserRole
from app.utils.security import get_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def reset_database():
    # Extract database file path from URL
    db_path = DATABASE_URL.replace('sqlite:///', '')
    
    # Remove the database file if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database at {db_path}")
    
    # Initialize new database
    init_db()
    print("Initialized new database")
    
    # Create engine and session
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
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
    reset_database()