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
    RubricCriterionItem,
    EvaluationScoreItem,
    ExistingEvaluationOut,
    SubmissionReviewTeamMemberOut,
    SubmissionReviewTeamOut,
    SubmissionReviewHackathonOut,
    SubmissionReviewDetailOut,
    EvaluationScoreInput,
    EvaluationSubmitPayload,
    EvaluationResultOut,
    JudgingRuleItem,
    JudgingDosDonts,
    JudgingMilestoneDates,
    JudgingGuidelinesOut,
    ConflictOfInterestPayload,
    ConflictOfInterestOut,
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


def ensure_evaluation_criteria(db: Session, hackathon_id: int) -> List[EvaluationCriteria]:
    """
    Ensures standard rubric criteria matching UI Screen #2 exist for the hackathon.
    """
    criteria = (
        db.query(EvaluationCriteria)
        .filter(EvaluationCriteria.hackathon_id == hackathon_id)
        .order_by(EvaluationCriteria.id)
        .all()
    )
    if not criteria:
        default_criteria = [
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Problem Definition",
                description="Clarity and relevance of the problem statement and its significance.",
                max_score=20,
                weight=1.0,
            ),
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Innovation & Creativity",
                description="Uniqueness of the idea and creativity in approach.",
                max_score=20,
                weight=1.0,
            ),
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Technical Feasibility",
                description="How well the solution works and addresses the problem.",
                max_score=20,
                weight=1.0,
            ),
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Code Quality",
                description="Architecture, use of technology, and technical complexity.",
                max_score=20,
                weight=1.0,
            ),
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Impact & Scalability",
                description="Potential real-world impact and ability to scale.",
                max_score=10,
                weight=1.0,
            ),
            EvaluationCriteria(
                hackathon_id=hackathon_id,
                name="Presentation & Demo",
                description="Quality of the demo, slides, and team communication.",
                max_score=10,
                weight=1.0,
            ),
        ]
        db.add_all(default_criteria)
        db.commit()
        for c in default_criteria:
            db.refresh(c)
        criteria = default_criteria
    return criteria


def get_judge_record(db: Session, user: User, hackathon_id: int) -> HackathonJudge:
    """
    Finds or provisions active HackathonJudge record for user in hackathon.
    """
    judge_record = (
        db.query(HackathonJudge)
        .filter(
            HackathonJudge.user_id == user.id,
            HackathonJudge.hackathon_id == hackathon_id,
            HackathonJudge.status == "active",
        )
        .first()
    )
    if not judge_record:
        if user.is_superuser:
            judge_record = (
                db.query(HackathonJudge)
                .filter(HackathonJudge.hackathon_id == hackathon_id)
                .first()
            )
            if not judge_record:
                judge_record = HackathonJudge(
                    hackathon_id=hackathon_id,
                    user_id=user.id,
                    expertise="SuperAdmin Reviewer",
                    status="active",
                )
                db.add(judge_record)
                db.commit()
                db.refresh(judge_record)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not appointed as an active judge for this hackathon.",
            )
    return judge_record


