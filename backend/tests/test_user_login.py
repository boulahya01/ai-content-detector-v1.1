import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.utils.database import get_db

client = TestClient(app)

def test_login_all_users():
    """Test logging in with all test users"""
    test_users = [
        {"email": "admin@aidetector.com", "password": "Admin@123", "role": "admin"},
        {"email": "pro@example.com", "password": "Pro@123", "role": "pro"},
        {"email": "free@example.com", "password": "Free@123", "role": "free"}
    ]
    
    for user in test_users:
        # Test login
        response = client.post(
            "/api/auth/login",
            data={
                "username": user["email"],  # OAuth2 uses username field
                "password": user["password"]
            }
        )
        assert response.status_code == 200, f"Failed to login {user['role']} user"
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        
        # Verify user data
        user_data = data["user"]
        assert user_data["email"] == user["email"]
        assert user_data["role"] == user["role"]
        
        # Test accessing protected endpoint
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {data['access_token']}"}
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["email"] == user["email"]

def test_invalid_login():
    """Test login with invalid credentials"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "fake@example.com",
            "password": "WrongPassword123!"
        }
    )
    assert response.status_code == 401

def test_token_expiry():
    """Test that token expiration is set correctly"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "admin@aidetector.com",
            "password": "Admin@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "expires_in" in data
    assert data["expires_in"] == 86400  # 24 hours in seconds