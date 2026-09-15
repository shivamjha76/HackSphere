import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_header(email: str, password: str) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_admin_unauthorized():
    """Unauthenticated request must be rejected with 401."""
    res = client.get("/api/v1/admin/dashboard")
    assert res.status_code == 401


def test_admin_participant_forbidden():
    """Participant user cannot access SuperAdmin console."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res.status_code == 403


def test_admin_organizer_forbidden():
    """Organizer user cannot access SuperAdmin console."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res.status_code == 403


def test_admin_dashboard_success():
    """SuperAdmin can fetch complete platform telemetry matching Screen #24."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    res = client.get("/api/v1/admin/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # 1. Metric Cards
    assert "stats" in data
    assert len(data["stats"]) == 4
    keys = [s["key"] for s in data["stats"]]
    assert "total_users" in keys
    assert "organizations" in keys
    assert "active_hackathons" in keys
    assert "issues_reported" in keys

    # 2. 7-Day Activity Points
    assert "daily_metrics" in data
    assert len(data["daily_metrics"]) == 7
    assert data["total_7d_activity"] >= 4000

    # 3. Role Breakdown
    assert "role_distribution" in data
    roles = [r["role_name"] for r in data["role_distribution"]]
    assert "Participants" in roles
    assert "Organizers" in roles
    assert "Judges" in roles

    # 4. Recent Platform Activity
    assert "recent_activities" in data
    assert len(data["recent_activities"]) >= 5

    # 5. Recent Organizations
    assert "recent_organizations" in data
    assert len(data["recent_organizations"]) >= 5

    # 6. Ongoing Hackathons
    assert "ongoing_hackathons" in data
    assert len(data["ongoing_hackathons"]) >= 5

    # 7. Pending Actions Queue
    assert "pending_actions" in data
    pending = data["pending_actions"]
    assert pending["orgs_awaiting_approval_count"] >= 1
    assert pending["hackathons_approval_count"] >= 1
    assert pending["reported_issues_count"] >= 1
    assert len(pending["items"]) >= 1

    # 8. Platform Health
    assert "platform_health" in data
    health = data["platform_health"]
    assert health["latency_ms"] > 0
    assert health["uptime_percent"] >= 99.0
    assert health["core_api_status"] == "operational"


def test_admin_pending_actions_filter():
    """SuperAdmin can fetch pending queue and filter by category."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    res = client.get("/api/v1/admin/pending-actions?category=organization", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert item["category"] == "organization"


def test_admin_verify_organization():
    """SuperAdmin can verify or revoke an organization status."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    res = client.post(
        "/api/v1/admin/organizations/1/verify",
        headers=headers,
        json={"is_verified": True, "notes": "Corporate registry validated."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["organization_id"] == 1
    assert data["is_verified"] is True


def test_admin_approve_hackathon():
    """SuperAdmin can approve a hackathon for public listing."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    res = client.post(
        "/api/v1/admin/hackathons/1/approve",
        headers=headers,
        json={"status": "published", "notes": "Approved for global directory listing."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["hackathon_id"] == 1
    assert data["status"] == "published"


def test_admin_resolve_moderation_report():
    """SuperAdmin can resolve or dismiss community moderation flags."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    res = client.post(
        "/api/v1/admin/reports/1/resolve",
        headers=headers,
        json={"status": "resolved", "resolution_notes": "Reviewed dataset license; confirmed public domain."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["status"] == "resolved"


def test_admin_update_user_status():
    """SuperAdmin can activate or suspend user accounts."""
    headers = get_auth_header("admin@hacksphere.dev", "AdminPass123!")
    # Update participant user (id: 4 shivam@example.com)
    res = client.patch(
        "/api/v1/admin/users/4/status",
        headers=headers,
        json={"is_active": True, "reason": "Account in good standing."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["is_active"] is True
