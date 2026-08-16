from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import User
from app.models.hackathon import Hackathon
from app.models.judge import Judge
from app.models.judge_score import JudgeScore
from app.models.submission import Submission
from app.schemas.judge_score import JudgeScoreCreate, JudgeScoreResponse

router = APIRouter(
    prefix="/api/hackathons",
    tags=["Judge Scores"]
)


@router.post(
    "/{hackathon_id}/scores",
    response_model=JudgeScoreResponse,
    status_code=201
)
def create_score(
    hackathon_id: int,
    score_data: JudgeScoreCreate,
    current_user: User = Depends(require_role("judge")),
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

    judge_assignment = db.query(Judge).filter(
        Judge.hackathon_id == hackathon_id,
        Judge.judge_id == current_user.id
    ).first()

    if not judge_assignment:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned as a judge for this hackathon"
        )

    submission = db.query(Submission).filter(
        Submission.id == score_data.submission_id,
        Submission.hackathon_id == hackathon_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    existing_score = db.query(JudgeScore).filter(
        JudgeScore.submission_id == score_data.submission_id,
        JudgeScore.judge_id == current_user.id
    ).first()

    if existing_score:
        raise HTTPException(
            status_code=409,
            detail="You have already scored this submission"
        )

    score = JudgeScore(
        submission_id=score_data.submission_id,
        judge_id=current_user.id,
        innovation=score_data.innovation,
        technical_execution=score_data.technical_execution,
        impact=score_data.impact,
        presentation=score_data.presentation,
        feedback=score_data.feedback
    )

    db.add(score)
    db.commit()
    db.refresh(score)

    return score