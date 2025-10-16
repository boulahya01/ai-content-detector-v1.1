"""
Dev seed script for SHOBEIS pricing and test balances.
This script is intended for local/dev only. Production should use Alembic migrations.

What it does:
- Ensures users table has SHB-related columns (if missing, adds via SQL ALTER TABLE)
- Creates a simple pricing_table if missing
- Credits sample users (admin/pro/free) with starting SHB for testing

Run with:
PYTHONPATH=$(pwd) python3 seed_shobeis.py
"""

import sqlite3
import os
from app.utils.database import get_db_url
from app.utils.security import get_password_hash
from app.models.user import User, UserRole
from app.utils.database import Base, engine, SessionLocal
from sqlalchemy import text
from datetime import datetime

DB_PATH = get_db_url()

# Simple pricing entries
PRICING_ENTRIES = [
    ("ANALYSIS_PER_500", "per_500_words", 10, 5),  # base 10 SHB per 500 words, min charge 5
    ("UPLOAD_TXT", "per_file", 10, 10),
    ("UPLOAD_DOC", "per_file", 15, 15),
    ("EXPORT_CSV", "per_export", 20, 20),
    ("EXPORT_JSON", "per_export", 30, 30),
    ("API_CALL", "per_call", 5, 1),
    ("DETAILED_REPORT", "per_action", 25, 1),
    ("PLAGIARISM_CHECK", "per_action", 40, 1),
]


def ensure_columns():
    # Add columns to users table if they don't exist (development convenience)
    conn = engine.connect()
    insp = engine.dialect.get_columns(conn, 'users')
    col_names = {c['name'] for c in insp}

    with engine.begin() as conn:
        if 'shobeis_balance' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN shobeis_balance INTEGER DEFAULT 0"))
        if 'shobeis_total_allocated' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN shobeis_total_allocated INTEGER DEFAULT 0"))
        if 'shobeis_rollover' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN shobeis_rollover INTEGER DEFAULT 0"))
        if 'shobeis_last_allocation_at' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN shobeis_last_allocation_at DATETIME"))
        if 'subscription_plan' not in col_names:
            conn.execute(text("ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free'"))

    conn.close()


def create_pricing_table():
    # Create pricing_table if not exists
    with engine.begin() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS pricing_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT NOT NULL,
            unit TEXT NOT NULL,
            base_shobeis INTEGER NOT NULL,
            min_charge INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """))

        # Seed entries if empty
        rows = conn.execute(text("SELECT count(*) as cnt FROM pricing_table")).fetchone()
        # SQLAlchemy may return a tuple; access by index 0
        if rows and rows[0] == 0:
            for action_type, unit, base, minc in PRICING_ENTRIES:
                conn.execute(text("INSERT INTO pricing_table (action_type, unit, base_shobeis, min_charge) VALUES (:a, :u, :b, :m)"), [{'a': action_type, 'u': unit, 'b': base, 'm': minc}])


def credit_test_users():
    session = SessionLocal()
    try:
        users = {
            'admin@aidetector.com': {'role': UserRole.ADMIN, 'balance': 99999, 'plan': 'enterprise'},
            'pro@example.com': {'role': UserRole.PRO, 'balance': 2000, 'plan': 'pro'},
            'free@example.com': {'role': UserRole.FREE, 'balance': 50, 'plan': 'free'},
        }
        for email, info in users.items():
            user = session.query(User).filter(User.email == email).first()
            if user:
                user.shobeis_balance = info['balance']
                user.shobeis_total_allocated = info['balance']
                user.subscription_plan = info['plan']
                session.add(user)
            else:
                # create a simple user
                u = User(
                    email=email,
                    password_hash=get_password_hash('Test123!'),
                    first_name=email.split('@')[0],
                    last_name='dev',
                    role=info['role'],
                    is_active=True,
                    credits=5,
                    requests_count=0,
                    shobeis_balance=info['balance'],
                    shobeis_total_allocated=info['balance'],
                    subscription_plan=info['plan']
                )
                session.add(u)
        session.commit()
        print('Seeded test users and balances')
    except Exception as e:
        print('Error seeding users:', e)
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    print('Running SHOBEIS seed...')
    ensure_columns()
    create_pricing_table()
    credit_test_users()
    print('Done.')
