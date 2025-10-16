from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.shobeis_transaction import ShobeisTransaction
from app.utils.database import SessionLocal
from sqlalchemy import select, text
import math

# Tier multipliers
TIER_MULTIPLIERS = {
    'free': 1.0,
    'basic': 0.9,
    'pro': 0.7,
    'enterprise': 0.6
}


def get_pricing(conn, action_type: str):
    row = conn.execute(text("SELECT action_type, unit, base_shobeis, min_charge FROM pricing_table WHERE action_type = :a"), {'a': action_type}).fetchone()
    if not row:
        return None
    return {'action_type': row[0], 'unit': row[1], 'base_shobeis': row[2], 'min_charge': row[3]}


def estimate_analysis_cost(conn, words: int, plan: str):
    pricing = get_pricing(conn, 'ANALYSIS_PER_500')
    if not pricing:
        raise ValueError('Pricing for analysis not found')
    bucket = 500
    buckets = math.ceil(max(1, words) / bucket)
    raw = pricing['base_shobeis'] * buckets
    raw = max(raw, pricing['min_charge'])
    multiplier = TIER_MULTIPLIERS.get(plan, 1.0)
    final = math.ceil(raw * multiplier)
    return {'buckets': buckets, 'raw': raw, 'multiplier': multiplier, 'final': final}


def charge_for_analysis(db: Session, user_id: str, words: int, reference_id: str = None):
    # Atomic operation: load user, compute cost, check balance, write transaction
    conn = db.connection()
    user = db.query(User).filter(User.id == user_id).with_for_update().one_or_none()
    if not user:
        raise ValueError('User not found')

    plan = getattr(user, 'subscription_plan', 'free')
    estimate = estimate_analysis_cost(conn, words, plan)
    cost = estimate['final']

    if user.shobeis_balance < cost:
        raise ValueError('Insufficient Shobeis balance')

    before = user.shobeis_balance
    user.shobeis_balance = before - cost
    db.add(user)
    db.flush()

    tx = ShobeisTransaction(
        user_id=user.id,
        change=-cost,
        balance_before=before,
        balance_after=user.shobeis_balance,
        reason='ANALYSIS',
        reference_type='analysis',
        reference_id=reference_id,
        meta={'words': words}
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return {'transaction_id': tx.id, 'balance': user.shobeis_balance, 'cost': cost}

async def get_transaction_history(
    db: Session,
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    action_type: Optional[str] = None
) -> List[dict]:
    """Get paginated transaction history with filters"""
    query = db.query(ShobeisTransaction).filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    if action_type:
        query = query.filter_by(reason=action_type)
        
    transactions = query.order_by(ShobeisTransaction.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": tx.id,
            "amount": abs(tx.change),
            "action_type": tx.reason,
            "description": tx.reference_type,
            "created_at": tx.created_at,
            "status": "refunded" if tx.refunded else "completed",
            "metadata": tx.meta
        }
        for tx in transactions
    ]

async def process_payment(
    db: Session,
    user_id: str,
    amount: int,
    payment_method_id: str,
    currency: str = "USD"
) -> dict:
    """Process payment for Shobeis purchase"""
    user = db.query(User).filter_by(id=user_id).with_for_update().first()
    if not user:
        raise ValueError("User not found")
        
    # Convert currency to Shobeis
    shobeis_amount = amount * 1000  # $1 = 1000 Shobeis
    
    # Process payment (integrate with payment provider)
    # This is a placeholder for the actual payment processing
    payment_result = {
        "success": True,
        "transaction_id": "mock_transaction_123",
        "amount": amount,
        "currency": currency
    }
    
    if payment_result["success"]:
        before = user.shobeis_balance
        user.shobeis_balance += shobeis_amount
        db.flush()
        
        # Record transaction
        tx = ShobeisTransaction(
            user_id=user.id,
            change=shobeis_amount,
            balance_before=before,
            balance_after=user.shobeis_balance,
            reason='PURCHASE',
            reference_type='payment',
            reference_id=payment_result["transaction_id"],
            meta={
                "currency": currency,
                "original_amount": amount,
                "payment_method_id": payment_method_id
            }
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        
        return {
            "success": True,
            "new_balance": user.shobeis_balance,
            "transaction_id": tx.id
        }
    else:
        raise ValueError("Payment processing failed")

async def refund_transaction(
    db: Session,
    transaction_id: str,
    user_id: str,
    reason: str
) -> dict:
    """Process refund request"""
    # Verify transaction exists and belongs to user
    transaction = db.query(ShobeisTransaction).filter_by(
        id=transaction_id,
        user_id=user_id
    ).with_for_update().first()
    
    if not transaction:
        raise ValueError("Transaction not found")
        
    # Check if transaction is refundable
    if transaction.reason not in ["PURCHASE", "ANALYSIS"]:
        raise ValueError("Transaction type not eligible for refund")
        
    if transaction.refunded:
        raise ValueError("Transaction already refunded")
        
    # Process refund
    user = db.query(User).filter_by(id=user_id).with_for_update().first()
    
    before = user.shobeis_balance
    refund_amount = abs(transaction.change)
    
    # For purchases, we don't give back Shobeis
    # For service charges (like analysis), we do
    if transaction.reason == "ANALYSIS":
        user.shobeis_balance += refund_amount
    
    # Create refund record
    refund_tx = ShobeisTransaction(
        user_id=user_id,
        change=refund_amount if transaction.reason == "ANALYSIS" else 0,
        balance_before=before,
        balance_after=user.shobeis_balance,
        reason='REFUND',
        reference_type='refund',
        reference_id=transaction.id,
        meta={
            "original_transaction_id": transaction.id,
            "refund_reason": reason
        }
    )
    
    # Mark original as refunded
    transaction.refunded = True
    
    db.add(refund_tx)
    db.commit()
    db.refresh(refund_tx)
    
    return {
        "success": True,
        "refund_id": refund_tx.id,
        "amount": refund_amount,
        "new_balance": user.shobeis_balance
    }
