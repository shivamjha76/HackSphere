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


def test_team_members_unauthorized():
    """Unauthenticated requests must return 401 Unauthorized."""
    res_members = client.get("/api/v1/organizations/my/members")
    assert res_members.status_code == 401

    res_logs = client.get("/api/v1/organizations/my/activity-logs")
    assert res_logs.status_code == 401


def test_team_members_forbidden_for_participant():
    """Participant role must receive 403 Forbidden on organizer team endpoints."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")

    res_members = client.get("/api/v1/organizations/my/members", headers=headers)
    assert res_members.status_code == 403

    res_logs = client.get("/api/v1/organizations/my/activity-logs", headers=headers)
    assert res_logs.status_code == 403


def test_organizer_get_members():
    """Organizer can fetch organization roster with roles summary."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res = client.get("/api/v1/organizations/my/members", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "organization_id" in data
    assert "organization_name" in data
    assert data["organization_name"] == "TechNova Labs"
    assert data["is_verified"] is True
    assert "members" in data
    assert "roles_summary" in data
    assert data["total_members"] >= 5
    assert data["roles_summary"]["owner"] >= 1
    assert data["roles_summary"]["admin"] >= 1
    assert data["roles_summary"]["moderator"] >= 2
    assert data["roles_summary"]["viewer"] >= 1

    # Check member structure
    member_emails = [m["email"] for m in data["members"]]
    assert "organizer@technova.com" in member_emails
    assert "priya.sharma@technovalabs.dev" in member_emails


def test_organizer_get_activity_logs():
    """Organizer can fetch, filter, and paginate activity audit logs matching Screen #51."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # 1. Fetch initial page
    res = client.get("/api/v1/organizations/my/activity-logs?page=1&page_size=10", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "logs" in data
    assert "total_count" in data
    assert data["total_count"] >= 8
    assert len(data["logs"]) <= 10
    assert "available_actions" in data

    # Verify log fields
    first_log = data["logs"][0]
    assert "id" in first_log
    assert "user_name" in first_log
    assert "action" in first_log
    assert "details" in first_log
    assert "ip_address" in first_log
    assert "created_at" in first_log

    # 2. Test Action filter
    res_action = client.get(
        "/api/v1/organizations/my/activity-logs?action=Added Team Member",
        headers=headers,
    )
    assert res_action.status_code == 200
    action_logs = res_action.json()["logs"]
    assert len(action_logs) >= 1
    for log in action_logs:
        assert "Added Team Member" in log["action"]

    # 3. Test Search filter
    res_search = client.get(
        "/api/v1/organizations/my/activity-logs?search=Codecraft",
        headers=headers,
    )
    assert res_search.status_code == 200
    search_logs = res_search.json()["logs"]
    assert len(search_logs) >= 1
    for log in search_logs:
        combined = f"{log['user_name']} {log['action']} {log['details']}"
        assert "codecraft" in combined.lower()


def test_organizer_invite_and_role_management():
    """Organizer can invite a new member, update their role, and delete member with audit trail."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    test_email = "test.collab@technovalabs.dev"

    # 1. Check if test member already exists from prior run and remove
    res_existing = client.get("/api/v1/organizations/my/members", headers=headers)
    for m in res_existing.json()["members"]:
        if m["email"] == test_email:
            client.delete(f"/api/v1/organizations/my/members/{m['id']}", headers=headers)

    # 2. Invite new member
    invite_payload = {
        "email": test_email,
        "full_name": "Test Collaborator",
        "role": "moderator",
    }
    res_invite = client.post(
        "/api/v1/organizations/my/members/invite",
        json=invite_payload,
        headers=headers,
    )
    assert res_invite.status_code == 201
    member_data = res_invite.json()
    assert member_data["email"] == test_email
    assert member_data["role"] == "moderator"
    member_id = member_data["id"]

    # 3. Duplicate invite should return 400
    res_dup = client.post(
        "/api/v1/organizations/my/members/invite",
        json=invite_payload,
        headers=headers,
    )
    assert res_dup.status_code == 400

    # 4. Update role
    res_update = client.patch(
        f"/api/v1/organizations/my/members/{member_id}/role",
        json={"role": "admin"},
        headers=headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["role"] == "admin"

    # 5. Verify audit log was recorded for role update
    res_logs = client.get(
        f"/api/v1/organizations/my/activity-logs?search=Test Collaborator",
        headers=headers,
    )
    assert res_logs.status_code == 200
    assert res_logs.json()["total_count"] >= 1

    # 6. Remove member
    res_delete = client.delete(
        f"/api/v1/organizations/my/members/{member_id}",
        headers=headers,
    )
    assert res_delete.status_code == 200

    # 7. Verify removal in roster
    res_final = client.get("/api/v1/organizations/my/members", headers=headers)
    assert not any(m["id"] == member_id for m in res_final.json()["members"])
