import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # Ensure DB is initialized for tests
    init_db()
    yield


def test_register_login_and_me_flow():
    email = "pytest_user@example.com"
    password = "Test123!"

    # Register
    r = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email
    assert data["is_active"] is True

    # Login
    r = client.post("/api/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200
    token = r.json().get("access_token")
    assert token

    # Me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email


def test_register_duplicate():
    email = "dup_user@example.com"
    password = "Test123!"

    r1 = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r1.status_code == 200

    r2 = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r2.status_code == 400


def test_login_wrong_password():
    email = "badpass@example.com"
    password = "Test123!"

    client.post("/api/auth/register", json={"email": email, "password": password})
    r = client.post("/api/auth/login", data={"username": email, "password": "wrong"})
    assert r.status_code == 401