@router.get("/submissions/{submission_id}/review", response_model=SubmissionReviewDetailOut)
def get_submission_for_review(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns full submission review payload matching Screen #2:
    Deliverables (GitHub, demo, PPT, video), team roster, hackathon info,
    multi-criteria rubric, and existing drafted/submitted evaluation.
    """
    verify_judge_access(current_user)

    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found.",
        )

    judge_record = get_judge_record(db, current_user, submission.hackathon_id)

    # Check if this team is assigned to this judge (if assignments exist for this hackathon)
    assignment = (
        db.query(JudgeAssignment)
        .filter(
            JudgeAssignment.judge_id == judge_record.id,
            JudgeAssignment.team_id == submission.team_id,
        )
        .first()
    )
    if not assignment and not current_user.is_superuser:
        has_assignments = (
            db.query(JudgeAssignment)
            .filter(JudgeAssignment.hackathon_id == submission.hackathon_id)
            .first()
        )
        if has_assignments:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to evaluate this team's submission.",
            )

    # 1. Criteria
    criteria = ensure_evaluation_criteria(db, submission.hackathon_id)
    criteria_out = [
        RubricCriterionItem(
            id=c.id,
            name=c.name,
            description=c.description,
            max_score=c.max_score,
            weight=c.weight,
        )
        for c in criteria
    ]

    # 2. Hackathon Info
    h = submission.hackathon
    org_name = h.organization.name if h and h.organization else "Organizer"
    hackathon_out = SubmissionReviewHackathonOut(
        id=h.id,
        title=h.title,
        slug=h.slug,
        organization_name=org_name,
        mode=h.mode or "online",
        event_start=ensure_utc(h.event_start),
        event_end=ensure_utc(h.event_end),
        judging_end=ensure_utc(h.judging_end),
        total_teams=len(h.teams) if h.teams else 0,
    )

    # 3. Team Info
    t = submission.team
    team_members_out = []
    if t and t.members:
        for m in t.members:
            u = m.user
            team_members_out.append(
                SubmissionReviewTeamMemberOut(
                    user_id=m.user_id,
                    name=u.full_name if u else f"Member #{m.user_id}",
                    role=m.role,
                    avatar_url=None,
                )
            )

    team_out = SubmissionReviewTeamOut(
        id=t.id if t else 0,
        name=t.name if t else "Unknown Team",
        invite_code=t.invite_code if t else f"TEAM-{submission.team_id:03d}",
        track=t.track if t else None,
        members=team_members_out,
    )

    # 4. Existing Evaluation
    existing_eval = (
        db.query(Evaluation)
        .filter(
            Evaluation.judge_id == judge_record.id,
            Evaluation.submission_id == submission.id,
        )
        .first()
    )

    existing_eval_out = None
    if existing_eval:
        criteria_dict = {c.id: c.name for c in criteria}
        score_items = [
            EvaluationScoreItem(
                criterion_id=s.criterion_id,
                criterion_name=criteria_dict.get(s.criterion_id, f"Criterion #{s.criterion_id}"),
                score=s.score,
            )
            for s in existing_eval.scores
        ]
        existing_eval_out = ExistingEvaluationOut(
            id=existing_eval.id,
            status=existing_eval.status,
            total_score=existing_eval.total_score,
            scores=score_items,
            feedback=existing_eval.feedback,
            is_flagged_for_review=existing_eval.is_flagged_for_review,
            flag_reason=existing_eval.flag_reason,
            updated_at=ensure_utc(existing_eval.updated_at or existing_eval.created_at),
        )

    return SubmissionReviewDetailOut(
        submission_id=submission.id,
        submission_code=f"SUB-2025-{submission.id:03d}",
        project_title=submission.project_title,
        tagline=submission.tagline,
        description=submission.description,
        github_url=submission.github_url,
        live_demo_url=submission.live_demo_url,
        video_url=submission.video_url,
        presentation_url=submission.presentation_url,
        attachment_url=submission.attachment_url,
        submitted_at=ensure_utc(submission.submitted_at or submission.created_at),
        version=submission.version,
        hackathon=hackathon_out,
        team=team_out,
        rubric_criteria=criteria_out,
        existing_evaluation=existing_eval_out,
    )


@router.post("/submissions/{submission_id}/evaluate", response_model=EvaluationResultOut)
def evaluate_submission(
    submission_id: int,
    payload: EvaluationSubmitPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits or saves as draft an evaluation for a submission.
    Validates rubric scores, computes normalized total score (0-100),
    performs anomaly detection, and updates judge assignment status.
    """
    verify_judge_access(current_user)

    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found.",
        )

    judge_record = get_judge_record(db, current_user, submission.hackathon_id)

    assignment = (
        db.query(JudgeAssignment)
        .filter(
            JudgeAssignment.judge_id == judge_record.id,
            JudgeAssignment.team_id == submission.team_id,
        )
        .first()
    )

    criteria = ensure_evaluation_criteria(db, submission.hackathon_id)
    criteria_map = {c.id: c for c in criteria}

    # Validate scores
    scores_to_record = []
    total_raw = 0.0
    total_max = 0.0
    all_zero = True

    for score_in in payload.scores:
        crit = criteria_map.get(score_in.criterion_id)
        if not crit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Criterion ID {score_in.criterion_id} does not belong to this hackathon.",
            )
        if score_in.score < 0 or score_in.score > crit.max_score:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Score for '{crit.name}' must be between 0 and {crit.max_score}.",
            )
        if score_in.score > 0:
            all_zero = False
        scores_to_record.append((crit, score_in.score))
        total_raw += score_in.score * crit.weight
        total_max += crit.max_score * crit.weight

    # Total score out of 100
    if total_max > 0:
        computed_total = round((total_raw / total_max) * 100, 1)
    else:
        computed_total = round(total_raw, 1)

    eval_status = "submitted" if payload.status == "submitted" else "draft"

    # Anomaly / Outlier check
    is_flagged = payload.is_flagged_for_review
    flag_reason = payload.flag_reason

    if eval_status == "submitted" and len(scores_to_record) > 0 and all_zero:
        is_flagged = True
        flag_reason = flag_reason or "Automated Flag: All rubric criteria were scored 0."

    # Upsert evaluation
    evaluation = (
        db.query(Evaluation)
        .filter(
            Evaluation.judge_id == judge_record.id,
            Evaluation.submission_id == submission.id,
        )
        .first()
    )

    if not evaluation:
        evaluation = Evaluation(
            judge_id=judge_record.id,
            submission_id=submission.id,
            assignment_id=assignment.id if assignment else None,
            total_score=computed_total,
            feedback=payload.feedback,
            is_flagged_for_review=is_flagged,
            flag_reason=flag_reason,
            status=eval_status,
        )
        db.add(evaluation)
        db.flush()
    else:
        evaluation.total_score = computed_total
        evaluation.feedback = payload.feedback
        evaluation.status = eval_status
        evaluation.is_flagged_for_review = is_flagged
        evaluation.flag_reason = flag_reason
        if assignment and not evaluation.assignment_id:
            evaluation.assignment_id = assignment.id

        # Delete old score records to overwrite
        db.query(EvaluationScore).filter(EvaluationScore.evaluation_id == evaluation.id).delete()
        db.flush()

    # Insert score records
    score_items_out: List[EvaluationScoreItem] = []
    for crit, score_val in scores_to_record:
        eval_score = EvaluationScore(
            evaluation_id=evaluation.id,
            criterion_id=crit.id,
            score=score_val,
        )
        db.add(eval_score)
        score_items_out.append(
            EvaluationScoreItem(
                criterion_id=crit.id,
                criterion_name=crit.name,
                score=score_val,
            )
        )

    # Synchronize assignment status
    if assignment:
        if eval_status == "submitted":
            assignment.status = "completed"
        else:
            assignment.status = "in_progress"

    db.commit()
    db.refresh(evaluation)

    message = (
        "Evaluation submitted successfully."
        if eval_status == "submitted"
        else "Evaluation draft saved successfully."
    )

    return EvaluationResultOut(
        evaluation_id=evaluation.id,
        submission_id=submission.id,
        judge_id=current_user.id,
        total_score=evaluation.total_score,
        status=evaluation.status,
        feedback=evaluation.feedback,
        is_flagged_for_review=evaluation.is_flagged_for_review,
        flag_reason=evaluation.flag_reason,
        scores=score_items_out,
        updated_at=ensure_utc(evaluation.updated_at or evaluation.created_at),
        message=message,
    )


