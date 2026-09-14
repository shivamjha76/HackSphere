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


def test_submission_unauthenticated_returns_401():
    res = client.get("/api/v1/submissions/my")
    assert res.status_code == 401


def test_submission_lifecycle_draft_update_lock_and_xp():
    """
    Tests Chapter 12 project submission lifecycle:
    1. Team creates draft deliverables.
    2. Updates submission and verifies version bump.
    3. Locks submission for judging and verifies +100 XP awarded.
    """
    leader_headers = get_auth_header("shivam@example.com", "UserPass123!")

    # Find open hackathon
    hack_res = client.get("/api/v1/hackathons")
    assert hack_res.status_code == 200
    hackathon = hack_res.json()[0]
    hack_id = hackathon["id"]

    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.team import TeamMember, Team
    from app.models.submission import Submission

    # Clean up test user teams for this hackathon
    db = SessionLocal()
    user = db.query(User).filter_by(email="shivam@example.com").first()
    initial_xp = user.xp
    tms = db.query(TeamMember).join(Team).filter(Team.hackathon_id == hack_id, TeamMember.user_id == user.id).all()
    for tm in tms:
        t = tm.team
        subs = db.query(Submission).filter_by(team_id=t.id).all()
        for s in subs:
            db.delete(s)
        db.delete(tm)
        if t:
            db.delete(t)
    db.commit()

    # 1. Create team
    team_res = client.post(
        "/api/v1/teams",
        headers=leader_headers,
        json={"hackathon_id": hack_id, "name": "SubmissionTestSquad", "track": "AI & Web3"},
    )
    assert team_res.status_code == 200
    team_id = team_res.json()["id"]

    # 2. Save draft submission
    draft_res = client.post(
        "/api/v1/submissions",
        headers=leader_headers,
        json={
            "team_id": team_id,
            "project_title": "Project Nova",
            "tagline": "AI powered decentralized analytics",
            "description": "Nova helps developers analyze decentralized applications in real time.",
            "github_url": "https://github.com/shivamjha76/project-nova",
            "live_demo_url": "https://nova-demo.vercel.app",
            "is_final": False,
        },
    )
    assert draft_res.status_code == 200
    draft_data = draft_res.json()
    assert draft_data["status"] == "draft"
    assert draft_data["version"] == 1
    assert not draft_data["is_locked"]
    assert "SUB-" in draft_data["submission_code"]
    sub_id = draft_data["id"]

    # 3. Update deliverables (version increment)
    update_res = client.put(
        f"/api/v1/submissions/{sub_id}",
        headers=leader_headers,
        json={
            "video_url": "https://youtube.com/watch?v=demo123",
            "presentation_url": "https://slides.google.com/presentation/d/demo",
        },
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["version"] == 2
    assert updated_data["video_url"] == "https://youtube.com/watch?v=demo123"

    # 4. Lock deliverables for judging
    lock_res = client.post(
        f"/api/v1/submissions/{sub_id}/lock",
        headers=leader_headers,
    )
    assert lock_res.status_code == 200
    locked_data = lock_res.json()
    assert locked_data["is_locked"] is True
    assert locked_data["status"] == "submitted"
    assert locked_data["can_edit"] is False

    # Verify XP increased by 100
    db.expire_all()
    user_after = db.query(User).filter_by(email="shivam@example.com").first()
    # Team creation awarded +30 XP, lock awarded +100 XP
    assert user_after.xp >= initial_xp + 100

    # 5. Check /my submissions
    my_subs_res = client.get("/api/v1/submissions/my", headers=leader_headers)
    assert my_subs_res.status_code == 200
    my_subs = my_subs_res.json()
    assert any(s["id"] == sub_id for s in my_subs)

    # 6. Check /team/{team_id}
    by_team_res = client.get(f"/api/v1/submissions/team/{team_id}", headers=leader_headers)
    assert by_team_res.status_code == 200
    assert by_team_res.json()["id"] == sub_id

    # Clean up test squad and submission
    sub = db.query(Submission).filter_by(id=sub_id).first()
    if sub:
        db.delete(sub)
    tm = db.query(TeamMember).filter_by(team_id=team_id).first()
    if tm:
        db.delete(tm)
    team = db.query(Team).filter_by(id=team_id).first()
    if team:
        db.delete(team)
    db.commit()
    db.close()


def test_submission_non_member_forbidden():
    leader_headers = get_auth_header("shivam@example.com", "UserPass123!")
    non_member_headers = get_auth_header("organizer@technova.com", "OrganizerPass123!")

    hack_res = client.get("/api/v1/hackathons")
    hack_id = hack_res.json()[0]["id"]

    # Shivam creates team
    team_res = client.post(
        "/api/v1/teams",
        headers=leader_headers,
        json={"hackathon_id": hack_id, "name": "SecureAlphaSquad"},
    )
    assert team_res.status_code == 200
    team_id = team_res.json()["id"]

    # Non-member tries to submit
    bad_res = client.post(
        "/api/v1/submissions",
        headers=non_member_headers,
        json={
            "team_id": team_id,
            "project_title": "Intruder App",
        },
    )
    assert bad_res.status_code == 403

    # Clean up
    from app.db.session import SessionLocal
    from app.models.team import Team, TeamMember
    db = SessionLocal()
    tm = db.query(TeamMember).filter_by(team_id=team_id).first()
    if tm:
        db.delete(tm)
    team = db.query(Team).filter_by(id=team_id).first()
    if team:
        db.delete(team)
    db.commit()
    db.close()
