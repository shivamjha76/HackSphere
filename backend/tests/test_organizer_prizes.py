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


def test_organizer_prizes_unauthorized():
    """Unauthenticated request must be rejected with 401."""
    res = client.get("/api/v1/organizer/winners/prizes")
    assert res.status_code == 401


def test_organizer_prizes_participant_forbidden():
    """Participant role must receive 403 Forbidden."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/organizer/winners/prizes", headers=headers)
    assert res.status_code == 403


def test_organizer_get_prizes_overview():
    """Organizer can fetch prize pool summary and tiers matching Screen #57."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/organizer/winners/prizes", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "hackathon_id" in data
    assert "hackathon_title" in data
    assert len(data["managed_hackathons"]) >= 1

    summary = data["summary"]
    assert "₹" in summary["total_prize_pool"]
    assert summary["total_winners_count"] >= 3
    assert "₹25,000" in summary["first_place"]
    assert "₹15,000" in summary["second_place"]
    assert len(summary["prizes"]) >= 3

    # Check tier representation
    first_tier = summary["prizes"][0]
    assert first_tier["rank"] == 1
    assert "1st Place" in first_tier["place_title"]
    assert "Cash prize" in first_tier["prize_type"]
    assert "CodeCrafters" in (first_tier["assigned_team_name"] or "")


def test_organizer_update_prize_tier():
    """Organizer can edit prize amounts, descriptions, and assigned winning squads."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # 1. Fetch overview to get a tier ID
    res_overview = client.get("/api/v1/organizer/winners/prizes", headers=headers)
    assert res_overview.status_code == 200
    tiers = res_overview.json()["summary"]["prizes"]
    assert len(tiers) >= 1
    target_tier = tiers[1]  # 2nd place tier
    tier_id = target_tier["id"]

    # 2. Update tier
    res_update = client.patch(
        f"/api/v1/organizer/winners/prizes/{tier_id}",
        json={
            "amount_summary": "₹18,000",
            "notes": "Eighteen Thousand Rupees Only",
        },
        headers=headers,
    )
    assert res_update.status_code == 200
    updated_tier = res_update.json()
    assert updated_tier["amount_summary"] == "₹18,000"
    assert updated_tier["notes"] == "Eighteen Thousand Rupees Only"

    # 3. Reset back for idempotency
    client.patch(
        f"/api/v1/organizer/winners/prizes/{tier_id}",
        json={
            "amount_summary": "₹15,000",
            "notes": "Fifteen Thousand Rupees Only",
        },
        headers=headers,
    )


def test_organizer_disburse_prize_and_audit():
    """Organizer can record prize disbursement with transaction reference and audit trail."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res_overview = client.get("/api/v1/organizer/winners/prizes", headers=headers)
    assert res_overview.status_code == 200
    tiers = res_overview.json()["summary"]["prizes"]
    target_tier = tiers[0]
    tier_id = target_tier["id"]

    txn_ref = "TXN-TEST-HS-998877"
    res_disburse = client.post(
        f"/api/v1/organizer/winners/prizes/{tier_id}/disburse",
        json={
            "transaction_reference": txn_ref,
            "notes": "Direct bank wire to team leader bank account",
        },
        headers=headers,
    )
    assert res_disburse.status_code == 200
    data = res_disburse.json()
    assert data["disbursement_status"] == "disbursed"
    assert data["transaction_reference"] == txn_ref

    # Verify ActivityLog entry
    res_logs = client.get("/api/v1/organizations/my/activity-logs", headers=headers)
    assert res_logs.status_code == 200
    logs = res_logs.json()["logs"]
    assert any("PRIZE_DISBURSED" in log["action"] for log in logs)


def test_organizer_create_prize_tier():
    """Organizer can create new custom prize tiers or special mentions."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    res_overview = client.get("/api/v1/organizer/winners/prizes", headers=headers)
    hack_id = res_overview.json()["hackathon_id"]

    res_create = client.post(
        f"/api/v1/organizer/winners/prizes/tiers?hackathon_id={hack_id}",
        json={
            "place_title": "Special Mention: Best Autonomous AI Agent",
            "amount_summary": "₹5,000 + Swag",
            "prize_type": "Cash prize",
            "team_quantity": 1,
            "notes": "Recognizing breakthrough autonomous tool calling architecture",
        },
        headers=headers,
    )
    assert res_create.status_code == 200
    new_tier = res_create.json()
    assert "Best Autonomous AI Agent" in new_tier["place_title"]
    assert new_tier["amount_summary"] == "₹5,000 + Swag"
