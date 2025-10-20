from datetime import datetime, timedelta, timezone
import random
import uuid
from sqlalchemy.orm import Session
from app.utils.database import get_db, Base
from app.utils.security import get_password_hash
from app.models.user import User, UserRole
from app.models.shobeis_transaction import ShobeisTransaction, TransactionType



def create_test_pro_user(db: Session):
    """Create a pro test user with rich transaction history"""
    # Drop and recreate tables using Base metadata
    Base.metadata.drop_all(db.get_bind())
    Base.metadata.create_all(db.get_bind())
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email="pro.test@aidetector.com",
        password_hash=get_password_hash("Test123!@#"),
        user_type=UserRole.PRO.value,
        subscription_status="active",
        shobeis_balance=5000,
        bonus_balance=0,
        monthly_refresh_amount=1000,
        last_refresh_date=datetime.now(timezone.utc) - timedelta(days=15),
        is_active=True,
        first_name="Test",
        last_name="Pro User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate 3 months of transaction history
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90)
    current_date = start_date
    
    transactions = []
    balance = 5000
    
    # Define transaction types with their frequencies and amounts
    tx_types = [
        (TransactionType.CHARGE, -20, 0.4),  # 40% chance, costs 20 tokens
        (TransactionType.PURCHASE, 1000, 0.1),      # 10% chance, adds 1000 tokens
        (TransactionType.MONTHLY_REFRESH, 1000, 0.05), # 5% chance, monthly refresh
        (TransactionType.BONUS, 100, 0.05)   # 5% chance, bonus
    ]
    
    while current_date <= end_date:
        # Add 0-3 transactions per day
        for _ in range(random.randint(0, 3)):
            # Choose transaction type based on probability
            rand = random.random()
            cumulative_prob = 0
            chosen_tx = None
            
            for tx_type, amount, prob in tx_types:
                cumulative_prob += prob
                if rand <= cumulative_prob:
                    chosen_tx = (tx_type, amount)
                    break
            
            if chosen_tx is None:
                continue
                
            tx_type, amount = chosen_tx
            
            # Create transaction
            tx = ShobeisTransaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                transaction_type=tx_type,
                amount=amount,
                balance_before=balance,
                balance_after=balance + amount,
                description=f"Test {tx_type.value.lower()} transaction",
                meta={
                    'test_data': True,
                    'transaction_type': tx_type.value
                },
                created_at=current_date + timedelta(
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
            )
            transactions.append(tx)
            balance += amount
            
        current_date += timedelta(days=1)
    
    # Add all records to database
    db.add_all(transactions)
    db.commit()
    
    # Add all records to database
    db.add_all(transactions)
    db.commit()

    # Update user's final balance
    user.shobeis_balance = balance
    db.commit()
    
    print(f"""
Test Pro User Created Successfully:
--------------------------------
Email: pro.test@aidetector.com
Password: Test123!@#
Role: Pro
Current Shobeis Balance: {balance}

Account Details:
- Pro subscription tier
- {len(transactions)} transactions over 3 months
- Monthly refresh amount: 1000 Shobeis
- Last refresh: 15 days ago
- Various transaction types including purchases and analysis
    """)

if __name__ == "__main__":
    db = next(get_db())
    create_test_pro_user(db)