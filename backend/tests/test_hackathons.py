from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_hackathons_public():
    """Verify that public hackathons endpoint returns seeded hackathons."""
    response = client.get("/api/v1/hackathons")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Verify presence of essential card fields
    first = data[0]
    assert "title" in first
    assert "slug" in first
    assert "mode" in first
    assert "status" in first
    assert "prize_pool_summary" in first
    assert "organization" in first


def test_search_hackathons():
    """Verify search filter across title, tagline, and theme."""
    response = client.get("/api/v1/hackathons?search=Summit")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("summit" in h["title"].lower() for h in data)


def test_filter_by_mode():
    """Verify filter by mode (online vs hybrid)."""
    response = client.get("/api/v1/hackathons?mode=hybrid")
    assert response.status_code == 200
    data = response.json()
    for h in data:
        assert h["mode"] == "hybrid"


def test_get_hackathon_detail_by_slug():
    """Verify fetching hackathon details by slug."""
    # First get list to grab a real slug
    list_res = client.get("/api/v1/hackathons")
    assert list_res.status_code == 200
    first_slug = list_res.json()[0]["slug"]

    response = client.get(f"/api/v1/hackathons/{first_slug}")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == first_slug
    assert "organization" in data


def test_get_hackathon_detail_not_found():
    """Verify 404 when querying an invalid slug."""
    response = client.get("/api/v1/hackathons/definitely-not-a-real-hackathon-xyz-999")
    assert response.status_code == 404
