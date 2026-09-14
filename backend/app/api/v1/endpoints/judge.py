from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.organization import Organization
from app.models.team import Team
from app.models.submission import Submission
from app.models.judging import (
    HackathonJudge,
    JudgeAssignment,
    EvaluationCriteria,
    Evaluation,
    EvaluationScore,
)
from app.schemas.judge import (
    JudgeDashboardOverviewOut,
    JudgeDashboardStatsOut,
    JudgeAssignedHackathonOut,
    JudgeSubmissionQueueItemOut,
    JudgeUpcomingDeadlineOut,
)

router = APIRouter()


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def verify_judge_access(user: User) -> None:
    if user.is_superuser:
        return
    user_roles = [ur.role.name for ur in user.user_roles]
    if "judge" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Judge role required to access the Judge Portal.",
        )


@router.get("/dashboard", response_model=JudgeDashboardOverviewOut)
def get_judge_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns aggregate stats, assigned hackathons, and priority review queue for current judge.
    Matches UI Screen #4.
    """
    verify_judge_access(current_user)

    now = datetime.now(timezone.utc)

    # 1. Find all hackathons where current_user is appointed as judge
    judge_records = (
        db.query(HackathonJudge)
        .filter(HackathonJudge.user_id == current_user.id, HackathonJudge.status == "active")
        .all()
    )

    judge_record_ids = [j.id for j in judge_records]
    hackathon_ids = [j.hackathon_id for j in judge_records]

    # Map hackathons
    hackathons = (
        db.query(Hackathon)
        .filter(Hackathon.id.in_(hackathon_ids))
        .all()
        if hackathon_ids
        else []
    )
    hackathon_map = {h.id: h for h in hackathons}

    # 2. Find all assignments for this judge
    assignments = (
        db.query(JudgeAssignment)
        .filter(JudgeAssignment.judge_id.in_(judge_record_ids))
        .all()
        if judge_record_ids
        else []
    )

    # 3. Find all evaluations by this judge
    evaluations = (
        db.query(Evaluation)
        .filter(Evaluation.judge_id.in_(judge_record_ids))
        .all()
        if judge_record_ids
        else []
    )
    eval_by_submission = {e.submission_id: e for e in evaluations}

    # 4. Build submission queue
    assigned_team_ids = [a.team_id for a in assignments]
    submissions = (
        db.query(Submission)
        .filter(Submission.team_id.in_(assigned_team_ids))
        .all()
        if assigned_team_ids
        else []
    )

    # Also include team info
    teams = (
        db.query(Team)
        .filter(Team.id.in_(assigned_team_ids))
        .all()
        if assigned_team_ids
        else []
    )
    team_map = {t.id: t for t in teams}

    queue_items: List[JudgeSubmissionQueueItemOut] = []
    completed_eval_count = 0
    total_score_sum = 0.0

    for sub in submissions:
        h = hackathon_map.get(sub.hackathon_id)
        t = team_map.get(sub.team_id)
        if not h or not t:
            continue

        evaluation = eval_by_submission.get(sub.id)
        if evaluation:
            if evaluation.status == "submitted":
                eval_status = "completed"
                completed_eval_count += 1
                total_score_sum += evaluation.total_score
            else:
                eval_status = "in_progress"
            eval_score = evaluation.total_score
            eval_id = evaluation.id
        else:
            eval_status = "not_started"
            eval_score = None
            eval_id = None

        queue_items.append(
            JudgeSubmissionQueueItemOut(
                submission_id=sub.id,
                hackathon_id=h.id,
                hackathon_title=h.title,
                hackathon_slug=h.slug,
                team_id=t.id,
                team_name=t.name,
                team_code=t.invite_code or f"TEAM-{t.id:03d}",
                project_title=sub.project_title,
                tagline=sub.tagline,
                submitted_at=sub.submitted_at or sub.created_at,
                evaluation_status=eval_status,
                total_score=eval_score,
                evaluation_id=eval_id,
                demo_url=sub.live_demo_url,
                github_url=sub.github_url,
            )
        )

    # Sort queue: not_started first, then in_progress, then completed
    status_order = {"not_started": 0, "in_progress": 1, "completed": 2}
    queue_items.sort(key=lambda item: status_order.get(item.evaluation_status, 3))

    # 5. Compute stats
    total_assigned = len(queue_items)
    pending_evals = total_assigned - completed_eval_count
    avg_score = (
        round(total_score_sum / completed_eval_count, 1)
        if completed_eval_count > 0
        else 0.0
    )

    stats = JudgeDashboardStatsOut(
        completed_evaluations=completed_eval_count,
        pending_evaluations=pending_evals,
        total_assigned_submissions=total_assigned,
        average_score_given=avg_score,
    )

    # 6. Assigned hackathons breakdown
    assigned_hackathons: List[JudgeAssignedHackathonOut] = []
    upcoming_deadlines: List[JudgeUpcomingDeadlineOut] = []

    for h in hackathons:
        h_queue = [q for q in queue_items if q.hackathon_id == h.id]
        h_pending = sum(1 for q in h_queue if q.evaluation_status != "completed")
        h_completed = sum(1 for q in h_queue if q.evaluation_status == "completed")

        j_end = ensure_utc(h.judging_end)
        days_rem = 0
        if j_end:
            diff = j_end - now
            days_rem = max(0, diff.days)

        org_name = h.organization.name if h.organization else "Organizer"

        assigned_hackathons.append(
            JudgeAssignedHackathonOut(
                id=h.id,
                title=h.title,
                slug=h.slug,
                organization_name=org_name,
                mode=h.mode or "online",
                total_teams=len(h.teams) if h.teams else 0,
                judging_end=j_end,
                days_remaining=days_rem,
                pending_reviews_count=h_pending,
                completed_reviews_count=h_completed,
            )
        )

        if j_end and j_end > now:
            upcoming_deadlines.append(
                JudgeUpcomingDeadlineOut(
                    hackathon_id=h.id,
                    hackathon_title=h.title,
                    hackathon_slug=h.slug,
                    judging_end=j_end,
                    days_remaining=days_rem,
                    pending_count=h_pending,
                )
            )

    # Sort deadlines by urgency
    upcoming_deadlines.sort(key=lambda d: d.days_remaining)

    expertise_str = ", ".join(j.expertise for j in judge_records if j.expertise) or None

    return JudgeDashboardOverviewOut(
        judge_id=current_user.id,
        judge_name=current_user.full_name,
        expertise=expertise_str,
        stats=stats,
        assigned_hackathons=assigned_hackathons,
        submissions_queue=queue_items,
        upcoming_deadlines=upcoming_deadlines,
    )


@router.get("/submissions", response_model=List[JudgeSubmissionQueueItemOut])
def list_judge_submissions_queue(
    hackathon_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the filterable submissions review queue for the current judge.
    Supports status filter (pending, draft, completed), hackathon filtering, and keyword search.
    """
    verify_judge_access(current_user)

    overview = get_judge_dashboard(db=db, current_user=current_user)
    items = overview.submissions_queue

    if hackathon_id is not None:
        items = [i for i in items if i.hackathon_id == hackathon_id]

    if status_filter:
        s = status_filter.lower()
        if s == "pending":
            items = [i for i in items if i.evaluation_status in ["not_started", "in_progress"]]
        elif s in ["not_started", "in_progress", "completed"]:
            items = [i for i in items if i.evaluation_status == s]

    if search:
        q = search.lower()
        items = [
            i
            for i in items
            if q in i.project_title.lower()
            or q in i.team_name.lower()
            or q in i.hackathon_title.lower()
            or (i.tagline and q in i.tagline.lower())
        ]

    return items


@router.get("/hackathons", response_model=List[JudgeAssignedHackathonOut])
def list_judge_assigned_hackathons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all tournaments where the current user is appointed as a judge.
    """
    verify_judge_access(current_user)
    overview = get_judge_dashboard(db=db, current_user=current_user)
    return overview.assigned_hackathons
