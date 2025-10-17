from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.utils.database import get_db
from app.services.shobeis_service import ShobeisService, InsufficientShobeisError
from app.models.user import User, UserType

router = APIRouter(tags=["shobeis"])


class EstimateRequest(BaseModel):
    action_type: str
    quantity: int = 1


class ChargeRequest(BaseModel):
    action_type: str
    quantity: int = 1
    idempotency_key: Optional[str] = None


class PurchaseRequest(BaseModel):
    amount: int
    payment_method_id: str
    currency: str = "USD"


@router.get("/shobeis/balance")
@router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    # Set monthly_refresh_amount based on user_type
    monthly_refresh = 1000 if current_user.user_type == UserType.PRO.value else 0
    
    return {
        "balance": getattr(current_user, 'shobeis_balance', 0),
        "bonus": getattr(current_user, 'bonus_balance', 0),
        "user_type": getattr(current_user, 'user_type', None),
        "monthly_refresh_amount": monthly_refresh
    }


@router.post("/shobeis/estimate")
@router.post("/estimate")
async def estimate_cost(req: EstimateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ShobeisService(db)
    cost = svc.calculate_cost(req.action_type, req.quantity, current_user)
    return {"cost": cost, "action_type": req.action_type, "quantity": req.quantity}


@router.post("/shobeis/charge")
@router.post("/charge")
async def charge(req: ChargeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ShobeisService(db)
    try:
        balance_before = current_user.shobeis_balance
        tx = svc.process_charge(user=current_user, action_type=req.action_type, quantity=req.quantity, idempotency_key=req.idempotency_key)
        # refresh current_user from the session to reflect changes
        db.refresh(current_user)
        balance_after = current_user.shobeis_balance
    except InsufficientShobeisError:
        raise HTTPException(status_code=402, detail="Insufficient balance")
    return {
        "transaction_id": tx.id,
        "balance": balance_after,
        "amount": getattr(tx, 'amount', None),
        "balance_before": balance_before,
        "balance_after": balance_after
    }


@router.get("/shobeis/transactions")
@router.get("/transactions")
async def transactions(limit: int = 50, offset: int = 0, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ShobeisService(db)
    items = svc.get_transaction_history(user_id=current_user.id, limit=limit, offset=offset)
    return {"transactions": items}


@router.post("/shobeis/purchase")
@router.post("/purchase")
async def purchase(req: PurchaseRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ShobeisService(db)
    res = svc.process_payment(user_id=current_user.id, amount=req.amount, payment_method_id=req.payment_method_id, currency=req.currency)
    return res
