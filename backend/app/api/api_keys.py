from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid
import secrets
from ..models.user import User
from ..models.api_key import ApiKey
from ..utils.database import get_db
from ..utils.security import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/api-keys", tags=["api-keys"])

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key: str
    created_at: datetime
    last_used: datetime | None

    class Config:
        from_attributes = True

def generate_api_key() -> str:
    """Generate a secure API key."""
    return f"ai_{secrets.token_urlsafe(32)}"

@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all API keys for the current user."""
    api_keys = db.query(ApiKey)\
        .filter(ApiKey.user_id == current_user.id)\
        .all()
    return api_keys

@router.post("", response_model=ApiKeyResponse)
async def create_api_key(
    api_key: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key."""
    # Check if user has reached their API key limit
    key_count = db.query(ApiKey)\
        .filter(ApiKey.user_id == current_user.id)\
        .count()

    key_limits = {
        'free': 1,
        'pro': 5,
        'enterprise': 25
    }

    limit = key_limits.get(current_user.subscription_tier, 1)
    if key_count >= limit:
        raise HTTPException(
            status_code=400,
            detail=f"You have reached the maximum number of API keys for your plan ({limit})"
        )

    # Create new API key
    new_key = ApiKey(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=api_key.name,
        key=generate_api_key(),
        created_at=datetime.utcnow()
    )

    db.add(new_key)
    db.commit()
    db.refresh(new_key)

    return new_key

@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an API key."""
    key = db.query(ApiKey)\
        .filter(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        ).first()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    db.delete(key)
    db.commit()

    return {"status": "success", "message": "API key deleted successfully"}

@router.post("/{key_id}/revoke")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an API key by replacing it with a new one."""
    key = db.query(ApiKey)\
        .filter(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id
        ).first()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    # Generate and save new key
    key.key = generate_api_key()
    db.commit()
    db.refresh(key)

    return key