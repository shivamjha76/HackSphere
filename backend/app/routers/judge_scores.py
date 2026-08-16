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
from app.schemas.submission import SubmissionResponse

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


@router.get(
    "/{hackathon_id}/submissions/{submission_id}/scores",
    response_model=list[JudgeScoreResponse]
)
def get_submission_scores(
    hackathon_id: int,
    submission_id: int,
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

    submission = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.hackathon_id == hackathon_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    scores = db.query(JudgeScore).filter(
        JudgeScore.submission_id == submission_id
    ).all()

    return scores


@router.get(
    "/{hackathon_id}/submissions/{submission_id}/total-score"
)
def get_submission_total_score(
    hackathon_id: int,
    submission_id: int,
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

    submission = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.hackathon_id == hackathon_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    scores = db.query(JudgeScore).filter(
        JudgeScore.submission_id == submission_id
    ).all()

    if not scores:
        return {
            "submission_id": submission_id,
            "judge_count": 0,
            "total_score": 0,
            "average_score": 0
        }

    total_score = sum(
        score.innovation
        + score.technical_execution
        + score.impact
        + score.presentation
        for score in scores
    )

    average_score = total_score / len(scores)

    return {
        "submission_id": submission_id,
        "judge_count": len(scores),
        "total_score": total_score,
        "average_score": round(average_score, 2)
    }
    
    
@router.get(
    "/{hackathon_id}/leaderboard"
)
def get_leaderboard(
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

    submissions = db.query(Submission).filter(
        Submission.hackathon_id == hackathon_id
    ).all()

    leaderboard = []

    for submission in submissions:
        scores = db.query(JudgeScore).filter(
            JudgeScore.submission_id == submission.id
        ).all()

        total_score = sum(
            score.innovation
            + score.technical_execution
            + score.impact
            + score.presentation
            for score in scores
        )

        average_score = (
            total_score / len(scores)
            if scores else 0
        )

        leaderboard.append({
            "submission_id": submission.id,
            "team_id": submission.team_id,
            "title": submission.title,
            "judge_count": len(scores),
            "total_score": total_score,
            "average_score": round(average_score, 2),
            "status": submission.status
        })

    leaderboard.sort(
        key=lambda item: item["average_score"],
        reverse=True
    )

    for rank, item in enumerate(leaderboard, start=1):
        item["rank"] = rank

    return leaderboard


@router.patch(
    "/{hackathon_id}/submissions/{submission_id}/winner",
    response_model=SubmissionResponse
)
def declare_winner(
    hackathon_id: int,
    submission_id: int,
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

    submission = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.hackathon_id == hackathon_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    existing_winner = db.query(Submission).filter(
    Submission.hackathon_id == hackathon_id,
    Submission.status == "winner",
    Submission.id != submission_id
).first()

    if existing_winner:
     raise HTTPException(
        status_code=409,
        detail="A winner has already been declared for this hackathon"
    )

    submission.status = "winner"

    db.commit()
    db.refresh(submission)

    return submission