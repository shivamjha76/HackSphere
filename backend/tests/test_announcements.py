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


def test_announcement_create_unauthenticated_returns_401():
    res = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={"title": "Test Title", "content": "Test content description"},
    )
    assert res.status_code == 401


def test_announcement_create_participant_forbidden_returns_403():
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={"title": "Hacker Broadcast", "content": "Unauthorized message"},
        headers=headers,
    )
    assert res.status_code == 403


def test_organizer_create_published_announcement():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={
            "title": "Welcome to AI Hack Summit 2026!",
            "content": "Get ready to build, innovate, and win amazing prizes worth 50,000 INR.",
            "priority": "important",
            "status": "published",
            "target_audience": "all",
            "is_pinned": True,
        },
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Welcome to AI Hack Summit 2026!"
    assert data["priority"] == "important"
    assert data["status"] == "published"
    assert data["is_pinned"] is True
    assert data["views_count"] == 0
    assert "author_name" in data


def test_public_and_participant_list_announcements():
    # Public (no auth) should see only published announcements
    res = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    # Verify every returned item has status == 'published'
    for item in items:
        assert item["status"] == "published"


def test_organizer_creates_draft_and_scheduled_announcements():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # 1. Create a draft
    res_draft = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={
            "title": "Draft Agenda Updates",
            "content": "WIP internal schedule details.",
            "priority": "normal",
            "status": "draft",
            "target_audience": "judges",
            "is_pinned": False,
        },
        headers=headers,
    )
    assert res_draft.status_code == 201
    draft_id = res_draft.json()["id"]

    # 2. Create a scheduled item
    res_sched = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={
            "title": "Judging Round Begins Tomorrow",
            "content": "Judges will begin reviewing code submissions at 9:00 AM.",
            "priority": "urgent",
            "status": "scheduled",
            "target_audience": "all",
            "is_pinned": False,
        },
        headers=headers,
    )
    assert res_sched.status_code == 201
    sched_id = res_sched.json()["id"]

    # 3. Verify public still cannot see draft or scheduled
    pub_res = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026")
    pub_ids = [a["id"] for a in pub_res.json()]
    assert draft_id not in pub_ids
    assert sched_id not in pub_ids

    # 4. Organizer can see all or filter by status
    org_res = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026", headers=headers)
    org_ids = [a["id"] for a in org_res.json()]
    assert draft_id in org_ids
    assert sched_id in org_ids

    # 5. Filter by status=draft
    drafts_only = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026?status=draft", headers=headers)
    assert all(a["status"] == "draft" for a in drafts_only.json())


def test_announcement_stats():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_announcements"] >= 3
    assert stats["published_count"] >= 1
    assert stats["draft_count"] >= 1
    assert stats["scheduled_count"] >= 1
    assert stats["published_percentage"] > 0


def test_toggle_pin_and_ordering():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Create unpinned item
    res = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={
            "title": "Code of Conduct Notice",
            "content": "Be respectful and adhere to community guidelines.",
            "priority": "normal",
            "status": "published",
            "is_pinned": False,
        },
        headers=headers,
    )
    assert res.status_code == 201
    a_id = res.json()["id"]
    assert res.json()["is_pinned"] is False

    # Toggle pin
    res_pin = client.post(
        f"/api/v1/announcements/hackathons/ai-hack-summit-2026/{a_id}/pin",
        headers=headers,
    )
    assert res_pin.status_code == 200
    assert res_pin.json()["is_pinned"] is True

    # Pinned announcement must be first in list
    res_list = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026", headers=headers)
    first_item = res_list.json()[0]
    assert first_item["is_pinned"] is True


def test_record_view_counter():
    # Fetch an announcement
    res_list = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026")
    assert res_list.status_code == 200
    announcement = res_list.json()[0]
    initial_views = announcement["views_count"]

    # Public record view
    res_view = client.post(f"/api/v1/announcements/hackathons/ai-hack-summit-2026/{announcement['id']}/view")
    assert res_view.status_code == 200
    assert res_view.json()["views_count"] == initial_views + 1


def test_update_and_delete_announcement():
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    # Create disposable announcement
    res = client.post(
        "/api/v1/announcements/hackathons/ai-hack-summit-2026",
        json={
            "title": "Temporary Announcement",
            "content": "To be modified and removed.",
            "status": "draft",
        },
        headers=headers,
    )
    assert res.status_code == 201
    item_id = res.json()["id"]

    # Update announcement
    res_update = client.put(
        f"/api/v1/announcements/hackathons/ai-hack-summit-2026/{item_id}",
        json={"title": "Updated Title", "priority": "urgent"},
        headers=headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Updated Title"
    assert res_update.json()["priority"] == "urgent"

    # Delete announcement
    res_del = client.delete(
        f"/api/v1/announcements/hackathons/ai-hack-summit-2026/{item_id}",
        headers=headers,
    )
    assert res_del.status_code == 200
    assert "deleted" in res_del.json()["message"]


def test_get_announcement_templates():
    """Any client can fetch pre-configured templates matching Chapter 21."""
    res = client.get("/api/v1/announcements/templates")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    ids = [t["id"] for t in data]
    assert "welcome_kickoff" in ids
    assert "deadline_extension" in ids
    assert "prizes_reveal" in ids
    assert "judging_kickoff" in ids
    assert "code_of_conduct" in ids


def test_get_announcement_analytics():
    """Organizer can fetch engagement analytics and channel delivery rates."""
    headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")
    res = client.get("/api/v1/announcements/hackathons/ai-hack-summit-2026/analytics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_broadcasts" in data
    assert "total_impressions" in data
    assert data["total_impressions"] >= 1000
    assert len(data["channel_delivery"]) >= 3
    assert len(data["hourly_impressions"]) >= 6

