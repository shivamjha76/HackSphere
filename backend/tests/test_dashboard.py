from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_unauthenticated_returns_401():
    """Verify accessing dashboard without token returns 401."""
    response = client.get("/api/v1/dashboard/participant")
    assert response.status_code == 401


def test_participant_dashboard_aggregated():
    """Verify aggregated participant dashboard returns full payload in single round-trip per Chapter 30."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    response = client.get("/api/v1/dashboard/participant", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # User profile
    assert "user" in data
    assert data["user"]["email"] == "shivam@example.com"
    assert "participant" in data["user"]["roles"]
    assert "xp" in data["user"]
    assert "level" in data["user"]

    # Stats
    assert "stats" in data
    assert "registered_count" in data["stats"]
    assert "teams_count" in data["stats"]

    # Registered Hackathons
    assert "registered_hackathons" in data
    assert isinstance(data["registered_hackathons"], list)

    # Teams
    assert "teams" in data
    assert isinstance(data["teams"], list)

    # Deadlines
    assert "upcoming_deadlines" in data
    assert isinstance(data["upcoming_deadlines"], list)

    # Recent activities
    assert "recent_activities" in data
    assert isinstance(data["recent_activities"], list)
    assert len(data["recent_activities"]) >= 1
