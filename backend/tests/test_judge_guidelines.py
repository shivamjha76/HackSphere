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


def test_get_guidelines_unauthenticated_returns_401():
    res = client.get("/api/v1/judge/guidelines")
    assert res.status_code == 401


def test_get_guidelines_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/judge/guidelines", headers=headers)
    assert res.status_code == 403


def test_get_guidelines_judge_rohan_mehta_success():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    res = client.get("/api/v1/judge/guidelines", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "hackathon_id" in data
    assert "hackathon_title" in data
    assert "rubric_criteria" in data
    assert len(data["rubric_criteria"]) == 6
    assert data["total_max_score"] == 100

    # Verify Screen #55 Criteria
    crit_names = [c["name"] for c in data["rubric_criteria"]]
    assert "Problem Definition" in crit_names
    assert "Innovation & Creativity" in crit_names
    assert "Technical Feasibility" in crit_names or "Solution & Functionality" in crit_names

    # Verify Rules & Do's/Don'ts
    assert "rules" in data
    assert len(data["rules"]) >= 4
    assert "dos_and_donts" in data
    assert len(data["dos_and_donts"]["dos"]) >= 4
    assert len(data["dos_and_donts"]["donts"]) >= 4

    # Verify Important Dates & Policy
    assert "important_dates" in data
    assert "conflict_of_interest_policy" in data


def test_declare_conflict_of_interest():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    
    # First get assigned hackathons
    h_res = client.get("/api/v1/judge/hackathons", headers=headers)
    assert h_res.status_code == 200
    hackathons = h_res.json()
    assert len(hackathons) > 0
    h_id = hackathons[0]["id"]

    payload = {
        "hackathon_id": h_id,
        "reason": "Personal relationship with team member",
        "notes": "Co-worker at tech company",
    }
    res = client.post("/api/v1/judge/conflict-of-interest", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "conflict_declared"
    assert "notified" in data["message"].lower()
