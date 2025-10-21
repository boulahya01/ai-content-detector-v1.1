#!/usr/bin/env python3
"""Create a test user directly in the DB with the correct hashed password.

Usage: python backend/create_cli_user.py
"""
import os
from datetime import datetime, timedelta, UTC

os.environ.setdefault('DATABASE_URL', 'sqlite:///./backend.db')

from app.utils.database import SessionLocal
from app.models.user import User, UserType, SubscriptionStatus
from app.utils.security import get_password_hash
import uuid

EMAIL = os.environ.get('CLI_USER_EMAIL', 'cli_test_user@example.com')
PASSWORD = os.environ.get('CLI_USER_PASSWORD', 'StrongPass1!')

def create_user(email: str, password: str):
    db = SessionLocal()
    try:
        # Check existing
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User already exists: {email} (id={existing.id})")
            return existing

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=get_password_hash(password),
            first_name='CLI',
            last_name='User',
            user_type=UserType.FREE.value,
            is_active=True,
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_start_date=datetime.now(UTC),
            subscription_end_date=datetime.now(UTC) + timedelta(days=30),
            shobeis_balance=100,
            monthly_balance=100,
            bonus_balance=50,
            monthly_refresh_amount=100,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {email} (id={user.id})")
        return user
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    u = create_user(EMAIL, PASSWORD)
    # Print the row from sqlite for quick verification
    print('Done.')
