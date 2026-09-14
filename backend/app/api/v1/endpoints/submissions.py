from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.team import Team, TeamMember
from app.models.submission import Submission
from app.schemas.submission import (
    SubmissionCreatePayload,
    SubmissionUpdatePayload,
    SubmissionDetailOut,
    SubmissionSummaryOut,
)
from app.api.v1.endpoints.hackathons import ensure_utc, calculate_user_level

router = APIRouter()


def format_submission_code(submission: Submission) -> str:
    """Generates standard submission identifier like 'SUB-2026-0001'."""
    year = 2026
    if submission.hackathon and submission.hackathon.created_at:
        year = submission.hackathon.created_at.year
    return f"SUB-{year}-{submission.id:04d}"


def map_submission_detail_out(submission: Submission, current_user: User) -> SubmissionDetailOut:
    """Maps Submission ORM entity to rich output schema."""
    now = datetime.now(timezone.utc)
    sub_end = ensure_utc(submission.hackathon.submission_end) if submission.hackathon else None

    # Determine if user has edit rights
    is_team_member = any(m.user_id == current_user.id for m in (submission.team.members or [])) if submission.team else False
    is_past_deadline = bool(sub_end and now > sub_end)
    can_edit = is_team_member and not submission.is_locked and not is_past_deadline

    return SubmissionDetailOut(
        id=submission.id,
        submission_code=format_submission_code(submission),
        team_id=submission.team_id,
        team_name=submission.team.name if submission.team else "Squad",
        hackathon_id=submission.hackathon_id,
        hackathon_title=submission.hackathon.title if submission.hackathon else "Hackathon",
        hackathon_slug=submission.hackathon.slug if submission.hackathon else "hackathon",
        project_title=submission.project_title,
        tagline=submission.tagline,
        description=submission.description,
        github_url=submission.github_url,
        live_demo_url=submission.live_demo_url,
        video_url=submission.video_url,
        presentation_url=submission.presentation_url,
        attachment_url=submission.attachment_url,
        version=submission.version,
        is_final=submission.is_final,
        is_locked=submission.is_locked,
        status=submission.status,
        submitted_at=submission.submitted_at,
        can_edit=can_edit,
    )


@router.post("", response_model=SubmissionDetailOut, summary="Create or Save Project Deliverables")
def submit_project(
    payload: SubmissionCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionDetailOut:
    """
    Submits project deliverables or saves draft per Chapter 12.
    Validates submission window, updates versioning, and awards +100 XP upon final submission.
    """
    team = (
        db.query(Team)
        .options(
            joinedload(Team.hackathon),
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
        )
        .filter(Team.id == payload.team_id)
        .first()
    )
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found.")

    # Check caller is member of team
    if not any(m.user_id == current_user.id for m in team.members):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to submit deliverables for this squad.",
        )

    # Check submission window (Chapter 12)
    now = datetime.now(timezone.utc)
    hackathon = team.hackathon
    if not hackathon:
        raise HTTPException(status_code=400, detail="Team is not linked to a valid hackathon.")

    sub_start = ensure_utc(hackathon.submission_start)
    sub_end = ensure_utc(hackathon.submission_end)

    if sub_start and now < sub_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission window has not opened yet.",
        )
    if sub_end and now > sub_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission window is closed for this hackathon.",
        )

    # Check if team already has an active submission
    existing = db.query(Submission).filter_by(team_id=team.id).first()

    if existing:
        if existing.is_locked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deliverables are already locked for judging and cannot be modified.",
            )

        # Update existing submission
        existing.project_title = payload.project_title
        existing.tagline = payload.tagline
        existing.description = payload.description
        existing.github_url = payload.github_url
        existing.live_demo_url = payload.live_demo_url
        existing.video_url = payload.video_url
        existing.presentation_url = payload.presentation_url
        existing.attachment_url = payload.attachment_url
        existing.version += 1
        existing.submitted_at = now

        was_already_final = existing.is_final
        existing.is_final = payload.is_final
        existing.status = "submitted" if payload.is_final else "draft"
        submission = existing

        # Grant XP if moving from draft to final for the first time
        if payload.is_final and not was_already_final:
            for m in team.members:
                if m.user:
                    m.user.xp += 100
                    m.user.level = calculate_user_level(m.user.xp)
                    db.add(m.user)
    else:
        # Create new submission record
        submission = Submission(
            team_id=team.id,
            hackathon_id=team.hackathon_id,
            project_title=payload.project_title,
            tagline=payload.tagline,
            description=payload.description,
            github_url=payload.github_url,
            live_demo_url=payload.live_demo_url,
            video_url=payload.video_url,
            presentation_url=payload.presentation_url,
            attachment_url=payload.attachment_url,
            version=1,
            is_final=payload.is_final,
            is_locked=False,
            status="submitted" if payload.is_final else "draft",
            submitted_at=now,
        )
        db.add(submission)

        # Grant +100 XP to squad members if final per Chapter 25
        if payload.is_final:
            for m in team.members:
                if m.user:
                    m.user.xp += 100
                    m.user.level = calculate_user_level(m.user.xp)
                    db.add(m.user)

    db.commit()

    # Reload with relationships
    refreshed = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.id == submission.id)
        .first()
    )

    return map_submission_detail_out(refreshed, current_user)


