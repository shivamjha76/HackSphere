from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Hackathon, User
from app.models.judge import Judge
from app.schemas.judge import JudgeCreate, JudgeResponse
from app.core.security import require_role

router = APIRouter(
    prefix="/api/hackathons",
    tags=["Judges"]
)


@router.post(
    "/{hackathon_id}/judges",
    response_model=JudgeResponse,
    status_code=201
)
def assign_judge(
    hackathon_id: int,
    judge_data: JudgeCreate,
    current_user: User = Depends(require_role("organizer")),
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

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this hackathon"
        )

    judge_user = db.query(User).filter(
        User.id == judge_data.judge_id
    ).first()

    if not judge_user:
        raise HTTPException(
            status_code=404,
            detail="Judge user not found"
        )

    existing_judge = db.query(Judge).filter(
        Judge.hackathon_id == hackathon_id,
        Judge.judge_id == judge_data.judge_id
    ).first()

    if existing_judge:
        raise HTTPException(
            status_code=409,
            detail="User is already assigned as a judge"
        )

    judge = Judge(
        hackathon_id=hackathon_id,
        judge_id=judge_data.judge_id
    )

    db.add(judge)
    db.commit()
    db.refresh(judge)

    return judge


@router.get(
    "/{hackathon_id}/judges"
)
def get_hackathon_judges(
    hackathon_id: int,
    current_user: User = Depends(require_role("organizer")),
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

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this hackathon"
        )

    judges = db.query(Judge).filter(
        Judge.hackathon_id == hackathon_id
    ).all()

    return judges


@router.delete(
    "/{hackathon_id}/judges/{judge_id}"
)
def remove_judge(
    hackathon_id: int,
    judge_id: int,
    current_user: User = Depends(require_role("organizer")),
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

    if hackathon.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this hackathon"
        )

    judge = db.query(Judge).filter(
        Judge.id == judge_id,
        Judge.hackathon_id == hackathon_id
    ).first()

    if not judge:
        raise HTTPException(
            status_code=404,
            detail="Judge assignment not found"
        )

    db.delete(judge)
    db.commit()

    return {
        "message": "Judge removed successfully"
    }