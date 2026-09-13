import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    """Helper to log in and return Authorization header."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_request_returns_401():
    """Verify that accessing guarded endpoints without token returns 401."""
    endpoints = [
        "/api/v1/protected/admin-only",
        "/api/v1/protected/organizer-only",
        "/api/v1/protected/judge-only",
        "/api/v1/protected/participant-only",
    ]
    for ep in endpoints:
        response = client.get(ep)
        assert response.status_code == 401


def test_super_admin_has_complete_bypass():
    """Verify SuperAdmin can access all portals."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    
    assert client.get("/api/v1/protected/admin-only", headers=headers).status_code == 200
    assert client.get("/api/v1/protected/organizer-only", headers=headers).status_code == 200
    assert client.get("/api/v1/protected/judge-only", headers=headers).status_code == 200
    assert client.get("/api/v1/protected/participant-only", headers=headers).status_code == 200


def test_organizer_permissions_and_restrictions():
    """Verify Organizer can access organizer routes but is blocked from admin."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Allowed
    assert client.get("/api/v1/protected/organizer-only", headers=headers).status_code == 200

    # Forbidden
    res_admin = client.get("/api/v1/protected/admin-only", headers=headers)
    assert res_admin.status_code == 403
    assert "Operation not permitted" in res_admin.json()["detail"]


def test_judge_permissions_and_restrictions():
    """Verify Judge can access judging routes but is blocked from admin & organizer."""
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")

    # Allowed
    assert client.get("/api/v1/protected/judge-only", headers=headers).status_code == 200

    # Forbidden
    assert client.get("/api/v1/protected/admin-only", headers=headers).status_code == 403
    assert client.get("/api/v1/protected/organizer-only", headers=headers).status_code == 403


def test_participant_permissions_and_restrictions():
    """Verify Participant can access participant portal but is blocked from privileged portals."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")

    # Allowed
    assert client.get("/api/v1/protected/participant-only", headers=headers).status_code == 200

    # Forbidden
    assert client.get("/api/v1/protected/admin-only", headers=headers).status_code == 403
    assert client.get("/api/v1/protected/organizer-only", headers=headers).status_code == 403
    assert client.get("/api/v1/protected/judge-only", headers=headers).status_code == 403
