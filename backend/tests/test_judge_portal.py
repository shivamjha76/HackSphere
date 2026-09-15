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


def test_judge_dashboard_unauthenticated_returns_401():
    res = client.get("/api/v1/judge/dashboard")
    assert res.status_code == 401


def test_judge_dashboard_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/judge/dashboard", headers=headers)
    assert res.status_code == 403
    assert "Judge role required" in res.json()["detail"]


def test_judge_dashboard_rohan_mehta_success():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    res = client.get("/api/v1/judge/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["judge_name"] == "Rohan Mehta"
    assert "stats" in data
    stats = data["stats"]
    assert stats["completed_evaluations"] >= 1
    assert stats["total_assigned_submissions"] >= 1
    assert stats["average_score_given"] >= 80.0

    assert "assigned_hackathons" in data
    assert len(data["assigned_hackathons"]) >= 1
    h0 = data["assigned_hackathons"][0]
    assert h0["slug"] == "ai-hack-summit-2026"
    assert h0["organization_name"] == "TechNova Labs"

    assert "submissions_queue" in data
    assert len(data["submissions_queue"]) >= 1
    cc_item = next((q for q in data["submissions_queue"] if "CodeCrafters" in q["team_name"]), None)
    assert cc_item is not None
    assert cc_item["project_title"] == "SmartAssist AI"
    assert cc_item["evaluation_status"] == "completed"
    assert cc_item["total_score"] is not None


def test_judge_submissions_queue_filter_status():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")

    # Test status=completed
    res_completed = client.get("/api/v1/judge/submissions?status=completed", headers=headers)
    assert res_completed.status_code == 200
    items = res_completed.json()
    assert len(items) >= 1
    assert all(i["evaluation_status"] == "completed" for i in items)

    # Test status=not_started
    res_pending = client.get("/api/v1/judge/submissions?status=not_started", headers=headers)
    assert res_pending.status_code == 200
    items_pending = res_pending.json()
    assert all(i["evaluation_status"] == "not_started" for i in items_pending)


def test_judge_submissions_queue_search():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")

    res = client.get("/api/v1/judge/submissions?search=SmartAssist", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert "SmartAssist" in items[0]["project_title"]

    res_empty = client.get("/api/v1/judge/submissions?search=NonExistentProjectXYZ", headers=headers)
    assert res_empty.status_code == 200
    assert len(res_empty.json()) == 0


def test_judge_assigned_hackathons():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    res = client.get("/api/v1/judge/hackathons", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert any(h["slug"] == "ai-hack-summit-2026" for h in items)
