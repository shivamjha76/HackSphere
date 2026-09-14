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

