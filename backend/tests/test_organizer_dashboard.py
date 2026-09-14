import pytest
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


def test_organizer_dashboard_unauthenticated_returns_401():
    res = client.get("/api/v1/dashboard/organizer")
    assert res.status_code == 401


def test_organizer_dashboard_participant_forbidden():
    """Pure participant should receive 403 Forbidden when accessing organizer operations."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/dashboard/organizer", headers=headers)
    assert res.status_code == 403
    assert "Organizer privileges required" in res.json()["detail"]


def test_organizer_dashboard_authenticated_organizer():
    """Verified organizer receives single round-trip aggregated dashboard."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/dashboard/organizer", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "organization_name" in data
    assert data["organization_name"] == "TechNova Labs"
    assert data["is_verified"] is True

    stats = data["stats"]
    assert stats["total_hackathons"] >= 1
    assert stats["total_participants"] >= 0

    hackathons = data["hackathons"]
    assert len(hackathons) >= 1
    assert any("AI Hack Summit" in h["title"] for h in hackathons)

    assert "recent_activity" in data
    assert len(data["recent_activity"]) >= 1


def test_organizer_dashboard_multi_role_user():
    """Multi-role user (Rahul) who has organizer role can also access organizer dashboard."""
    headers = get_auth_header("rahul@example.com", "UserPass123!")
    res = client.get("/api/v1/dashboard/organizer", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["stats"]["total_hackathons"] >= 1