@router.get("/evaluations/{evaluation_id}", response_model=EvaluationResultOut)
def get_evaluation_by_id(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns single evaluation by ID for judge.
    """
    verify_judge_access(current_user)

    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found.",
        )

    if not current_user.is_superuser:
        judge_record = (
            db.query(HackathonJudge)
            .filter(HackathonJudge.id == evaluation.judge_id)
            .first()
        )
        if not judge_record or judge_record.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this evaluation.",
            )

    criteria = (
        db.query(EvaluationCriteria)
        .filter(EvaluationCriteria.hackathon_id == evaluation.submission.hackathon_id)
        .all()
    )
    criteria_map = {c.id: c.name for c in criteria}

    score_items = [
        EvaluationScoreItem(
            criterion_id=s.criterion_id,
            criterion_name=criteria_map.get(s.criterion_id, f"Criterion #{s.criterion_id}"),
            score=s.score,
        )
        for s in evaluation.scores
    ]

    return EvaluationResultOut(
        evaluation_id=evaluation.id,
        submission_id=evaluation.submission_id,
        judge_id=current_user.id,
        total_score=evaluation.total_score,
        status=evaluation.status,
        feedback=evaluation.feedback,
        is_flagged_for_review=evaluation.is_flagged_for_review,
        flag_reason=evaluation.flag_reason,
        scores=score_items,
        updated_at=ensure_utc(evaluation.updated_at or evaluation.created_at),
        message="Evaluation retrieved successfully.",
    )


@router.get("/guidelines", response_model=JudgingGuidelinesOut)
def get_judging_guidelines(
    hackathon_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns complete Judging Guidelines, Evaluation Rubrics, Core Rules,
    Do's & Don'ts, and Milestone Timelines matching Screen #55.
    """
    verify_judge_access(current_user)
    now = datetime.now(timezone.utc)

    # 1. Resolve Hackathon
    hackathon = None
    if hackathon_id is not None:
        hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    
    if not hackathon:
        # Find first assigned hackathon for this judge
        judge_rec = (
            db.query(HackathonJudge)
            .filter(HackathonJudge.user_id == current_user.id, HackathonJudge.status == "active")
            .first()
        )
        if judge_rec:
            hackathon = db.query(Hackathon).filter(Hackathon.id == judge_rec.hackathon_id).first()

    if not hackathon:
        # Fallback to first active hackathon in DB
        hackathon = (
            db.query(Hackathon)
            .filter(Hackathon.status.in_(["judging", "live", "completed"]))
            .order_by(Hackathon.id.desc())
            .first()
        )

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hackathon found for judging guidelines.",
        )

    # 2. Criteria
    criteria = ensure_evaluation_criteria(db, hackathon.id)
    criteria_out = [
        RubricCriterionItem(
            id=c.id,
            name=c.name,
            description=c.description,
            max_score=c.max_score,
            weight=c.weight,
        )
        for c in criteria
    ]

    total_max = sum(c.max_score for c in criteria)

    # 3. Countdown seconds
    countdown_seconds = 0
    j_end = ensure_utc(hackathon.judging_end)
    if j_end and j_end > now:
        countdown_seconds = max(0, int((j_end - now).total_seconds()))

    # 4. Core Evaluation Rules matching Screen #55
    rules = [
        JudgingRuleItem(
            id=1,
            title="Independent & Unbiased Evaluation",
            description="Evaluate each assigned submission independently, objectively, and without personal favoritism or bias.",
        ),
        JudgingRuleItem(
            id=2,
            title="Evidence-Based Scoring",
            description="Base your scoring strictly on the submitted project deliverables, live demo link, and GitHub source code.",
        ),
        JudgingRuleItem(
            id=3,
            title="Finality & Strict Deadlines",
            description="All evaluations must be submitted before the judging round closes. Submissions lock permanently once the deadline expires.",
        ),
        JudgingRuleItem(
            id=4,
            title="Integrity & Flagging Protocol",
            description="If you suspect code plagiarism, pre-built template usage, or policy breaches, flag the project for immediate organizer review.",
        ),
    ]

    # 5. Do's and Don'ts matching Screen #55
    dos_and_donts = JudgingDosDonts(
        dos=[
            "Explore the live web/mobile demo and test key user journeys before grading.",
            "Inspect the GitHub commit history and code quality to evaluate technical complexity.",
            "Provide detailed, constructive feedback to help builders understand their strengths and growth areas.",
            "Use the full spectrum of points (0 to Max) based on genuine achievement.",
        ],
        donts=[
            "Do not discuss team scores or rankings outside the official HackSphere judging console.",
            "Do not share team project ideas, architectures, or proprietary source code publicly.",
            "Do not evaluate any team where you have a personal, academic, or professional relationship.",
            "Do not delay evaluations past the countdown deadline.",
        ],
    )

    # 6. Important Milestone Dates
    important_dates = JudgingMilestoneDates(
        judging_start=ensure_utc(hackathon.judging_start or hackathon.submission_end),
        judging_end=ensure_utc(hackathon.judging_end),
        feedback_release=ensure_utc(hackathon.result_date),
    )

    policy_text = (
        "HackSphere maintains a strict zero-tolerance policy for Conflicts of Interest. "
        "If you are assigned a team featuring friends, colleagues, family members, or "
        "mentees, please declare it below. Organizers will immediately reassign the submission "
        "to ensure a level playing field."
    )

    return JudgingGuidelinesOut(
        hackathon_id=hackathon.id,
        hackathon_title=hackathon.title,
        hackathon_slug=hackathon.slug,
        countdown_seconds=countdown_seconds,
        rubric_criteria=criteria_out,
        total_max_score=total_max,
        rules=rules,
        dos_and_donts=dos_and_donts,
        important_dates=important_dates,
        conflict_of_interest_policy=policy_text,
    )


