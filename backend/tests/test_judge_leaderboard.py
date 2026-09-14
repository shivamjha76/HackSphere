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


def test_get_leaderboard_unauthenticated_returns_401():
    res = client.get("/api/v1/judge/leaderboards")
    assert res.status_code == 401


def test_get_leaderboard_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/judge/leaderboards", headers=headers)
    assert res.status_code == 403


def test_get_leaderboard_judge_success():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    res = client.get("/api/v1/judge/leaderboards", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Hackathon metadata
    assert "hackathon_id" in data
    assert "hackathon_title" in data
    assert "hackathon_slug" in data
    assert "total_teams" in data
    assert "scores_published" in data
    assert "in_progress_scores" in data
    assert "pending_scores" in data
    assert "days_remaining" in data

    # Score Distribution Brackets (Screen #49)
    assert "score_distribution" in data
    assert len(data["score_distribution"]) == 4
    labels = [b["label"] for b in data["score_distribution"]]
    assert "80 - 100" in labels
    assert "60 - 80" in labels
    assert "40 - 60" in labels
    assert "Below 40" in labels

    # Judge Impact Metrics (Screen #49)
    assert "judge_impact" in data
    impact = data["judge_impact"]
    assert "evaluations_submitted" in impact
    assert "consistency_score" in impact
    assert "average_deviation" in impact
    assert "strictness_label" in impact
    assert "agreement_rate" in impact
    assert 50.0 <= impact["consistency_score"] <= 100.0

    # Rankings list
    assert "rankings" in data
    assert isinstance(data["rankings"], list)
    if len(data["rankings"]) > 0:
        top_team = data["rankings"][0]
        assert top_team["rank"] == 1
        assert "team_name" in top_team
        assert "project_title" in top_team
        assert "average_score" in top_team
        assert "evaluations_count" in top_team
        assert "is_flagged_for_review" in top_team


def test_get_leaderboard_with_explicit_hackathon_and_filters():
    headers = get_auth_header("rohan.mehta@judge.com", "JudgePass123!")
    
    # 1. First get assigned hackathon id
    h_res = client.get("/api/v1/judge/hackathons", headers=headers)
    assert h_res.status_code == 200
    h_list = h_res.json()
    assert len(h_list) > 0
    h_id = h_list[0]["id"]

    # 2. Query leaderboard explicitly
    res = client.get(f"/api/v1/judge/leaderboards?hackathon_id={h_id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["hackathon_id"] == h_id

    # 3. Test filter_mode=my_evaluations
    my_res = client.get(
        f"/api/v1/judge/leaderboards?hackathon_id={h_id}&filter_mode=my_evaluations",
        headers=headers,
    )
    assert my_res.status_code == 200
    my_data = my_res.json()
    for item in my_data["rankings"]:
        assert item["current_judge_evaluated"] is True

    # 4. Test filter_mode=flagged
    flag_res = client.get(
        f"/api/v1/judge/leaderboards?hackathon_id={h_id}&filter_mode=flagged",
        headers=headers,
    )
    assert flag_res.status_code == 200
    flag_data = flag_res.json()
    for item in flag_data["rankings"]:
        assert item["is_flagged_for_review"] is True
