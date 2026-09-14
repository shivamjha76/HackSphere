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


def test_organizer_reports_unauthenticated_returns_401():
    res = client.get("/api/v1/reports/organizer")
    assert res.status_code == 401


def test_organizer_reports_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/reports/organizer", headers=headers)
    assert res.status_code == 403


def test_organizer_reports_organizer_success():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/reports/organizer", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Core metadata
    assert "hackathon_id" in data
    assert "hackathon_title" in data
    assert "organization_name" in data
    assert "total_participants" in data
    assert "total_teams" in data
    assert "total_submissions" in data
    assert "evaluations_completed" in data
    assert "page_views" in data

    # Growth indicators matching Screen #54
    assert data["participants_growth_pct"] == 18.7
    assert data["teams_growth_pct"] == 12.4
    assert data["submissions_growth_pct"] == 20.0
    assert data["views_growth_pct"] == 25.6

    # Role Distribution (Screen #54)
    assert "role_distribution" in data
    assert len(data["role_distribution"]) == 5
    role_names = [r["role_name"] for r in data["role_distribution"]]
    assert "Participants" in role_names
    assert "Teams" in role_names
    assert "Team Members" in role_names
    assert "Team Leaders" in role_names
    assert "Judges" in role_names

    # Daily Trends (7-day time series)
    assert "daily_trends" in data
    assert len(data["daily_trends"]) == 7
    for day in data["daily_trends"]:
        assert "date" in day
        assert "participants" in day
        assert "teams" in day
        assert "submissions" in day

    # Top Performing Teams
    assert "top_teams" in data
    assert isinstance(data["top_teams"], list)
    if len(data["top_teams"]) > 0:
        top1 = data["top_teams"][0]
        assert top1["rank"] == 1
        assert "team_name" in top1
        assert "project_title" in top1
        assert "average_score" in top1

    # Managed Hackathons List
    assert "managed_hackathons" in data
    assert len(data["managed_hackathons"]) > 0


def test_organizer_reports_explicit_hackathon():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    # Fetch first report to get a valid hackathon_id
    res1 = client.get("/api/v1/reports/organizer", headers=headers)
    assert res1.status_code == 200
    h_id = res1.json()["hackathon_id"]

    res2 = client.get(f"/api/v1/reports/organizer?hackathon_id={h_id}", headers=headers)
    assert res2.status_code == 200
    data = res2.json()
    assert data["hackathon_id"] == h_id
