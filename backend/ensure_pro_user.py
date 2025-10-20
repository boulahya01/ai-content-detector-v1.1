"""Ensure the pro test user exists in the configured database.

Run this after switching DATABASE_URL or when you want to guarantee the pro test user is present.
Usage:
    python ensure_pro_user.py
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use app utils to respect configured DATABASE_URL
from app.utils.database import DATABASE_URL

os.environ.setdefault('DATABASE_URL', DATABASE_URL)

from app.models.user import User, UserRole
from app.utils.security import get_password_hash
from app.utils.database import Base


def ensure_pro_user():
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        user = session.query(User).filter_by(email='pro.test@aidetector.com').first()
        if not user:
            user = User(
                email='pro.test@aidetector.com',
                password_hash=get_password_hash('Test123!@#'),
                user_type=UserRole.PRO.value if hasattr(UserRole, 'PRO') else 'PRO',
                is_active=True,
                shobeis_balance=1000,
                monthly_refresh_amount=1000,
            )
            session.add(user)
            session.commit()
            print('Pro test user created')
        else:
            user.user_type = UserRole.PRO.value if hasattr(UserRole, 'PRO') else 'PRO'
            user.shobeis_balance = 1000
            user.monthly_refresh_amount = 1000
            session.commit()
            print('Pro test user updated')
    finally:
        session.close()


if __name__ == '__main__':
    ensure_pro_user()
