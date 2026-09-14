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


def test_judges_overview_unauthenticated_returns_401():
    res = client.get("/api/v1/judging/hackathons/ai-hack-summit-2026")
    assert res.status_code == 401


def test_judges_overview_participant_forbidden():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/judging/hackathons/ai-hack-summit-2026", headers=headers)
    assert res.status_code == 403
    assert "Organizer role required" in res.json()["detail"]


def test_judges_overview_organizer():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/judging/hackathons/ai-hack-summit-2026", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["hackathon_slug"] == "ai-hack-summit-2026"
    assert "judges" in data
    assert "assignments" in data
    assert "overall_progress_percentage" in data


def test_appoint_judge_and_auto_distribute():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # 1. Appoint admin as judge if not already appointed
    res_appoint = client.post(
        "/api/v1/judging/hackathons/ai-hack-summit-2026/judges",
        json={
            "email": "admin@hacksphere.dev",
            "expertise": "Platform Architecture & Security",
        },
        headers=headers,
    )
    # Could be 200 if newly appointed or 400 if already appointed
    assert res_appoint.status_code in (200, 400)
    if res_appoint.status_code == 200:
        appointed = res_appoint.json()
        assert "Admin" in appointed["full_name"]
        assert appointed["expertise"] == "Platform Architecture & Security"

    # 2. Run auto-distribution
    res_dist = client.post(
        "/api/v1/judging/hackathons/ai-hack-summit-2026/distribute",
        json={"reviews_per_team": 2, "strategy": "round_robin"},
        headers=headers,
    )
    assert res_dist.status_code == 200
    data = res_dist.json()
    assert data["total_assignments"] >= 1
    assert len(data["assignments"]) >= 1


def test_manual_assignment_and_delete():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Get current overview to find a judge and team
    res_overview = client.get("/api/v1/judging/hackathons/ai-hack-summit-2026", headers=headers)
    assert res_overview.status_code == 200
    data = res_overview.json()

    if data["judges"] and data["assignments"]:
        existing_a = data["assignments"][0]
        a_id = existing_a["id"]

        # Delete the assignment
        res_del = client.delete(f"/api/v1/judging/assignments/{a_id}", headers=headers)
        assert res_del.status_code == 200
        assert "deleted successfully" in res_del.json()["message"]
