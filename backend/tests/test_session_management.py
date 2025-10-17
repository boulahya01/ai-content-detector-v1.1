import pytest
from fastapi.testclient import TestClient
from app.main import app
from tests.fixtures import test_user
from app.models.user import User
from datetime import datetime, timedelta
from app.utils.security import create_access_token, decode_token
import time
import jwt

client = TestClient(app)

# Remove unnecessary setup fixture since we're now using test_user directly

def test_token_expiration(test_user):
    """Test that access tokens expire correctly"""
    # Create a token that expires in 1 second
    token = create_access_token(
        data={"sub": str(test_user.id)},  # Use actual test user ID
        expires_delta=timedelta(seconds=1)
    )
    
    # Token should be valid initially
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    
    # Wait for token to expire
    time.sleep(2)
    
    # Token should be invalid after expiration
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Token has expired" in response.json()["detail"]

def test_token_refresh(test_user):
    """Test refreshing access tokens"""
    # First login to get an access token
    response = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    # Sleep briefly to ensure different expiration time
    time.sleep(1)
    
    # Use the token
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    
    # Refresh the token
    response = client.post(
        "/api/auth/refresh",
        headers=headers
    )
    assert response.status_code == 200
    new_token_data = response.json()
    assert "access_token" in new_token_data
    assert new_token_data["access_token"] != data["access_token"]

    # Verify new token works
    headers = {"Authorization": f"Bearer {new_token_data['access_token']}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200

def test_concurrent_sessions(test_user):
    """Test handling of concurrent user sessions"""
    # Login from first device
    response1 = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response1.status_code == 200
    token1 = response1.json()["access_token"]
    
    # Login from second device
    response2 = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response2.status_code == 200
    token2 = response2.json()["access_token"]
    
    # Both tokens should work
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    response1 = client.get("/api/auth/me", headers=headers1)
    assert response1.status_code == 200
    
    response2 = client.get("/api/auth/me", headers=headers2)
    assert response2.status_code == 200

def test_logout_invalidation(test_user):
    """Test that tokens are invalidated on logout"""
    # Login to get token
    response = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Use token successfully
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    
    # Logout
    response = client.post("/api/auth/logout", headers=headers)
    assert response.status_code == 200
    
    # Token should no longer work
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Token has been invalidated" in response.json()["detail"]

def test_secure_token_storage(test_user):
    """Test that tokens are stored securely and contain required claims"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Verify token structure without using decode_token (which checks blacklist)
    try:
        from app.utils.security import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "sub" in payload  # Subject (user ID)
        assert "exp" in payload  # Expiration time
    except jwt.InvalidTokenError:
        pytest.fail("Token signature verification failed")