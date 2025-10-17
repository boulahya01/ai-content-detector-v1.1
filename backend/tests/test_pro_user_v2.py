"""Unit tests for pro user functionality with clean session handling."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from typing import Generator
from app.main import app
from app.models.user import User, UserType
from app.models.blacklisted_token import BlacklistedToken
from app.utils.database import Base, get_db
from app.utils.security import get_password_hash

# Test database configuration
TEST_DB_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})

# Session Factory for tests
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def setup_database():
    """Setup test database with initial schema and data."""
    Base.metadata.create_all(engine)
    
    # Create test session
    session = TestingSessionLocal()
    try:
        # Create pro test user if not exists
        user = session.query(User).filter_by(email="pro.test@aidetector.com").first()
        if not user:
            user = User(
                email="pro.test@aidetector.com",
                password_hash=get_password_hash("Test123!@#"),
                user_type=UserType.PRO.value,
                first_name="Pro",
                last_name="User",
                is_active=True,
                shobeis_balance=1000,
                monthly_refresh_amount=1000
            )
            session.add(user)
            session.commit()
    finally:
        session.close()

@pytest.fixture
def test_db(setup_database) -> Generator[Session, None, None]:
    """Get test database session."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_client(test_db) -> TestClient:
    """Get test client with overridden database dependency."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass  # Don't close here, the fixture handles it

    # Override the database dependency
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

def test_pro_user_login(test_client: TestClient):
    """Test logging in with test pro user."""
    response = test_client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200, "Failed to login test pro user"
    
    data = response.json()
    assert "access_token" in data, "Access token missing in response"
    assert data["token_type"] == "bearer", "Incorrect token type"
    
    return data["access_token"]

def test_shobeis_functionality(test_client: TestClient):
    """Test shobeis-related functionality for pro user."""
    # First login
    token = test_pro_user_login(test_client)
    
    # Test balance endpoint
    headers = {"Authorization": f"Bearer {token}"}
    balance_response = test_client.get("/api/shobeis/shobeis/balance", headers=headers)
    assert balance_response.status_code == 200
    balance_data = balance_response.json()
    assert balance_data["balance"] >= 0
    assert balance_data["monthly_refresh_amount"] == 1000
    
    # Test charging shobeis
    charge_response = test_client.post(
        "/api/shobeis/shobeis/charge",
        headers=headers,
        json={
            "action_type": "word_analysis",
            "quantity": 1000,
            "meta": {"test": True}
        }
    )
    assert charge_response.status_code == 200
    charge_data = charge_response.json()
    assert charge_data["amount"] < 0  # Should be a debit
    assert charge_data["balance_after"] == charge_data["balance_before"] + charge_data["amount"]
    
    # Test transaction history
    tx_response = test_client.get("/api/shobeis/shobeis/transactions", headers=headers)
    assert tx_response.status_code == 200
    transactions = tx_response.json()["transactions"]
    assert len(transactions) > 0
    
    # Verify transaction fields
    tx = transactions[0]
    expected_fields = ["id", "amount", "created_at", "description", "transaction_type", "status", "meta"]
    for field in expected_fields:
        assert field in tx, f"Missing field: {field}"