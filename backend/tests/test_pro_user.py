import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.utils.database import get_db
from app.models.shobeis_transaction import ShobeisTransaction
from datetime import datetime, timedelta

client = TestClient(app)

def test_pro_user_login():
    """Test logging in with test pro user"""
    # Test login
    response = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200, "Failed to login test pro user"
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    
    # Verify user data
    user_data = data["user"]
    assert user_data["email"] == "pro.test@aidetector.com"
    assert user_data["role"] == "pro"
    assert user_data["subscription_tier"] == "pro"
    assert user_data["full_name"] == "Test Pro User"
    
    token = data["access_token"]
    
    # Test accessing balance endpoint
    balance_response = client.get(
        "/api/shobeis/balance",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert balance_response.status_code == 200
    balance_data = balance_response.json()
    assert balance_data["shobeis_balance"] >= 0
    assert "monthly_refresh_amount" in balance_data
    assert balance_data["monthly_refresh_amount"] == 1000
    
    # Test accessing transaction history
    tx_response = client.get(
        "/api/shobeis/transactions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert tx_response.status_code == 200
    transactions = tx_response.json()
    assert len(transactions) > 0
    
    # Verify transaction fields
    tx = transactions[0]
    assert "transaction_id" in tx
    assert "user_id" in tx
    assert "transaction_type" in tx
    assert "amount" in tx
    assert "balance_before" in tx
    assert "balance_after" in tx
    assert "created_at" in tx
    
    print("\nPro User Test Successful:")
    print(f"- Balance: {balance_data['shobeis_balance']} Shobeis")
    print(f"- Monthly Refresh: {balance_data['monthly_refresh_amount']} Shobeis")
    print(f"- Transaction Count: {len(transactions)}")
    
    return token  # Return token for use in other tests

def test_create_transaction(token: str):
    """Test creating a new transaction"""
    response = client.post(
        "/api/shobeis/transactions/TEXT_ANALYSIS",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "word_count": 1000,
            "file_type": "txt",
            "is_bulk": False,
            "meta": {
                "test": True,
                "source": "test_case"
            }
        }
    )
    
    assert response.status_code == 200
    tx = response.json()
    assert tx["transaction_type"] == "TEXT_ANALYSIS"
    assert tx["amount"] < 0  # Should be a debit
    assert "balance_before" in tx
    assert "balance_after" in tx
    assert tx["balance_after"] == tx["balance_before"] + tx["amount"]

if __name__ == "__main__":
    token = test_pro_user_login()
    test_create_transaction(token)