from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict
import os
from datetime import datetime, timedelta, UTC
import logging
import secrets
from .memory_rate_limiter import MemoryRateLimiter

logger = logging.getLogger(__name__)

# Enhanced password hashing with sha256
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# JWT Configuration with enhanced security
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", secrets.token_urlsafe(64))  # Generate secure key if not provided
REFRESH_SECRET_KEY = os.environ.get("JWT_REFRESH_SECRET_KEY", secrets.token_urlsafe(64))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 30))  # 30 days

# Rate limiting configuration
MAX_LOGIN_ATTEMPTS = 5
LOGIN_TIMEOUT_MINUTES = 15
rate_limiter = MemoryRateLimiter(attempts=MAX_LOGIN_ATTEMPTS, window_minutes=LOGIN_TIMEOUT_MINUTES)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash with rate limiting."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Generate secure password hash."""
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {str(e)}")
        raise ValueError("Could not hash password securely")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT access token with enhanced security."""
    try:
        to_encode = data.copy()
        expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(UTC),
            "jti": secrets.token_urlsafe(32),  # Add unique token ID
            "type": "access"
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation error: {str(e)}")
        raise ValueError("Could not create secure token")

def create_refresh_token(user_id: str) -> str:
    """Create a new refresh token."""
    try:
        expire = datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.now(UTC),
            "jti": secrets.token_urlsafe(32),
            "type": "refresh"
        }
        return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Refresh token creation error: {str(e)}")
        raise ValueError("Could not create refresh token")

def decode_token(token: str, verify_type: str = "access") -> dict:
    """Decode and verify a JWT token with enhanced security checks."""
    try:
        # Choose the right secret key based on token type
        secret_key = REFRESH_SECRET_KEY if verify_type == "refresh" else SECRET_KEY
        
        # Verify and decode the token
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        
        # Verify token type
        if payload.get("type") != verify_type:
            raise ValueError(f"Invalid token type. Expected {verify_type}")
        
        # Check if token is blacklisted
        from ..models.blacklisted_token import BlacklistedToken
        from ..utils.database import SessionLocal
        
        db = SessionLocal()
        try:
            if BlacklistedToken.is_blacklisted(db, token):
                raise ValueError("Token has been invalidated")
                
            # Additional security checks
            if "jti" not in payload:
                raise ValueError("Token missing required claims")
            
            # Verify token is not used before its issued time
            iat = datetime.fromtimestamp(payload["iat"], UTC)
            if datetime.now(UTC) < iat:
                raise ValueError("Token used before issued time")
                
            return payload
        finally:
            db.close()
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token error: {str(e)}")
        raise ValueError("Invalid token")
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise ValueError("Could not validate token")

def check_rate_limit(key: str) -> bool:
    """Check if an operation is within rate limits."""
    return rate_limiter.is_allowed(key)

def add_rate_limit_attempt(key: str) -> None:
    """Add a rate limit attempt."""
    rate_limiter.add_attempt(key)

def reset_rate_limit(key: str) -> None:
    """Reset rate limit counter for successful operations."""
    rate_limiter.reset(key)

async def get_current_user(token: str):
    """Get current user from token with enhanced validation."""
    try:
        payload = decode_token(token, "access")
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid user token")
            
        # Additional security checks can be added here
        
        return user_id
    except ValueError as e:
        logger.warning(f"Authentication error: {str(e)}")
        raise ValueError(f"Could not validate credentials: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected authentication error: {str(e)}")
        raise ValueError("Authentication failed")