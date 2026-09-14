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


def test_get_winners_overview_public():
    res = client.get("/api/v1/winners/hackathons/ai-hack-summit-2026")
    assert res.status_code == 200
    data = res.json()
    assert data["hackathon_slug"] == "ai-hack-summit-2026"
    assert "winners" in data
    assert "prizes_overview" in data
    assert len(data["winners"]) >= 1
    # Check 1st place
    w1 = data["winners"][0]
    assert w1["rank"] == 1
    assert "CodeCrafters" in w1["team_name"]


def test_get_leaderboard_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.get("/api/v1/winners/hackathons/ai-hack-summit-2026/leaderboard", headers=headers)
    assert res.status_code == 403


def test_get_leaderboard_organizer():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/winners/hackathons/ai-hack-summit-2026/leaderboard", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    top_entry = items[0]
    assert top_entry["rank"] == 1
    assert "CodeCrafters" in top_entry["team_name"]
    assert top_entry["average_score"] >= 90.0
    assert top_entry["is_winner"] is True


def test_get_prizes_overview_matches_screen_57():
    res = client.get("/api/v1/winners/hackathons/ai-hack-summit-2026/prizes")
    assert res.status_code == 200
    data = res.json()
    assert "50,000" in data["total_prize_pool_summary"]
    prizes = data["prizes"]
    assert len(prizes) == 4
    assert prizes[0]["amount_summary"] == "₹25,000"
    assert prizes[0]["place_title"] == "1st Place"
    assert prizes[1]["amount_summary"] == "₹15,000"
    assert prizes[1]["place_title"] == "2nd Place"
    assert prizes[2]["amount_summary"] == "₹10,000"
    assert prizes[2]["place_title"] == "3rd Place"
    assert "Goodies" in prizes[3]["amount_summary"]


def test_list_hackathon_certificates_organizer():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/winners/hackathons/ai-hack-summit-2026/certificates", headers=headers)
    assert res.status_code == 200
    certs = res.json()
    assert len(certs) >= 1
    assert any("CodeCrafters" in (c.get("team_name") or "") for c in certs)


def test_declare_winners_full_lifecycle():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Declare winners with auto-certificates and announcement broadcast
    payload = {
        "winners": [
            {
                "team_id": 1,
                "rank": 1,
                "title": "1st Place Grand Winner",
                "prize_amount": "₹25,000",
                "prize_type": "cash",
                "notes": "Decisive victory in applied autonomous AI.",
            },
            {
                "team_id": 2,
                "rank": 2,
                "title": "1st Runner Up",
                "prize_amount": "₹15,000",
                "prize_type": "cash",
                "notes": "Exceptional sustainable AI prototype.",
            },
        ],
        "auto_issue_certificates": True,
        "broadcast_announcement": True,
    }

    res = client.post(
        "/api/v1/winners/hackathons/ai-hack-summit-2026/declare",
        json=payload,
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_completed"] is True
    assert len(data["winners"]) == 2
    assert data["winners"][0]["title"] == "1st Place Grand Winner"

    # Verify announcement was broadcast
    res_ann = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026")
    announcements = res_ann.json()
    assert any("Official Winners Announced" in a["title"] for a in announcements)

    # Teardown: Restore hackathon status to 'hacking' for subsequent test suites
    from app.db.session import SessionLocal
    from app.models.hackathon import Hackathon
    db = SessionLocal()
    h = db.query(Hackathon).filter_by(slug="ai-hack-summit-2026").first()
    if h:
        h.status = "hacking"
        db.commit()
    db.close()


def test_bulk_issue_certificates():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.post(
        "/api/v1/winners/hackathons/ai-hack-summit-2026/certificates/bulk-issue",
        json={"certificate_type": "all"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "total_certificates" in data
    assert data["total_certificates"] >= 1
