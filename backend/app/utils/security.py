from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
import os
import jwt
from datetime import datetime, timedelta, UTC
from typing import Optional

# Use passlib for password hashing (ensure passlib is installed)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))  # 24 hours

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(UTC),  # Add issued-at time
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # jwt.encode returns a str in PyJWT v2
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        # First verify and decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Then check if token is blacklisted
        from ..models.blacklisted_token import BlacklistedToken
        from ..utils.database import SessionLocal
        
        db = SessionLocal()
        try:
            if BlacklistedToken.is_blacklisted(db, token):
                raise ValueError("Token has been invalidated")
            return payload
        finally:
            db.close()
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

async def get_current_user(token: str):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Invalid token")
        return user_id
    except ValueError as e:
        raise ValueError(f"Could not validate credentials: {str(e)}")