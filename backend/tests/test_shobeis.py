"""Test shobeis endpoints and functionality."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from tests.fixtures import test_user
from app.services.shobeis_service import InsufficientShobeisError

client = TestClient(app)

def test_get_balance(test_user, auth_headers):
    """Test getting user's shobeis balance."""
    response = client.get("/api/shobeis/balance", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data
    assert "bonus" in data
    assert "user_type" in data
    assert "monthly_refresh_amount" in data
    assert data["balance"] == test_user.shobeis_balance
    assert data["bonus"] == test_user.bonus_balance
    assert data["user_type"] == test_user.user_type
    assert data["monthly_refresh_amount"] == 1000  # Pro user monthly refresh amount

def test_estimate_cost(test_user, auth_headers):
    """Test estimating the cost of an action."""
    response = client.post(
        "/api/shobeis/estimate",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 100
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "cost" in data
    assert "action_type" in data
    assert "quantity" in data
    assert data["cost"] > 0
    assert data["action_type"] == "word_analysis"
    assert data["quantity"] == 100

def test_charge_success(test_user, auth_headers):
    """Test successful charging of shobeis."""
    initial_balance = test_user.shobeis_balance
    response = client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 100,
            "idempotency_key": "test-charge-1"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "transaction_id" in data
    assert "balance" in data
    assert "amount" in data
    assert "balance_before" in data
    assert "balance_after" in data
    assert data["balance_before"] == initial_balance
    assert data["balance_after"] < initial_balance
    assert data["balance"] == data["balance_after"]

def test_charge_idempotency(test_user, auth_headers):
    """Test that identical charges with same idempotency key return same result."""
    # First charge
    response1 = client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 100,
            "idempotency_key": "test-idempotent-1"
        }
    )
    assert response1.status_code == 200
    data1 = response1.json()

    # Second charge with same idempotency key
    response2 = client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 100,
            "idempotency_key": "test-idempotent-1"
        }
    )
    assert response2.status_code == 200
    data2 = response2.json()

    # Should be same transaction
    assert data1["transaction_id"] == data2["transaction_id"]
    assert data1["balance"] == data2["balance"]
    assert data1["amount"] == data2["amount"]

def test_charge_insufficient_balance(test_user, auth_headers):
    """Test charging more shobeis than user has."""
    # First deplete the balance
    response = client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 1000000,  # Large quantity to use up balance
            "idempotency_key": "test-deplete-1"
        }
    )
    assert response.status_code == 402  # Payment Required
    data = response.json()
    assert "detail" in data
    assert "Insufficient balance" in data["detail"]

def test_get_transaction_history(test_user, auth_headers):
    """Test retrieving transaction history."""
    # First make a transaction
    client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "action_type": "word_analysis",
            "quantity": 100,
            "idempotency_key": "test-history-1"
        }
    )

    # Get transaction history
    response = client.get(
        "/api/shobeis/transactions",
        headers=auth_headers,
        params={"limit": 10, "offset": 0}
    )
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    transactions = data["transactions"]
    assert len(transactions) > 0
    
    # Verify transaction fields
    tx = transactions[0]  # Most recent transaction
    assert "id" in tx
    assert "amount" in tx
    assert "transaction_type" in tx
    assert "description" in tx
    assert "created_at" in tx
    assert "status" in tx
    assert tx["transaction_type"] == "CHARGE"

def test_missing_action_type(auth_headers):
    """Test error handling for missing action type."""
    response = client.post(
        "/api/shobeis/charge",
        headers=auth_headers,
        json={
            "quantity": 100
        }
    )
    assert response.status_code == 422  # Validation Error