@router.post("/conflict-of-interest", response_model=ConflictOfInterestOut)
def declare_conflict_of_interest(
    payload: ConflictOfInterestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits a Conflict of Interest declaration for an assigned team or hackathon.
    Transitions assignment status to 'conflict_declared' for organizer re-allocation.
    """
    verify_judge_access(current_user)

    judge_record = (
        db.query(HackathonJudge)
        .filter(
            HackathonJudge.user_id == current_user.id,
            HackathonJudge.hackathon_id == payload.hackathon_id,
        )
        .first()
    )

    if not judge_record and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not appointed as an active judge for this hackathon.",
        )

    judge_id = judge_record.id if judge_record else current_user.id

    # If team_id specified, find assignment and mark as conflict
    if payload.team_id and judge_record:
        assignment = (
            db.query(JudgeAssignment)
            .filter(
                JudgeAssignment.judge_id == judge_record.id,
                JudgeAssignment.team_id == payload.team_id,
            )
            .first()
        )
        if assignment:
            assignment.status = "conflict_declared"
            db.commit()

    return ConflictOfInterestOut(
        id=payload.team_id or 1,
        judge_id=current_user.id,
        hackathon_id=payload.hackathon_id,
        team_id=payload.team_id,
        status="conflict_declared",
        message=(
            "Conflict of interest declared successfully. "
            "The organizing team has been notified and the submission will be reassigned."
        ),
    )


