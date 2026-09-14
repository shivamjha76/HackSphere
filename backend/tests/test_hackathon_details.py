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


def test_get_hackathon_detail_with_criteria():
    """Verify detailed hackathon endpoint returns evaluation criteria per Chapter 8 and Screen #55."""
    response = client.get("/api/v1/hackathons/ai-hack-summit-2026")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "ai-hack-summit-2026"
    assert "evaluation_criteria" in data
    assert len(data["evaluation_criteria"]) == 6
    # Check one of the specific rubric criteria
    criterion_names = [c["name"] for c in data["evaluation_criteria"]]
    assert "Problem Definition" in criterion_names
    assert "Technical Complexity" in criterion_names
    assert "Presentation & Demo" in criterion_names
    assert data["organization"] is not None
    assert data["organization"]["slug"] == "technova-labs"


def test_registration_unauthenticated_fails():
    """Verify that unauthenticated registration returns 401."""
    response = client.post("/api/v1/hackathons/ai-hack-summit-2026/register")
    assert response.status_code == 401


def test_registration_flow_and_status():
    """
    Test participant registration:
    1. Check initial registration status.
    2. Register participant (should award +50 XP).
    3. Verify duplicate registration fails with 400.
    4. Verify registration status is true.
    """
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    slug = "ai-hack-summit-2026"

    # 1. Check status or register
    status_res = client.get(f"/api/v1/hackathons/{slug}/registration-status", headers=headers)
    assert status_res.status_code == 200
    initial_registered = status_res.json()["is_registered"]

    if not initial_registered:
        # 2. Register
        reg_res = client.post(f"/api/v1/hackathons/{slug}/register", headers=headers)
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert reg_data["status"] == "registered"
        assert reg_data["xp_awarded"] == 50

    # 3. Duplicate registration should return 400
    dup_res = client.post(f"/api/v1/hackathons/{slug}/register", headers=headers)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()

    # 4. Status should now be True
    final_status = client.get(f"/api/v1/hackathons/{slug}/registration-status", headers=headers)
    assert final_status.status_code == 200
    assert final_status.json()["is_registered"] is True

    # 5. Get detail with headers should reflect is_user_registered = True
    detail_res = client.get(f"/api/v1/hackathons/{slug}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["is_user_registered"] is True
