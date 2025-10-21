from typing import Optional, Dict, Any, Tuple, List, Union
from sqlalchemy import Column
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.user import User, UserType
from app.models.shobeis_transaction import ShobeisTransaction, TransactionType, TransactionStatus
from app.models.user_analytics import UserAnalytics
import math


class InsufficientShobeisError(Exception):
    pass


class UserLimitExceededError(Exception):
    pass


class ShobeisService:
    def __init__(self, db: Session):
        self.db = db

    def get_pricing(self, action_type: str) -> Optional[Dict[str, Any]]:
        """Get pricing configuration for an action type"""
        row = self.db.execute(
            text("SELECT action_type, unit, base_shobeis, min_charge FROM pricing_table WHERE action_type = :a"), 
            {'a': action_type}
        ).fetchone()
        
        if not row:
            return None
            
        return {
            'action_type': row[0], 
            'unit': row[1], 
            'base_shobeis': row[2], 
            'min_charge': row[3]
        }

    def calculate_cost(self, action_type: str, quantity: int, user: User) -> int:
        """Calculate the cost of an action based on user type and quantity"""
        pricing = self.get_pricing(action_type)
        if not pricing:
            raise ValueError(f"Pricing not configured for action type: {action_type}")

        # Calculate base cost based on units
        unit = pricing['unit']
        # If unit is a string (e.g., 'WORD'), set bucket_size to 1
        try:
            bucket_size = int(unit)
        except ValueError:
            # For word-based actions, treat each word as a unit
            bucket_size = 1
        buckets = math.ceil(max(1, quantity) / bucket_size)
        base_cost = pricing['base_shobeis'] * buckets

        # Apply minimum charge
        base_cost = max(base_cost, pricing['min_charge'])

        # Apply user type discount
        discount = user.get_discount_rate()
        final_cost = math.ceil(base_cost * (1 - discount))

        # Ensure minimum cost is 1 Shobei
        return max(final_cost, 1)

    def check_limits(self, user: User, action_type: str, quantity: int = 1) -> Tuple[bool, str]:

        """Check if the action is within user's limits"""
        limits = user.get_usage_limits()
        current_date = datetime.now(UTC)
        
        # Get current billing cycle analytics
        analytics = self.db.query(UserAnalytics).filter(
            UserAnalytics.user_id == user.id,
            UserAnalytics.date >= user.billing_cycle_start,
            UserAnalytics.date <= user.billing_cycle_end
        ).all()

        if action_type == 'word_analysis':
            current_words = sum(a.words_analyzed for a in analytics)
            if current_words + quantity > limits['words_per_month']:
                return False, f"Word analysis limit exceeded: {current_words}/{limits['words_per_month']}"

        elif action_type == 'api_call':
            current_calls = sum(a.api_calls for a in analytics)
            if current_calls + quantity > limits['api_calls_per_month']:
                return False, f"API call limit exceeded: {current_calls}/{limits['api_calls_per_month']}"

        elif action_type == 'export':
            current_exports = sum(a.exports for a in analytics)
            if current_exports + quantity > limits['exports_per_month']:
                return False, f"Export limit exceeded: {current_exports}/{limits['exports_per_month']}"

        return True, ""

    def get_transaction_history(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        status: Optional[str] = None,
        action_type: Optional[str] = None
    ) -> List[dict]:
        """Get paginated transaction history with filters"""
        query = self.db.query(ShobeisTransaction).filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        if action_type:
            query = query.filter_by(transaction_type=action_type)
            
        transactions = query.order_by(ShobeisTransaction.created_at.desc()).offset(offset).limit(limit).all()
        
        return [
            {
                "id": tx.id,
                "amount": abs(tx.amount) if tx.amount is not None else 0,
                "transaction_type": tx.transaction_type.value,
                "description": tx.description,
                "created_at": tx.created_at,
                "status": tx.status.value,
                "meta": tx.meta
            }
            for tx in transactions
        ]

    def process_payment(
        self,
        user_id: str,
        amount: int,
        payment_method_id: str,
        currency: str = "USD"
    ) -> Dict[str, Any]:
        """Process payment for Shobeis purchase"""
        user = self.db.query(User).filter_by(id=user_id).with_for_update().first()
        if not user:
            raise ValueError("User not found")
            
        # Convert currency to Shobeis (configurable rate)
        shobeis_per_usd = 1000  # This should come from config
        shobeis_amount = amount * shobeis_per_usd
        
        # Process payment (integrate with payment provider)
        # This is a placeholder for the actual payment processing
        payment_result = {
            "success": True,
            "transaction_id": "mock_transaction_123",
            "amount": amount,
            "currency": currency
        }
        
        if payment_result["success"]:
            # Create purchase transaction
            tx = self.process_transaction(
                user=user,
                amount=shobeis_amount,
                transaction_type=TransactionType.PURCHASE,
                description=f"Purchase {amount} {currency}",
                meta={
                    "currency": currency,
                    "original_amount": amount,
                    "payment_method_id": payment_method_id,
                    "conversion_rate": shobeis_per_usd
                }
            )
            
            return {
                "success": True,
                "new_balance": getattr(user, 'shobeis_balance', 0) or 0,
                "transaction_id": tx.id,
                "shobeis_amount": shobeis_amount
            }
        else:
            raise ValueError("Payment processing failed")

    def process_transaction(
        self,
        user: User,
        amount: int,
        transaction_type: TransactionType,
        description: Optional[str] = None,
        meta: Optional[Dict[str, Any]] = None,
        idempotency_key: Optional[str] = None,
    ) -> ShobeisTransaction:
        """Core low-level transaction processing. Positive amounts credit, negative debit."""
        # Idempotency check
        if idempotency_key:
            existing = self.db.query(ShobeisTransaction).filter_by(idempotency_key=idempotency_key).first()
            if existing:
                return existing

        # Re-fetch the user within this DB session to ensure we operate on the same managed instance
        db_user = self.db.query(User).filter_by(id=str(user.id)).with_for_update().first()
        if not db_user:
            raise ValueError("User not found")

        # For debits, ensure sufficient funds using DB-backed user
        if amount < 0 and (int(getattr(db_user, 'shobeis_balance', 0) or 0) + int(getattr(db_user, 'bonus_balance', 0) or 0)) < abs(amount):
            # Debug: print balances to help diagnose failing tests
            try:
                print(f"[DEBUG] Insufficient funds check: db_user.shobeis_balance={getattr(db_user,'shobeis_balance',None)}, bonus={getattr(db_user,'bonus_balance',None)}, amount={amount}")
            except Exception:
                pass
            raise InsufficientShobeisError("Insufficient Shobeis balance")

        # Create transaction based on the DB-backed user so balance_before/after are accurate and changes persist
        tx = ShobeisTransaction.create(self.db, db_user, amount, transaction_type, description=description, meta=meta, idempotency_key=idempotency_key)
        self.db.add(tx)
        self.db.flush()

        # Update analytics table
        today = datetime.now(UTC).date()
        analytics = self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).first()
        if not analytics:
            analytics = UserAnalytics(user_id=user.id, date=today)
            self.db.add(analytics)

        if amount < 0:
            if analytics.shobeis_spent is None:
                # Update analytics using SQLAlchemy's update
                self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).update(
                    {UserAnalytics.shobeis_spent: float(abs(amount))}, synchronize_session=False
                )
        else:
            if analytics.shobeis_earned is None:
                # Update analytics using SQLAlchemy's update
                self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).update(
                    {UserAnalytics.shobeis_earned: float(amount)}, synchronize_session=False
                )

        # If metadata includes action_type/quantity, account them
        if meta:
            action_type = meta.get('action_type')
            qty = int(meta.get('quantity', 1))
            if action_type == 'word_analysis':
                if analytics.words_analyzed is None:
                    # Update words_analyzed using SQLAlchemy
                    self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).update(
                        {UserAnalytics.words_analyzed: UserAnalytics.words_analyzed + qty}, 
                        synchronize_session=False
                    )
            elif action_type == 'api_call':
                if analytics.api_calls is None:
                    # Update api_calls using SQLAlchemy
                    self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).update(
                        {UserAnalytics.api_calls: UserAnalytics.api_calls + qty}, 
                        synchronize_session=False
                    )
            elif action_type == 'export':
                if analytics.exports is None:
                    # Update exports using SQLAlchemy
                    self.db.query(UserAnalytics).filter_by(user_id=user.id, date=today).update(
                        {UserAnalytics.exports: UserAnalytics.exports + qty}, 
                        synchronize_session=False
                    )
        self.db.add(analytics)
        # Persist both user balance update (done in ShobeisTransaction.create) and transaction/analytics
        self.db.commit()
        self.db.refresh(tx)
        return tx

    def process_charge(self, user: User, action_type: str, quantity: int = 1, idempotency_key: Optional[str] = None, meta: Optional[Dict[str, Any]] = None) -> bool:
        """High-level convenience for charging a user for an action using new balance logic."""
        cost = self.calculate_cost(action_type, quantity, user)
        try:
            print(f"[DEBUG] process_charge: user_id={getattr(user,'id',None)} user_balance={getattr(user,'shobeis_balance',None)} monthly={getattr(user,'monthly_balance',None)} bonus={getattr(user,'bonus_balance',None)} cost={cost}")
        except Exception:
            pass
        if not user.deduct_balance(cost, self.db):
            raise InsufficientShobeisError("Insufficient balance (monthly, bonus, and main)")
        # Optionally, add a transaction record for the charge (already handled in deduct_balance)
        self.db.commit()
        return True

    def process_refund(self, transaction_id: str, reason: str, meta: Optional[Dict[str, Any]] = None) -> ShobeisTransaction:
        orig = self.db.query(ShobeisTransaction).filter_by(id=transaction_id).first()
        if not orig:
            raise ValueError("Original transaction not found")
        if str(orig.transaction_type) != str(TransactionType.CHARGE):
            # only allow refunding charges in this helper
            raise ValueError("Only charge transactions can be refunded via this helper")

        user = self.db.query(User).filter_by(id=orig.user_id).with_for_update().first()
        refund_amount = abs(orig.amount) if orig.amount is not None else 0
        tx = self.process_transaction(user=user, amount=refund_amount, transaction_type=TransactionType.REFUND, description=f"Refund for {orig.id}", meta={'original_transaction_id': orig.id, 'reason': reason})
        
        # Update status using SQLAlchemy
        self.db.query(ShobeisTransaction).filter_by(id=orig.id).update({"status": TransactionStatus.REFUNDED.value})
        self.db.add(orig)
        self.db.commit()
        return tx

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
    
    # Safely handle user and transaction attributes
    if not user:
        raise ValueError("User not found")
        
    before = getattr(user, 'shobeis_balance', 0) or 0
    refund_amount = abs(int(transaction.change)) if transaction.change else 0
    
    # For purchases, we don't give back Shobeis
    # For service charges (like analysis), we do
    if transaction.reason == "ANALYSIS":
        # Update shobeis_balance using SQLAlchemy
        db.query(User).filter_by(id=user_id).update(
            {"shobeis_balance": User.shobeis_balance + refund_amount}
        )
        db.refresh(user)
    
    # Create refund record
    refund_tx = ShobeisTransaction(
        user_id=user_id,
        change=refund_amount if transaction.reason == "ANALYSIS" else 0,
        balance_before=before,
        balance_after=getattr(user, 'shobeis_balance', 0) or 0,
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
        "new_balance": getattr(user, 'shobeis_balance', 0) or 0
    }
