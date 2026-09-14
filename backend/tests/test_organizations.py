from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_organizations_public():
    """Verify listing organizations returns public verified organizations."""
    response = client.get("/api/v1/organizations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    technova = next((o for o in data if o["slug"] == "technova-labs"), None)
    assert technova is not None
    assert technova["name"] == "TechNova Labs"
    assert technova["is_verified"] is True
    assert technova["hackathons_count"] >= 1


def test_get_organization_profile():
    """Verify retrieving detailed organization profile by slug."""
    response = client.get("/api/v1/organizations/technova-labs")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "technova-labs"
    assert data["name"] == "TechNova Labs"
    assert data["is_verified"] is True
    assert "active_hackathons" in data
    assert "members" in data
    assert len(data["members"]) >= 1

    # Verify owner member
    owner = next((m for m in data["members"] if m["role"] == "owner"), None)
    assert owner is not None
    assert "organizer@technova.com" in owner["email"]


def test_get_organization_not_found():
    """Verify 404 returned for unknown organization slug."""
    response = client.get("/api/v1/organizations/unknown-slug-xyz-999")
    assert response.status_code == 404
