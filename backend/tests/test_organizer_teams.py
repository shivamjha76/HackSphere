import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.team import Team

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_teams_cohort_state():
    """Ensure reliable baseline statuses for Screen #56 sample teams."""
    status_map = {
        "CodeCrafters": "shortlisted",
        "ByteBuilders": "registered",
        "DevDynamos": "registered",
        "PixelPioneers": "registered",
        "LogicLegends": "shortlisted",
        "CryptoCoders": "disqualified",
    }
    db = SessionLocal()
    try:
        for name, st in status_map.items():
            t = db.query(Team).filter_by(name=name).first()
            if t:
                t.status = st
                db.add(t)
        db.commit()
    finally:
        db.close()
    yield
    db = SessionLocal()
    try:
        for name, st in status_map.items():
            t = db.query(Team).filter_by(name=name).first()
            if t:
                t.status = st
                db.add(t)
        db.commit()
    finally:
        db.close()


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_organizer_teams_unauthorized():
    """Unauthenticated access must be rejected with 401."""
    res = client.get("/api/v1/organizer/teams")
    assert res.status_code == 401


def test_organizer_teams_participant_forbidden():
    """Participant role must receive 403 Forbidden."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/organizer/teams", headers=headers)
    assert res.status_code == 403


def test_organizer_list_teams_overview():
    """Organizer can fetch teams directory and metrics matching Screen #56."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/organizer/teams", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "hackathon_id" in data
    assert "hackathon_title" in data
    assert len(data["managed_hackathons"]) >= 1
    assert data["total_teams"] >= 5
    assert data["registered_count"] >= 1
    assert data["shortlisted_count"] >= 1
    assert data["disqualified_count"] >= 1
    assert len(data["teams"]) >= 5

    # Check first team representation
    first_team = data["teams"][0]
    assert "id" in first_team
    assert "name" in first_team
    assert "status" in first_team
    assert "members_count" in first_team
    assert "members" in first_team


def test_organizer_teams_status_filtering():
    """Organizer can filter cohort by status (registered, shortlisted, disqualified)."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Test Shortlisted
    res_shortlisted = client.get("/api/v1/organizer/teams?status=shortlisted", headers=headers)
    assert res_shortlisted.status_code == 200
    teams_s = res_shortlisted.json()["teams"]
    assert len(teams_s) >= 1
    for t in teams_s:
        assert t["status"] == "shortlisted"

    # Test Disqualified
    res_disqualified = client.get("/api/v1/organizer/teams?status=disqualified", headers=headers)
    assert res_disqualified.status_code == 200
    teams_d = res_disqualified.json()["teams"]
    assert len(teams_d) >= 1
    for t in teams_d:
        assert t["status"] == "disqualified"


def test_organizer_teams_search():
    """Organizer can search teams by name or project title."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Search for CodeCrafters / SmartAssist
    res = client.get("/api/v1/organizer/teams?search=SmartAssist", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["teams"]) >= 1
    found_titles = [t["project_title"] for t in data["teams"]]
    assert any("SmartAssist" in title for title in found_titles)


def test_organizer_update_team_status_and_audit():
    """Organizer can shortlist or disqualify a team and generate an ActivityLog entry."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # 1. Fetch teams to locate ByteBuilders
    res_all = client.get("/api/v1/organizer/teams", headers=headers)
    assert res_all.status_code == 200
    all_teams = res_all.json()["teams"]
    byte_builder = next((t for t in all_teams if t["name"] == "ByteBuilders"), None)
    assert byte_builder is not None, "ByteBuilders team should exist"

    team_id = byte_builder["id"]

    # 2. Update status to shortlisted
    res_update = client.patch(
        f"/api/v1/organizer/teams/{team_id}/status",
        json={"status": "shortlisted", "reason": "Outstanding project demonstration & metrics"},
        headers=headers,
    )
    assert res_update.status_code == 200
    updated_team = res_update.json()
    assert updated_team["status"] == "shortlisted"

    # 3. Verify ActivityLog was created
    res_logs = client.get("/api/v1/organizations/my/activity-logs", headers=headers)
    assert res_logs.status_code == 200
    logs = res_logs.json()["logs"]
    assert any("TEAM_SHORTLISTED" in log["action"] for log in logs)

    # 4. Reset status back to registered
    res_reset = client.patch(
        f"/api/v1/organizer/teams/{team_id}/status",
        json={"status": "registered", "reason": "Resetting status for testing"},
        headers=headers,
    )
    assert res_reset.status_code == 200
    assert res_reset.json()["status"] == "registered"


def test_organizer_update_team_status_invalid_payload():
    """Invalid status value should be rejected with 400."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.patch(
        "/api/v1/organizer/teams/1/status",
        json={"status": "invalid_status"},
        headers=headers,
    )
    assert res.status_code == 400


def test_organizer_bulk_status_update():
    """Organizer can bulk update statuses for multiple teams."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res_all = client.get("/api/v1/organizer/teams", headers=headers)
    teams = res_all.json()["teams"]
    ids = [t["id"] for t in teams[:2]]

    res_bulk = client.post(
        "/api/v1/organizer/teams/bulk-status",
        json={"team_ids": ids, "status": "shortlisted", "reason": "Cohort evaluation passed"},
        headers=headers,
    )
    assert res_bulk.status_code == 200
    bulk_data = res_bulk.json()
    assert bulk_data["success"] is True
    assert bulk_data["updated_count"] == len(ids)
    assert bulk_data["status"] == "shortlisted"
