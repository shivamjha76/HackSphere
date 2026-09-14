import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon, HackathonRegistration
from app.models.team import Team, TeamMember
from app.schemas.team import (
    TeamDetailOut,
    TeamSummaryOut,
    TeamMemberOut,
    TeamCreatePayload,
    TeamJoinPayload,
    TeamTransferLeaderPayload,
)
from app.api.v1.endpoints.hackathons import ensure_utc, calculate_user_level

router = APIRouter()


def map_team_detail_out(team: Team) -> TeamDetailOut:
    """Helper to convert Team model to rich TeamDetailOut with member roster."""
    members_out = []
    for m in (team.members or []):
        user_name = m.user.full_name if m.user else "Unknown Hacker"
        user_email = m.user.email if m.user else ""
        user_avatar = m.user.avatar_url if m.user else None
        user_skills = m.user.skills if m.user else None

        members_out.append(
            TeamMemberOut(
                id=m.id,
                user_id=m.user_id,
                full_name=user_name,
                email=user_email,
                avatar_url=user_avatar,
                skills=user_skills,
                role=m.role,
                status=m.status,
                joined_at=m.joined_at,
            )
        )

    # Sort members so leader is first
    members_out.sort(key=lambda m: 0 if m.role == "leader" else 1)

    has_sub = bool(team.submissions and len(team.submissions) > 0)

    return TeamDetailOut(
        id=team.id,
        hackathon_id=team.hackathon_id,
        hackathon_title=team.hackathon.title if team.hackathon else "Hackathon",
        hackathon_slug=team.hackathon.slug if team.hackathon else "hackathon",
        min_team_size=team.hackathon.min_team_size if team.hackathon else 1,
        max_team_size=team.hackathon.max_team_size if team.hackathon else 4,
        name=team.name,
        invite_code=team.invite_code,
        track=team.track,
        status=team.status,
        is_frozen=team.is_frozen,
        created_by_user_id=team.created_by_user_id,
        members=members_out,
        has_submission=has_sub,
        created_at=team.created_at,
    )


def generate_unique_invite_code(db: Session, team_name: str) -> str:
    """Generates a memorable unique invite code like 'BB-89K2'."""
    clean_words = "".join(w[0] for w in team_name.split() if w).upper()[:3] or "HS"
    while True:
        code = f"{clean_words}-{secrets.token_hex(2).upper()}"
        exists = db.query(Team).filter_by(invite_code=code).first()
        if not exists:
            return code


@router.post("", response_model=TeamDetailOut, summary="Create New Squad")
def create_team(
    payload: TeamCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeamDetailOut:
    """
    Creates a new hackathon squad, generates secret invite code,
    and sets current user as team leader per Chapter 9 & 10.
    """
    hackathon = (
        db.query(Hackathon)
        .filter(Hackathon.id == payload.hackathon_id)
        .first()
    )
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found.",
        )

    # Check freeze deadline (Chapter 20)
    now = datetime.now(timezone.utc)
    reg_end = ensure_utc(hackathon.registration_end)
    if reg_end and now > reg_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is closed for this hackathon. Team formation is frozen.",
        )

    # Check if user already has a team in this hackathon
    existing = (
        db.query(TeamMember)
        .join(Team)
        .filter(Team.hackathon_id == hackathon.id, TeamMember.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of a squad for this hackathon.",
        )

    # Auto-register user if not registered yet
    reg = (
        db.query(HackathonRegistration)
        .filter_by(hackathon_id=hackathon.id, user_id=current_user.id)
        .first()
    )
    if not reg:
        reg = HackathonRegistration(
            hackathon_id=hackathon.id,
            user_id=current_user.id,
            status="registered",
            registered_at=now,
        )
        db.add(reg)
        current_user.xp += 50
        current_user.level = calculate_user_level(current_user.xp)

    # Generate invite code and create team
    code = generate_unique_invite_code(db, payload.name)
    team = Team(
        hackathon_id=hackathon.id,
        name=payload.name,
        track=payload.track,
        invite_code=code,
        status="registered",
        is_frozen=False,
        created_by_user_id=current_user.id,
    )
    db.add(team)
    db.flush()

    # Add creator as leader
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="leader",
        status="active",
        joined_at=now,
    )
    db.add(member)

    # Gamification bonus (+30 XP for forming squad)
    current_user.xp += 30
    current_user.level = calculate_user_level(current_user.xp)
    db.add(current_user)

    db.commit()

    # Reload with relationships
    created_team = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.id == team.id)
        .first()
    )

    return map_team_detail_out(created_team)


