from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..models.user import User
from ..models.shobeis_transaction import ShobeisTransaction, TransactionType
from ..utils.database import get_db
from ..utils.security import get_current_user
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/credits", tags=["credits"])

class CreditBalance(BaseModel):
    balance: int
    last_updated: datetime

class CreditTransaction(BaseModel):
    id: str
    amount: int
    type: str
    created_at: datetime
    meta: dict

@router.get("/balance", response_model=CreditBalance)
def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's credit balance."""
    try:
        return {
            "balance": current_user.credits,
            "last_updated": current_user.last_credit_update
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[CreditTransaction])
def get_credit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the user's credit transaction history."""
    try:
        transactions = db.query(ShobeisTransaction)\
            .filter(ShobeisTransaction.user_id == current_user.id)\
            .order_by(ShobeisTransaction.created_at.desc())\
            .all()

        return [
            {
                "id": str(tx.id),
                "amount": tx.amount,
                "type": tx.transaction_type.value,
                "created_at": tx.created_at,
                "meta": tx.meta
            }
            for tx in transactions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deduct")
def deduct_credits(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deduct credits from the user's balance."""
    try:
        if current_user.credits < amount:
            raise HTTPException(status_code=400, detail="Insufficient credits")

        # Create transaction first
        transaction = ShobeisTransaction.create(
            db=db,
            user=current_user,
            amount=-amount,
            transaction_type=TransactionType.USAGE,
            meta={"reason": "Content analysis"}
        )

        # Update user's credit balance
        current_user.credits -= amount
        current_user.last_credit_update = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "remaining_credits": current_user.credits,
            "transaction_id": str(transaction.id)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refund/{transaction_id}")
def refund_credits(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refund credits from a previous transaction."""
    try:
        # Find the original transaction
        transaction = db.query(ShobeisTransaction)\
            .filter(
                ShobeisTransaction.id == transaction_id,
                ShobeisTransaction.user_id == current_user.id
            ).first()

        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        if transaction.is_refunded:
            raise HTTPException(status_code=400, detail="Transaction already refunded")

        # Create refund transaction
        refund = transaction.refund(
            db,
            "Manual refund"
        )

        db.commit()
        return {"success": True, "refund_id": str(refund.id)}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))