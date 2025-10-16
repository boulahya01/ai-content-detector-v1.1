from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

from ..models.user import User, UserRole
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
    role: UserRole = UserRole.FREE
    full_name: str
    subscription_tier: str = "free"
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
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Determine first and last name from provided fields
    first_name = user_data.first_name
    last_name = user_data.last_name
    if user_data.full_name and (not first_name and not last_name):
        parts = user_data.full_name.strip().split()
        if parts:
            first_name = parts[0]
            last_name = ' '.join(parts[1:]) if len(parts) > 1 else None

    # Create new user with minimal schema
    user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=UserRole.FREE,
        subscription_tier="free",
        is_active=True,
        shobeis_balance=50,  # Default free balance
        first_name=first_name,
        last_name=last_name
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        # Set the full_name using the method directly
        setattr(user, "full_name", user.full_name())
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )
    return user

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    expires_in: int = 86400  # 24 hours in seconds

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token and user data."""
    # Find user
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
    
    # Update last_login and generate token
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)
    # ensure full_name is available as an attribute for Pydantic serialization
    try:
        setattr(user, "full_name", user.full_name())
    except Exception:
        pass
    
    # Generate token (ensure sub is a string)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "expires_in": 86400  # 24 hours in seconds
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

@router.post("/logout")
async def logout():
    """Logout user."""
    return {"message": "Successfully logged out"}
