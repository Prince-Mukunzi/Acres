import pytest
import jwt
import uuid
from app import app
from backend.utils.db import get_db_connection

@pytest.fixture(scope="session")
def test_user_id():
    """Create a test user in the database."""
    uid = str(uuid.uuid4())
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO AppUser (id, name, email) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                (uid, "Test Runner", f"test_{uid[:8]}@example.com")
            )
        conn.commit()
    finally:
        conn.close()
    return uid

@pytest.fixture
def auth_token(test_user_id):
    """Generate a JWT token for the test user."""
    payload = {
        "user_id": test_user_id,
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

@pytest.fixture
def client(auth_token):
    """Create a test client with the authentication header pre-set."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        # Standard Flask way to set persistent headers for all requests in this client
        client.environ_base['HTTP_AUTHORIZATION'] = f"Bearer {auth_token}"
        yield client
