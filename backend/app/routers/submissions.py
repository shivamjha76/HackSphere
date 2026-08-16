from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Hackathon, Registration, Team, TeamMember, User
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionResponse

router = APIRouter(
    prefix="/api/hackathons",
    tags=["Submissions"]
)


@router.post(
    "/{hackathon_id}/teams/{team_id}/submission",
    response_model=SubmissionResponse,
    status_code=201
)
def create_submission(
    hackathon_id: int,
    team_id: int,
    submission_data: SubmissionCreate,
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

    team = db.query(Team).filter(
        Team.id == team_id,
        Team.hackathon_id == hackathon_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    is_leader = team.leader_id == current_user.id

    is_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.participant_id == current_user.id
    ).first()

    if not is_leader and not is_member:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this team"
        )

    existing_submission = db.query(Submission).filter(
        Submission.team_id == team_id
    ).first()

    if existing_submission:
        raise HTTPException(
            status_code=409,
            detail="Team has already submitted"
        )

    registration = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id,
        Registration.participant_id == current_user.id,
        Registration.status == "approved"
    ).first()

    if not registration:
        raise HTTPException(
            status_code=403,
            detail="You must have an approved registration"
        )

    submission = Submission(
        hackathon_id=hackathon_id,
        team_id=team_id,
        title=submission_data.title,
        description=submission_data.description,
        github_url=str(submission_data.github_url)
        if submission_data.github_url else None,
        demo_url=str(submission_data.demo_url)
        if submission_data.demo_url else None
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission