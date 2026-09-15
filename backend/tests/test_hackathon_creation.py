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


def test_create_hackathon_unauthenticated_returns_401():
    payload = {
        "title": "Quantum Hack 2026",
        "tagline": "Next-gen computing challenge",
        "mode": "online",
        "status": "draft",
    }
    res = client.post("/api/v1/hackathons", json=payload)
    assert res.status_code == 401


def test_create_hackathon_participant_forbidden():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    payload = {
        "title": "Unauthorized Participant Hack",
        "mode": "online",
        "status": "draft",
    }
    res = client.post("/api/v1/hackathons", json=payload, headers=headers)
    assert res.status_code == 403
    assert "Organizer role required" in res.json()["detail"]


import uuid

def test_create_hackathon_organizer_success():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    uid = uuid.uuid4().hex[:6]
    title = f"FinTech Sprint {uid}"
    payload = {
        "title": title,
        "tagline": "Disrupting decentralized finance & real-time payments",
        "short_description": "A 48-hour global sprint to build resilient fintech solutions.",
        "detailed_description": "Full problem statements and guidelines for teams.",
        "theme": "FinTech & Web3",
        "mode": "hybrid",
        "status": "published",
        "min_team_size": 2,
        "max_team_size": 5,
        "prize_pool_summary": "$30,000 USD",
        "criteria": [
            {
                "name": "Innovation & Originality",
                "description": "Novelty of the architecture and concept.",
                "max_score": 25,
                "weight": 1.0,
            },
            {
                "name": "Technical Execution",
                "description": "Code quality, system stability, and API design.",
                "max_score": 25,
                "weight": 1.0,
            },
            {
                "name": "Market Viability",
                "description": "Business impact and real-world adoption feasibility.",
                "max_score": 25,
                "weight": 1.0,
            },
            {
                "name": "UX & Presentation",
                "description": "UI polish and demo clarity.",
                "max_score": 25,
                "weight": 1.0,
            },
        ],
    }
    res = client.post("/api/v1/hackathons", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["title"] == title
    assert data["slug"] == f"fintech-sprint-{uid}"
    assert data["theme"] == "FinTech & Web3"
    assert data["mode"] == "hybrid"
    assert data["status"] == "published"
    assert data["min_team_size"] == 2
    assert data["max_team_size"] == 5
    assert data["prize_pool_summary"] == "$30,000 USD"
    assert len(data["evaluation_criteria"]) == 4

    criteria_names = [c["name"] for c in data["evaluation_criteria"]]
    assert "Innovation & Originality" in criteria_names
    assert "Technical Execution" in criteria_names


def test_create_hackathon_slug_deduplication():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    uid = uuid.uuid4().hex[:6]
    title = f"Duplicate Test {uid}"
    payload1 = {
        "title": title,
        "tagline": "First run",
        "mode": "online",
        "status": "draft",
    }
    res1 = client.post("/api/v1/hackathons", json=payload1, headers=headers)
    assert res1.status_code == 200
    data1 = res1.json()
    expected_base = f"duplicate-test-{uid}"
    assert data1["slug"] == expected_base

    payload2 = {
        "title": title,
        "tagline": "Second run with identical title",
        "mode": "online",
        "status": "draft",
    }
    res2 = client.post("/api/v1/hackathons", json=payload2, headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["slug"] == f"{expected_base}-1"


def test_create_hackathon_with_branding_and_activity_log():
    """Verify Screen #58 logo, cover image, and activity log registration."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    uid = uuid.uuid4().hex[:6]
    payload = {
        "title": f"AI Global Summit {uid}",
        "tagline": "Autonomous Multi-Agent Systems Sprint",
        "short_description": "Build next-generation production AI agents in 48 hours.",
        "detailed_description": "Comprehensive guidelines, evaluation rubric, and API access.",
        "banner_url": "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        "theme": "AI/ML",
        "mode": "hybrid",
        "status": "draft",
        "visibility": "public",
        "min_team_size": 2,
        "max_team_size": 4,
        "prize_pool_summary": "₹50,000 INR + Swag Kits",
    }
    res = client.post("/api/v1/hackathons", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["banner_url"] == payload["banner_url"]
    assert data["logo_url"] == payload["logo_url"]
    assert data["status"] == "draft"

    # Verify ActivityLog entry was recorded
    from app.db.session import SessionLocal
    from app.models.organization import ActivityLog
    db = SessionLocal()
    log = db.query(ActivityLog).filter(
        ActivityLog.action == "Created Hackathon",
        ActivityLog.details.contains(payload["title"])
    ).first()
    assert log is not None
    assert log.organization_id is not None
    db.close()


