import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def token(client: TestClient) -> str:
    """Log in the seeded pro test user and return an access token."""
    resp = client.post(
        "/api/auth/login",
        data={"username": "pro.test@aidetector.com", "password": "Test123!@#"}
    )
    if resp.status_code != 200:
        pytest.skip("Could not log in pro test user; skipping token fixture")
    data = resp.json()
    return data.get("access_token")
