from fastapi import APIRouter, Depends, HTTPException
from ..utils.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/status")
def get_subscription_status(db: Session = Depends(get_db)):
    """Return a placeholder subscription status for the current user.

    The frontend expects an endpoint at /api/subscriptions/status; for now return
    a basic object so the UI can render without errors.
    """
    try:
        # Placeholder response - integrate with real user/session in future
        return {
            "subscription": {
                "tier": "free",
                "expires_at": None,
                "credits_remaining": 5
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
