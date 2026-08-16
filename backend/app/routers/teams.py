from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Hackathon, Registration, Team, User
from app.schemas.team import TeamCreate, TeamResponse
from app.models.team_member import TeamMember

router = APIRouter(
    prefix="/api/hackathons",
    tags=["Teams"]
)


@router.post(
    "/{hackathon_id}/teams",
    response_model=TeamResponse,
    status_code=201
)
def create_team(
    hackathon_id: int,
    team_data: TeamCreate,
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id
    ).first()

    if not hackathon:
        raise HTTPException(
            status_code=404,
            detail="Hackathon not found"
        )

    if hackathon.status != "published":
        raise HTTPException(
            status_code=400,
            detail="Teams cannot be created at this stage"
        )

    registration = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id,
        Registration.participant_id == current_user.id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=403,
            detail="You must be registered for this hackathon"
        )

    if registration.status != "approved":
        raise HTTPException(
            status_code=403,
            detail="Your registration must be approved before creating a team"
        )

    if team_data.max_members < 1:
        raise HTTPException(
            status_code=400,
            detail="Team must have at least 1 member"
        )

    team = Team(
        hackathon_id=hackathon_id,
        name=team_data.name,
        leader_id=current_user.id,
        max_members=team_data.max_members
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    return team

@router.post(
    "/{hackathon_id}/teams/{team_id}/members/{participant_id}",
    response_model=TeamResponse
)
def add_team_member(
    hackathon_id: int,
    team_id: int,
    participant_id: int,
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(
        Team.id == team_id,
        Team.hackathon_id == hackathon_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    if team.leader_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the team leader can add members"
        )

    participant = db.query(User).filter(
        User.id == participant_id,
        User.role == "participant"
    ).first()

    if not participant:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    registration = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id,
        Registration.participant_id == participant_id,
        Registration.status == "approved"
    ).first()

    if not registration:
        raise HTTPException(
            status_code=403,
            detail="Participant must have an approved registration"
        )

    if participant_id == team.leader_id:
        raise HTTPException(
            status_code=400,
            detail="Participant is already the team leader"
        )

    current_member_count = db.query(TeamMember).filter(
        TeamMember.team_id == team_id
    ).count()

    if current_member_count >= team.max_members - 1:
        raise HTTPException(
            status_code=400,
            detail="Team has reached its maximum capacity"
        )

    existing_membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.participant_id == participant_id
    ).first()

    if existing_membership:
        raise HTTPException(
            status_code=409,
            detail="Participant is already a team member"
        )

    membership = TeamMember(
        team_id=team_id,
        participant_id=participant_id
    )

    db.add(membership)
    db.commit()

    return team


@router.get(
    "/{hackathon_id}/teams/{team_id}/members"
)
def get_team_members(
    hackathon_id: int,
    team_id: int,
    current_user: User = Depends(require_role("participant")),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(
        Team.id == team_id,
        Team.hackathon_id == hackathon_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    members = (
        db.query(
            TeamMember.id,
            TeamMember.participant_id,
            User.name,
            User.email
        )
        .join(
            User,
            User.id == TeamMember.participant_id
        )
        .filter(
            TeamMember.team_id == team_id
        )
        .all()
    )
    
    members_data = [
    {
        "id": member.id,
        "participant_id": member.participant_id,
        "name": member.name,
        "email": member.email
    }
    for member in members
]

    return {
    "team_id": team.id,
    "team_name": team.name,
    "leader_id": team.leader_id,
    "members": members_data
}