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
        # Create a default admin user and a regular test user
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin123!')

        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash(admin_password),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN,
                is_active=True,
                credits=0,
                requests_count=0
            )
            db.add(admin_user)
            print(f"Admin user {admin_email} queued for creation")

        # Create a regular test user as before
        test_email = 'test123@gmail.com'
        if not db.query(User).filter(User.email == test_email).first():
            test_user = User(
                email=test_email,
                password_hash=get_password_hash("Test123!"),
                first_name="Test",
                last_name="User",
                role=UserRole.FREE,
                is_active=True,
                credits=5,
                requests_count=0
            )
            db.add(test_user)
            print("Test user queued for creation")

        db.commit()
        print("Database users created/verified successfully!")

    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()