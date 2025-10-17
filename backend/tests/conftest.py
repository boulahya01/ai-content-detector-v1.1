import os
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
try:
    from app.main import app
except ModuleNotFoundError:
    import sys
    import os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from app.main import app
from app.utils.database import SessionLocal, init_db
from tests.seed_test_users import seed_test_users


@pytest.fixture(scope="session")
def client():
    """Get test client and ensure database is ready."""
    # Ensure a fresh test DB so idempotency keys and previous transactions don't leak between runs
    import os
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend.db'))
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
    except Exception:
        pass

    init_db()  # Create tables
    db = SessionLocal()
    try:
        seed_test_users(db)  # Seed test users
    finally:
        db.close()
    return TestClient(app)


@pytest.fixture(scope="session")
def db():
    """Get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def token(client: TestClient) -> str:
    """Log in the seeded pro test user and return an access token."""
    resp = client.post(
        "/api/auth/login",
        data={
            "username": "pro.test@aidetector.com",
            "password": "Test123!@#"
        }
    )
    assert resp.status_code == 200, f"Login failed: {resp.json()}"
    data = resp.json()
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token: str) -> dict:
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {token}"}
