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


def test_management_unauthenticated_returns_401():
    res = client.get("/api/v1/hackathons/ai-hack-summit-2026/manage")
    assert res.status_code == 401


def test_management_participant_forbidden():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/hackathons/ai-hack-summit-2026/manage", headers=headers)
    assert res.status_code == 403
    assert "Organizer role required" in res.json()["detail"]


def test_management_organizer_success():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/hackathons/ai-hack-summit-2026/manage", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["slug"] == "ai-hack-summit-2026"
    assert "title" in data
    assert "status" in data
    assert "total_submissions" in data
    assert "submissions" in data
    assert len(data["submissions"]) >= 1

    sub = data["submissions"][0]
    assert "team_name" in sub
    assert "project_title" in sub
    assert "is_locked" in sub
    assert "status" in sub


def test_phase_transition_and_auto_lock():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    
    # 1. Advance phase to submission_closed
    res = client.post(
        "/api/v1/hackathons/ai-hack-summit-2026/phase",
        json={"phase": "submission_closed", "override_reason": "Deadline reached"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "submission_closed"
    assert data["locked_submissions_count"] == data["total_submissions"]
    assert all(s["is_locked"] is True for s in data["submissions"])

    # 2. Reset back to live/hacking for subsequent tests/use
    res_reset = client.post(
        "/api/v1/hackathons/ai-hack-summit-2026/phase",
        json={"phase": "live"},
        headers=headers,
    )
    assert res_reset.status_code == 400 or res_reset.status_code == 200


def test_submission_moderation_status():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    
    # First get management detail to know submission id
    res = client.get("/api/v1/hackathons/ai-hack-summit-2026/manage", headers=headers)
    assert res.status_code == 200
    submissions = res.json()["submissions"]
    assert len(submissions) > 0
    sub_id = submissions[0]["id"]

    # Flag submission
    res_flag = client.patch(
        f"/api/v1/hackathons/ai-hack-summit-2026/submissions/{sub_id}/status",
        json={"status": "flagged", "notes": "Auditing open source licenses"},
        headers=headers,
    )
    assert res_flag.status_code == 200
    assert res_flag.json()["status"] == "flagged"

    # Re-instate to submitted
    res_reinstate = client.patch(
        f"/api/v1/hackathons/ai-hack-summit-2026/submissions/{sub_id}/status",
        json={"status": "submitted"},
        headers=headers,
    )
    assert res_reinstate.status_code == 200
    assert res_reinstate.json()["status"] == "submitted"