@router.post("/join", response_model=TeamDetailOut, summary="Join Squad via Invite Code")
def join_team(
    payload: TeamJoinPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeamDetailOut:
    """
    Joins an existing squad via secret invite code per Chapter 10.
    Checks team freeze policy and maximum capacity.
    """
    code = payload.invite_code.strip().upper()
    team = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.invite_code == code)
        .first()
    )
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No squad found matching invite code '{code}'.",
        )

    # Check team freeze policy (Chapter 20)
    now = datetime.now(timezone.utc)
    reg_end = ensure_utc(team.hackathon.registration_end) if team.hackathon else None
    if team.is_frozen or (reg_end and now > reg_end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team roster is frozen. New members cannot join this squad.",
        )

    # Check team capacity
    max_capacity = team.hackathon.max_team_size if team.hackathon else 4
    if len(team.members) >= max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Squad '{team.name}' has reached maximum capacity ({max_capacity} members).",
        )

    # Check if user already in team
    if any(m.user_id == current_user.id for m in team.members):
        return map_team_detail_out(team)

    # Check if user in another team for this hackathon
    existing = (
        db.query(TeamMember)
        .join(Team)
        .filter(Team.hackathon_id == team.hackathon_id, TeamMember.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already in another squad for this hackathon.",
        )

    # Auto-register user for hackathon if needed
    reg = (
        db.query(HackathonRegistration)
        .filter_by(hackathon_id=team.hackathon_id, user_id=current_user.id)
        .first()
    )
    if not reg:
        reg = HackathonRegistration(
            hackathon_id=team.hackathon_id,
            user_id=current_user.id,
            status="registered",
            registered_at=now,
        )
        db.add(reg)
        current_user.xp += 50

    # Add user as member
    new_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="member",
        status="active",
        joined_at=now,
    )
    db.add(new_member)

    # Award +30 XP for joining squad
    current_user.xp += 30
    current_user.level = calculate_user_level(current_user.xp)
    db.add(current_user)

    db.commit()

    # Reload team
    updated_team = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.id == team.id)
        .first()
    )
    return map_team_detail_out(updated_team)


@router.get("/my", response_model=List[TeamSummaryOut], summary="List My Squads")
def get_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[TeamSummaryOut]:
    """
    Returns all squads current user belongs to.
    """
    memberships = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == current_user.id)
        .options(
            joinedload(TeamMember.team).joinedload(Team.hackathon),
            joinedload(TeamMember.team).joinedload(Team.members),
        )
        .all()
    )

    summaries = []
    for m in memberships:
        t = m.team
        if not t:
            continue
        summaries.append(
            TeamSummaryOut(
                id=t.id,
                hackathon_id=t.hackathon_id,
                hackathon_title=t.hackathon.title if t.hackathon else "Hackathon",
                hackathon_slug=t.hackathon.slug if t.hackathon else "hackathon",
                name=t.name,
                invite_code=t.invite_code,
                members_count=len(t.members) if t.members else 1,
                max_members=t.hackathon.max_team_size if t.hackathon else 4,
                is_leader=(m.role == "leader"),
                is_frozen=t.is_frozen,
                created_at=t.created_at,
            )
        )
    return summaries


@router.get("/{team_id}", response_model=TeamDetailOut, summary="Get Squad Details")
def get_team_detail(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeamDetailOut:
    """
    Retrieves full squad detail and member roster per UI screen #15 & #71.
    """
    team = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.id == team_id)
        .first()
    )
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Squad not found.",
        )

    return map_team_detail_out(team)


@router.post("/{team_id}/transfer-leadership", response_model=TeamDetailOut, summary="Transfer Squad Leadership")
def transfer_leadership(
    team_id: int,
    payload: TeamTransferLeaderPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TeamDetailOut:
    """
    Transfers team leadership / captaincy to a teammate. Leader only, non-frozen.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Squad not found.")

    if team.is_frozen:
        raise HTTPException(status_code=400, detail="Roster is frozen. Leadership cannot be transferred.")

    # Check caller is leader
    caller_member = db.query(TeamMember).filter_by(team_id=team.id, user_id=current_user.id).first()
    if not caller_member or caller_member.role != "leader":
        raise HTTPException(status_code=403, detail="Only the Team Leader can transfer captaincy.")

    # Check target is member
    target_member = db.query(TeamMember).filter_by(team_id=team.id, user_id=payload.new_leader_user_id).first()
    if not target_member:
        raise HTTPException(status_code=400, detail="Target user is not a member of this squad.")

    caller_member.role = "member"
    target_member.role = "leader"
    team.created_by_user_id = target_member.user_id

    db.commit()

    updated = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.id == team.id)
        .first()
    )
    return map_team_detail_out(updated)


@router.post("/{team_id}/leave", summary="Leave Squad")
def leave_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Leaves squad. If sole member, disbands team. If leader with other members, auto-promotes next member.
    """
    team = (
        db.query(Team)
        .options(joinedload(Team.members))
        .filter(Team.id == team_id)
        .first()
    )
    if not team:
        raise HTTPException(status_code=404, detail="Squad not found.")

    if team.is_frozen:
        raise HTTPException(status_code=400, detail="Roster is frozen. You cannot leave after deadline.")

    member = db.query(TeamMember).filter_by(team_id=team.id, user_id=current_user.id).first()
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member of this squad.")

    # If sole member, delete team
    if len(team.members) <= 1:
        db.delete(member)
        db.delete(team)
        db.commit()
        return {"message": "Squad disbanded as last member left."}

    # If leader, promote next member
    if member.role == "leader":
        other_members = [m for m in team.members if m.user_id != current_user.id]
        if other_members:
            other_members[0].role = "leader"
            team.created_by_user_id = other_members[0].user_id

    db.delete(member)
    db.commit()
    return {"message": "Successfully left squad."}


@router.delete("/{team_id}/members/{user_id}", summary="Remove Member from Squad")
def remove_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Leader removes a member from squad before roster freeze.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Squad not found.")

    if team.is_frozen:
        raise HTTPException(status_code=400, detail="Roster is frozen. Members cannot be removed.")

    caller = db.query(TeamMember).filter_by(team_id=team.id, user_id=current_user.id).first()
    if not caller or caller.role != "leader":
        raise HTTPException(status_code=403, detail="Only the Team Leader can remove members.")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Leader cannot remove themselves. Use leave endpoint.")

    target = db.query(TeamMember).filter_by(team_id=team.id, user_id=user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Member not found in this squad.")

    db.delete(target)
    db.commit()
    return {"message": "Member removed from squad."}
