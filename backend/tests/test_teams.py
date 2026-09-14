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


def test_team_lifecycle_create_join_transfer():
    """
    Comprehensive test of Chapter 9 & 10 team formation:
    1. Leader creates team 'CyberKnights'
    2. Second participant joins with invite_code
    3. Verify roster has 2 members
    4. Leader transfers captaincy
    5. Second member leaves squad
    """
    leader_headers = get_auth_header("shivam@example.com", "UserPass123!")
    member_headers = get_auth_header("rahul@example.com", "UserPass123!")

    # 1. First get a valid hackathon id (e.g. cyberverse-challenge or codecraft-3)
    hack_res = client.get("/api/v1/hackathons")
    assert hack_res.status_code == 200
    hackathon = next((h for h in hack_res.json() if h["slug"] == "cyberverse-challenge"), hack_res.json()[0])
    hack_id = hackathon["id"]

    # Ensure clean state before test
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.team import TeamMember, Team
    clean_db = SessionLocal()
    for user_email in ["shivam@example.com", "rahul@example.com"]:
        u = clean_db.query(User).filter_by(email=user_email).first()
        if u:
            tms = clean_db.query(TeamMember).join(Team).filter(Team.hackathon_id == hack_id, TeamMember.user_id == u.id).all()
            for tm in tms:
                t = tm.team
                clean_db.delete(tm)
                if t and len(t.members) <= 1:
                    clean_db.delete(t)
    clean_db.commit()
    clean_db.close()

    # 2. Leader creates team
    create_res = client.post(
        "/api/v1/teams",
        headers=leader_headers,
        json={"hackathon_id": hack_id, "name": "CyberKnights", "track": "AI Security"},
    )
    assert create_res.status_code == 200
    team_data = create_res.json()
    team_id = team_data["id"]
    invite_code = team_data["invite_code"]
    assert team_data["name"] == "CyberKnights"
    assert invite_code is not None
    assert len(team_data["members"]) == 1
    assert team_data["members"][0]["role"] == "leader"

    # 3. Second participant joins via invite code
    join_res = client.post(
        "/api/v1/teams/join",
        headers=member_headers,
        json={"invite_code": invite_code},
    )
    assert join_res.status_code == 200
    updated_team = join_res.json()
    assert len(updated_team["members"]) == 2
    roles = [m["role"] for m in updated_team["members"]]
    assert "leader" in roles
    assert "member" in roles

    # 4. Get team detail by id
    detail_res = client.get(f"/api/v1/teams/{team_id}", headers=leader_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == team_id

    # 5. Leader transfers leadership to second user (rahul)
    rahul_member = next(m for m in updated_team["members"] if m["email"] == "rahul@example.com")
    transfer_res = client.post(
        f"/api/v1/teams/{team_id}/transfer-leadership",
        headers=leader_headers,
        json={"new_leader_user_id": rahul_member["user_id"]},
    )
    assert transfer_res.status_code == 200
    transferred_team = transfer_res.json()
    rahul_after = next(m for m in transferred_team["members"] if m["email"] == "rahul@example.com")
    assert rahul_after["role"] == "leader"

    # 6. Former leader leaves squad
    leave_res = client.post(f"/api/v1/teams/{team_id}/leave", headers=leader_headers)
    assert leave_res.status_code == 200

    # 7. Remaining member leaves squad (disbands squad)
    leave_res2 = client.post(f"/api/v1/teams/{team_id}/leave", headers=member_headers)
    assert leave_res2.status_code == 200


def test_join_team_invalid_code_returns_404():
    """Verify joining with bad code returns 404."""
    headers = get_auth_header("shivam@example.com", "UserPass123!")
    res = client.post(
        "/api/v1/teams/join",
        headers=headers,
        json={"invite_code": "INVALID-CODE-XYZ"},
    )
    assert res.status_code == 404
