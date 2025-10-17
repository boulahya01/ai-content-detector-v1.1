"""Setup test database with initial schema and test data."""
from sqlalchemy import create_engine, text
from app.utils.security import get_password_hash

# Create database and tables
engine = create_engine('sqlite:///./test.db', connect_args={"check_same_thread": False})

try:
    # Create users table
    with engine.connect() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            user_type VARCHAR(20) DEFAULT 'FREE' NOT NULL,
            is_active BOOLEAN DEFAULT 1 NOT NULL,
            subscription_status VARCHAR(20) DEFAULT 'active' NOT NULL,
            subscription_start_date DATETIME,
            subscription_end_date DATETIME,
            billing_cycle_start DATETIME,
            billing_cycle_end DATETIME,
            shobeis_balance INTEGER DEFAULT 50 NOT NULL,
            monthly_refresh_amount INTEGER DEFAULT 0 NOT NULL
        )
        """))
        
        # Insert pro test user
        conn.execute(text("""
        INSERT OR REPLACE INTO users (
            id, email, password_hash, first_name, last_name,
            user_type, is_active, subscription_status,
            shobeis_balance, monthly_refresh_amount
        ) VALUES (
            'pro-test-id',
            'pro.test@aidetector.com',
            :password_hash,
            'Pro',
            'User',
            'PRO',
            1,
            'active',
            1000,
            1000
        )
        """), {
            'password_hash': get_password_hash("Test123!@#")
        })
        
        # Create pricing table
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS pricing_table (
            action_type VARCHAR PRIMARY KEY,
            unit VARCHAR NOT NULL,
            base_shobeis INTEGER NOT NULL,
            min_charge INTEGER NOT NULL
        )
        """))
        
        # Insert pricing data
        conn.execute(text("""
        INSERT OR REPLACE INTO pricing_table (
            action_type, unit, base_shobeis, min_charge
        ) VALUES (
            'word_analysis',
            'WORD',
            1,
            10
        )
        """))
        
        conn.commit()
        print("Test database setup complete")
        print("- Pro test user created/updated")
        print("- Pricing configuration added")

except Exception as e:
    print(f"Error setting up test database: {e}")
    raise