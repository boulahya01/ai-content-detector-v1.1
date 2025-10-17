from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, UTC
import uuid

from ..models.user import User, UserRole
from ..models.blacklisted_token import BlacklistedToken
from ..utils.database import get_db
from ..utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token
)

router = APIRouter()
# tokenUrl should be the full path where the token is issued
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pydantic models for request/response
from pydantic import validator
from enum import Enum

# Use UserRole from models
from ..models.user import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    # Accept either full_name or separate first_name/last_name
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c for c in v if not c.isalnum()):
            raise ValueError('Password must contain at least one special character')
        return v

class UserResponse(BaseModel):
    id: str
    email: str
    user_type: UserRole = UserRole.FREE  # UserRole is alias for UserType
    full_name: str
    is_active: bool = True
    shobeis_balance: int = 0

    class Config:
        orm_mode = True
        
    @validator('full_name', pre=True)
    def set_full_name(cls, v, values):
        if hasattr(v, '__call__'):  # if it's a method
            return v()
        return v or values.get('email', '')

class Token(BaseModel):
    access_token: str
    token_type: str

# Authentication endpoints
from fastapi.responses import JSONResponse
from fastapi.requests import Request


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Determine names
    first_name = user_data.first_name
    last_name = user_data.last_name
    full_name = user_data.full_name
    if not full_name:
        if first_name and last_name:
            full_name = f"{first_name} {last_name}".strip()
        elif first_name:
            full_name = first_name
        else:
            full_name = user_data.email
    if full_name and (not first_name and not last_name):
        parts = full_name.strip().split()
        if parts:
            first_name = parts[0]
            last_name = ' '.join(parts[1:]) if len(parts) > 1 else None

    user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        user_type=UserRole.FREE.value,  # Use string value for DB
        is_active=True,
        shobeis_balance=50,
        first_name=first_name,
        last_name=last_name
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )
    # Always set full_name for serialization
    user_dict = {
        "id": user.id,
        "email": user.email,
        "user_type": user.user_type,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "shobeis_balance": user.shobeis_balance
    }
    return user_dict

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    expires_in: int = 86400  # 24 hours in seconds

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token and user data."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found with this email",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.password_hash or not verify_password(form_data.password, str(user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user.last_login = datetime.now(UTC)
    db.commit()
    db.refresh(user)
    user_dict = {
        "id": user.id,
        "email": user.email,
        "user_type": user.user_type,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "shobeis_balance": user.shobeis_balance
    }
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
        "expires_in": 86400
    }

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user."""
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current user and verify they have admin privileges."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    """Create a new access token using the current valid token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    try:
        # Verify current token
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        # Create new token
        access_token = create_access_token(
            data={"sub": user_id},
            expires_delta=timedelta(days=1)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and invalidate their current token."""
    # Get token from authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    
    # Add token to blacklist
    blacklist_token = BlacklistedToken(
        token=token,
        user_id=current_user.id,
        expires_at=datetime.fromtimestamp(payload["exp"])
    )
    db.add(blacklist_token)
    db.commit()
    return {"message": "Successfully logged out"}