@router.get("/my", response_model=List[SubmissionSummaryOut], summary="List My Squad Submissions")
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[SubmissionSummaryOut]:
    """
    Returns all submissions associated with any squad the current user belongs to.
    """
    memberships = db.query(TeamMember).filter_by(user_id=current_user.id).all()
    team_ids = [m.team_id for m in memberships]
    if not team_ids:
        return []

    subs = (
        db.query(Submission)
        .options(
            joinedload(Submission.team),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.team_id.in_(team_ids))
        .all()
    )

    summaries = []
    for s in subs:
        summaries.append(
            SubmissionSummaryOut(
                id=s.id,
                submission_code=format_submission_code(s),
                team_id=s.team_id,
                team_name=s.team.name if s.team else "Squad",
                hackathon_id=s.hackathon_id,
                hackathon_title=s.hackathon.title if s.hackathon else "Hackathon",
                hackathon_slug=s.hackathon.slug if s.hackathon else "hackathon",
                project_title=s.project_title,
                tagline=s.tagline,
                status=s.status,
                version=s.version,
                is_locked=s.is_locked,
                submitted_at=s.submitted_at,
            )
        )
    return summaries


@router.get("/{submission_id}", response_model=SubmissionDetailOut, summary="Get Submission Detail")
def get_submission_detail(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionDetailOut:
    """
    Retrieves full submission deliverables with access permission check.
    """
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    return map_submission_detail_out(sub, current_user)


@router.get("/team/{team_id}", response_model=Optional[SubmissionDetailOut], summary="Get Submission by Team ID")
def get_submission_by_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Optional[SubmissionDetailOut]:
    """
    Retrieves current submission for a specific squad. Returns null if not yet submitted.
    """
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.team_id == team_id)
        .first()
    )
    if not sub:
        return None

    return map_submission_detail_out(sub, current_user)


@router.put("/{submission_id}", response_model=SubmissionDetailOut, summary="Update Submission Deliverables")
def update_submission(
    submission_id: int,
    payload: SubmissionUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionDetailOut:
    """
    Updates existing project deliverables and bumps version counter.
    """
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    # Check caller is member of team
    if not any(m.user_id == current_user.id for m in sub.team.members):
        raise HTTPException(status_code=403, detail="Not authorized to edit this submission.")

    if sub.is_locked:
        raise HTTPException(status_code=400, detail="Deliverables are locked for judging.")

    now = datetime.now(timezone.utc)
    sub_end = ensure_utc(sub.hackathon.submission_end) if sub.hackathon else None
    if sub_end and now > sub_end:
        raise HTTPException(status_code=400, detail="Submission window has ended.")

    if payload.project_title is not None:
        sub.project_title = payload.project_title
    if payload.tagline is not None:
        sub.tagline = payload.tagline
    if payload.description is not None:
        sub.description = payload.description
    if payload.github_url is not None:
        sub.github_url = payload.github_url
    if payload.live_demo_url is not None:
        sub.live_demo_url = payload.live_demo_url
    if payload.video_url is not None:
        sub.video_url = payload.video_url
    if payload.presentation_url is not None:
        sub.presentation_url = payload.presentation_url
    if payload.attachment_url is not None:
        sub.attachment_url = payload.attachment_url

    was_already_final = sub.is_final
    if payload.is_final is not None:
        sub.is_final = payload.is_final
        sub.status = "submitted" if payload.is_final else "draft"

        # Award XP if moving from draft to final
        if payload.is_final and not was_already_final:
            for m in sub.team.members:
                if m.user:
                    m.user.xp += 100
                    m.user.level = calculate_user_level(m.user.xp)
                    db.add(m.user)

    sub.version += 1
    sub.submitted_at = now
    db.commit()

    return map_submission_detail_out(sub, current_user)


@router.post("/{submission_id}/lock", response_model=SubmissionDetailOut, summary="Lock Deliverables for Judging")
def lock_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionDetailOut:
    """
    Locks the submission deliverables permanently for evaluation.
    Only team members can trigger lock before judging begins.
    """
    sub = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Submission.hackathon),
        )
        .filter(Submission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if not any(m.user_id == current_user.id for m in sub.team.members):
        raise HTTPException(status_code=403, detail="Only squad members can lock deliverables.")

    if sub.is_locked:
        return map_submission_detail_out(sub, current_user)

    was_already_final = sub.is_final
    sub.is_locked = True
    sub.is_final = True
    sub.status = "submitted"

    # Ensure XP awarded
    if not was_already_final:
        for m in sub.team.members:
            if m.user:
                m.user.xp += 100
                m.user.level = calculate_user_level(m.user.xp)
                db.add(m.user)

    db.commit()
    return map_submission_detail_out(sub, current_user)
