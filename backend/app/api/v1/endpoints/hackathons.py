import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import get_current_user, get_current_user_optional, get_user_roles
from app.models.hackathon import Hackathon, HackathonRegistration
from app.models.organization import Organization, OrganizationMember
from app.models.judging import HackathonJudge, EvaluationCriteria, Evaluation
from app.models.submission import Submission
from app.models.team import Team, TeamMember
from app.models.user import User
from app.schemas.hackathon import (
    HackathonOut,
    HackathonDetailOut,
    OrganizationBriefOut,
    EvaluationCriterionBriefOut,
    JudgeBriefOut,
    HackathonRegistrationOut,
    RegistrationStatusOut,
    HackathonCreatePayload,
    CriterionCreatePayload,
)
from app.schemas.organizer_management import (
    PhaseTransitionPayload,
    SubmissionModerationPayload,
    ManagedSubmissionItemOut,
    HackathonManagementDetailOut,
)

router = APIRouter()


def calculate_user_level(xp: int) -> int:
    """Calculates gamified level from XP per Chapter 25."""
    if xp >= 5000:
        return 6
    if xp >= 2500:
        return 5
    if xp >= 1300:
        return 4
    if xp >= 700:
        return 3
    if xp >= 300:
        return 2
    return 1


def map_hackathon_out(h: Hackathon) -> HackathonOut:
    """Helper to convert Hackathon model to HackathonOut with participant count."""
    org_brief = None
    if h.organization:
        org_brief = OrganizationBriefOut(
            id=h.organization.id,
            name=h.organization.name,
            slug=h.organization.slug,
            logo_url=h.organization.logo_url,
            is_verified=h.organization.is_verified,
        )

    return HackathonOut(
        id=h.id,
        organization_id=h.organization_id,
        title=h.title,
        slug=h.slug,
        tagline=h.tagline,
        short_description=h.short_description,
        detailed_description=h.detailed_description,
        banner_url=h.banner_url,
        logo_url=h.logo_url,
        theme=h.theme,
        mode=h.mode,
        status=h.status,
        visibility=h.visibility,
        registration_start=h.registration_start,
        registration_end=h.registration_end,
        event_start=h.event_start,
        event_end=h.event_end,
        submission_start=h.submission_start,
        submission_end=h.submission_end,
        result_date=h.result_date,
        min_team_size=h.min_team_size,
        max_team_size=h.max_team_size,
        max_participants=h.max_participants,
        prize_pool_summary=h.prize_pool_summary,
        participant_count=len(h.registrations) if h.registrations else 0,
        organization=org_brief,
        created_at=h.created_at,
    )


def map_hackathon_detail_out(h: Hackathon, current_user: Optional[User] = None) -> HackathonDetailOut:
    """Helper to map detailed hackathon model including rubrics, judges, and user registration."""
    base_out = map_hackathon_out(h)

    criteria_out = [
        EvaluationCriterionBriefOut(
            id=c.id,
            name=c.name,
            description=c.description,
            max_score=c.max_score,
            weight=c.weight,
        )
        for c in (h.evaluation_criteria or [])
    ]

    judges_out = []
    for j in (h.judges or []):
        if j.user:
            judges_out.append(
                JudgeBriefOut(
                    id=j.id,
                    user_id=j.user_id,
                    full_name=j.user.full_name,
                    avatar_url=j.user.avatar_url,
                    expertise=j.expertise,
                )
            )

    is_registered = False
    if current_user and h.registrations:
        is_registered = any(r.user_id == current_user.id for r in h.registrations)

    return HackathonDetailOut(
        **base_out.model_dump(),
        rules=h.rules,
        eligibility=h.eligibility,
        judging_start=h.judging_start,
        judging_end=h.judging_end,
        evaluation_criteria=criteria_out,
        judges=judges_out,
        teams_count=len(h.teams) if h.teams else 0,
        is_user_registered=is_registered,
    )


def generate_slug(text: str) -> str:
    """Helper to convert title into URL-safe slug."""
    s = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", s)


@router.post("", response_model=HackathonDetailOut, summary="Create New Hackathon Tournament")
def create_hackathon(
    payload: HackathonCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonDetailOut:
    """
    Creates a new hackathon tournament per Chapter 14.
    Requires organizer privileges. Automatically associates host organization and scoring rubrics.
    """
    roles = get_user_roles(current_user)
    if not ("organizer" in roles or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer role required to create hackathons.",
        )

    # 1. Resolve host organization
    membership = (
        db.query(OrganizationMember)
        .options(joinedload(OrganizationMember.organization))
        .filter_by(user_id=current_user.id)
        .first()
    )
    if membership and membership.organization:
        org = membership.organization
    else:
        org = db.query(Organization).first()

    if not org:
        raise HTTPException(status_code=400, detail="No host organization available.")

    # 2. Slug generation
    slug = payload.slug
    if not slug or not slug.strip():
        slug = generate_slug(payload.title)

    base_slug = slug
    counter = 1
    while db.query(Hackathon).filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # 3. Create Hackathon entity
    hackathon = Hackathon(
        organization_id=org.id,
        title=payload.title,
        slug=slug,
        tagline=payload.tagline,
        short_description=payload.short_description,
        detailed_description=payload.detailed_description,
        theme=payload.theme,
        mode=payload.mode,
        status=payload.status,
        visibility=payload.visibility,
        min_team_size=payload.min_team_size,
        max_team_size=payload.max_team_size,
        max_participants=payload.max_participants,
        prize_pool_summary=payload.prize_pool_summary,
        rules=payload.rules,
        eligibility=payload.eligibility,
        registration_start=payload.registration_start,
        registration_end=payload.registration_end,
        event_start=payload.event_start,
        event_end=payload.event_end,
        submission_start=payload.submission_start,
        submission_end=payload.submission_end,
        judging_start=payload.judging_start,
        judging_end=payload.judging_end,
        result_date=payload.result_date,
        created_by_user_id=current_user.id,
    )
    db.add(hackathon)
    db.flush()

    # 4. Insert Evaluation Criteria if supplied
    if payload.criteria:
        for c in payload.criteria:
            crit = EvaluationCriteria(
                hackathon_id=hackathon.id,
                name=c.name,
                description=c.description,
                max_score=c.max_score,
                weight=c.weight,
            )
            db.add(crit)

    db.commit()

    # 5. Reload and map detailed response
    refreshed = (
        db.query(Hackathon)
        .options(
            joinedload(Hackathon.organization),
            joinedload(Hackathon.registrations),
            joinedload(Hackathon.teams),
            joinedload(Hackathon.evaluation_criteria),
            joinedload(Hackathon.judges).joinedload(HackathonJudge.user),
        )
        .filter(Hackathon.id == hackathon.id)
        .first()
    )
    return map_hackathon_detail_out(refreshed, current_user)


@router.get("", response_model=List[HackathonOut], summary="Public Explore Hackathons")
def list_hackathons(
    search: Optional[str] = Query(None, description="Search across title, tagline, theme, and host"),
    mode: Optional[str] = Query(None, description="Filter by event mode: online, offline, hybrid"),
    status: Optional[str] = Query(None, description="Filter by status: registration_open, upcoming, completed"),
    theme: Optional[str] = Query(None, description="Filter by category or theme: ai, web3, climate"),
    sort_by: Optional[str] = Query("newest", description="Sort criteria: newest, deadline, prize"),
    db: Session = Depends(get_db),
) -> List[HackathonOut]:
    """
    Public discovery endpoint returning published hackathons matching filter criteria.
    Realizes Chapter 7 & Chapter 38 discovery architecture.
    """
    query = (
        db.query(Hackathon)
        .options(joinedload(Hackathon.organization), joinedload(Hackathon.registrations))
        .filter(Hackathon.visibility != "private")
    )

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.join(Hackathon.organization).filter(
            or_(
                Hackathon.title.ilike(term),
                Hackathon.tagline.ilike(term),
                Hackathon.short_description.ilike(term),
                Hackathon.theme.ilike(term),
                Organization.name.ilike(term),
            )
        )

    # Mode filter (online, offline, hybrid)
    if mode and mode.lower() != "all":
        query = query.filter(Hackathon.mode == mode.lower())

    # Status filter
    if status and status.lower() != "all":
        query = query.filter(Hackathon.status == status.lower())

    # Theme / Category filter
    if theme and theme.lower() != "all":
        query = query.filter(Hackathon.theme.ilike(f"%{theme.lower()}%"))

    # Sorting
    if sort_by == "deadline":
        query = query.order_by(Hackathon.registration_end.asc())
    elif sort_by == "oldest":
        query = query.order_by(Hackathon.created_at.asc())
    else:  # newest / default
        query = query.order_by(Hackathon.created_at.desc())

    hackathons = query.all()
    return [map_hackathon_out(h) for h in hackathons]


@router.get("/{slug_or_id}", response_model=HackathonDetailOut, summary="Get Hackathon Details")
def get_hackathon(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> HackathonDetailOut:
    """
    Retrieves rich public hackathon details by either slug or numeric ID per Chapter 8.
    Eagerly loads organization, evaluation criteria, judges, and registration status.
    """
    query = (
        db.query(Hackathon)
        .options(
            joinedload(Hackathon.organization),
            joinedload(Hackathon.registrations),
            joinedload(Hackathon.evaluation_criteria),
            joinedload(Hackathon.judges).joinedload(HackathonJudge.user),
            joinedload(Hackathon.teams),
        )
    )

    if slug_or_id.isdigit():
        hackathon = query.filter(
            or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)
        ).first()
    else:
        hackathon = query.filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hackathon '{slug_or_id}' not found.",
        )

    return map_hackathon_detail_out(hackathon, current_user)


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensures datetime is timezone-aware in UTC for safe comparison."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@router.post("/{slug_or_id}/register", response_model=HackathonRegistrationOut, summary="Register for Hackathon")
def register_for_hackathon(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonRegistrationOut:
    """
    Participant registration for a hackathon per Chapter 8.
    Validates deadline, participant capacity, checks duplicate registration,
    and awards +50 XP gamification reward.
    """
    query = db.query(Hackathon).options(joinedload(Hackathon.registrations))
    if slug_or_id.isdigit():
        hackathon = query.filter(
            or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)
        ).first()
    else:
        hackathon = query.filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hackathon '{slug_or_id}' not found.",
        )

    # Check duplicate registration
    existing_reg = (
        db.query(HackathonRegistration)
        .filter_by(hackathon_id=hackathon.id, user_id=current_user.id)
        .first()
    )
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this hackathon.",
        )

    # Check status
    if hackathon.status in ["completed", "cancelled", "archived"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is closed for this hackathon.",
        )

    # Check deadline
    now = datetime.now(timezone.utc)
    reg_end = ensure_utc(hackathon.registration_end)
    if reg_end and now > reg_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed.",
        )

    # Check max participants
    if hackathon.max_participants and len(hackathon.registrations) >= hackathon.max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hackathon registration capacity has been reached.",
        )

    # Create registration
    reg = HackathonRegistration(
        hackathon_id=hackathon.id,
        user_id=current_user.id,
        status="registered",
        registered_at=now,
    )
    db.add(reg)

    # Gamification reward: +50 XP for joining a hackathon per Chapter 25
    current_user.xp += 50
    current_user.level = calculate_user_level(current_user.xp)
    db.add(current_user)

    db.commit()
    db.refresh(reg)

    return HackathonRegistrationOut(
        id=reg.id,
        hackathon_id=reg.hackathon_id,
        user_id=reg.user_id,
        status=reg.status,
        registered_at=reg.registered_at,
        xp_awarded=50,
        message="Successfully registered! You earned +50 XP.",
    )


@router.get("/{slug_or_id}/registration-status", response_model=RegistrationStatusOut, summary="Check Registration Status")
def check_registration_status(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RegistrationStatusOut:
    """
    Checks if the current authenticated user is registered for the specified hackathon.
    """
    if slug_or_id.isdigit():
        hackathon = db.query(Hackathon).filter(
            or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)
        ).first()
    else:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hackathon '{slug_or_id}' not found.",
        )

    reg = (
        db.query(HackathonRegistration)
        .filter_by(hackathon_id=hackathon.id, user_id=current_user.id)
        .first()
    )

    if reg:
        return RegistrationStatusOut(is_registered=True, registration_id=reg.id)
    return RegistrationStatusOut(is_registered=False, registration_id=None)


def map_managed_submission_out(s: Submission) -> ManagedSubmissionItemOut:
    team_name = s.team.name if s.team else "Independent Hacker"
    members_count = len(s.team.members) if (s.team and s.team.members) else 1
    evals = s.evaluations or []
    evals_count = len(evals)
    avg_score = round(sum(e.total_score for e in evals) / evals_count, 2) if evals_count > 0 else None

    return ManagedSubmissionItemOut(
        id=s.id,
        team_id=s.team_id,
        team_name=team_name,
        team_members_count=members_count,
        project_title=s.project_title,
        tagline=s.tagline,
        description=s.description,
        github_url=s.github_url,
        live_demo_url=s.live_demo_url,
        video_url=s.video_url,
        presentation_url=s.presentation_url,
        attachment_url=s.attachment_url,
        version=s.version,
        is_locked=s.is_locked,
        status=s.status,
        submitted_at=s.submitted_at,
        evaluations_count=evals_count,
        average_score=avg_score,
    )


def map_hackathon_management_detail_out(h: Hackathon, submissions: List[Submission]) -> HackathonManagementDetailOut:
    managed_submissions = [map_managed_submission_out(s) for s in submissions]
    total_sub = len(managed_submissions)
    locked_count = sum(1 for s in managed_submissions if s.is_locked)
    flagged_count = sum(1 for s in managed_submissions if s.status == "flagged")
    total_evals = sum(s.evaluations_count for s in managed_submissions)
    avg_evals = round(total_evals / total_sub, 2) if total_sub > 0 else 0.0

    return HackathonManagementDetailOut(
        id=h.id,
        slug=h.slug,
        title=h.title,
        tagline=h.tagline,
        status=h.status,
        mode=h.mode,
        theme=h.theme,
        min_team_size=h.min_team_size,
        max_team_size=h.max_team_size,
        prize_pool_summary=h.prize_pool_summary,
        registration_start=h.registration_start,
        registration_end=h.registration_end,
        event_start=h.event_start,
        event_end=h.event_end,
        submission_start=h.submission_start,
        submission_end=h.submission_end,
        judging_start=h.judging_start,
        judging_end=h.judging_end,
        result_date=h.result_date,
        total_registered=len(h.registrations or []),
        total_teams=len(h.teams or []),
        total_submissions=total_sub,
        locked_submissions_count=locked_count,
        flagged_submissions_count=flagged_count,
        average_evaluations_per_submission=avg_evals,
        submissions=managed_submissions,
    )


@router.get("/{slug_or_id}/manage", response_model=HackathonManagementDetailOut, summary="Get Hackathon Management Console Detail")
def get_hackathon_management_detail(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonManagementDetailOut:
    """
    Returns complete tournament operations details for organizers per Chapters 15 & 16.
    Includes lifecycle state, submissions inspection list, lock status, and judging metrics.
    """
    roles = get_user_roles(current_user)
    if not ("organizer" in roles or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer role required to manage hackathons.",
        )

    query = (
        db.query(Hackathon)
        .options(
            joinedload(Hackathon.organization),
            joinedload(Hackathon.registrations),
            joinedload(Hackathon.teams),
        )
    )
    if slug_or_id.isdigit():
        hackathon = query.filter(or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)).first()
    else:
        hackathon = query.filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hackathon '{slug_or_id}' not found.")

    submissions = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.evaluations),
        )
        .filter(Submission.hackathon_id == hackathon.id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )

    return map_hackathon_management_detail_out(hackathon, submissions)


@router.post("/{slug_or_id}/phase", response_model=HackathonManagementDetailOut, summary="Transition Hackathon Phase Lifecycle")
def transition_hackathon_phase(
    slug_or_id: str,
    payload: PhaseTransitionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonManagementDetailOut:
    """
    Transitions tournament lifecycle state machine per Chapter 16.
    Allowed phases: draft, published, registration, hacking, submission_closed, judging, completed.
    Automatically bulk-locks all submissions when transitioning to submission_closed, judging, or completed.
    """
    roles = get_user_roles(current_user)
    if not ("organizer" in roles or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer role required to manage hackathons.",
        )

    allowed_phases = {"draft", "published", "registration", "hacking", "submission_closed", "judging", "completed"}
    target_phase = payload.phase.lower().strip()
    if target_phase not in allowed_phases:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid phase '{target_phase}'. Allowed phases are: {', '.join(sorted(allowed_phases))}",
        )

    if slug_or_id.isdigit():
        hackathon = db.query(Hackathon).filter(or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)).first()
    else:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hackathon '{slug_or_id}' not found.")

    hackathon.status = target_phase

    # Bulk lock all deliverables if entering code freeze / judging / completed
    if target_phase in ("submission_closed", "judging", "completed"):
        db.query(Submission).filter(Submission.hackathon_id == hackathon.id).update({"is_locked": True})

    db.commit()

    # Reload refreshed detail
    submissions = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.evaluations),
        )
        .filter(Submission.hackathon_id == hackathon.id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )
    return map_hackathon_management_detail_out(hackathon, submissions)


@router.patch("/{slug_or_id}/submissions/{submission_id}/status", response_model=ManagedSubmissionItemOut, summary="Moderate Submission Status")
def moderate_submission_status(
    slug_or_id: str,
    submission_id: int,
    payload: SubmissionModerationPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ManagedSubmissionItemOut:
    """
    Moderates a submission status (submitted, flagged, disqualified) with audit notes per Chapter 16.
    """
    roles = get_user_roles(current_user)
    if not ("organizer" in roles or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer role required to moderate submissions.",
        )

    allowed_statuses = {"submitted", "flagged", "disqualified"}
    target_status = payload.status.lower().strip()
    if target_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{target_status}'. Allowed statuses are: {', '.join(sorted(allowed_statuses))}",
        )

    if slug_or_id.isdigit():
        hackathon = db.query(Hackathon).filter(or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)).first()
    else:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == slug_or_id).first()

    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hackathon '{slug_or_id}' not found.")

    submission = (
        db.query(Submission)
        .options(
            joinedload(Submission.team).joinedload(Team.members),
            joinedload(Submission.evaluations),
        )
        .filter(Submission.id == submission_id, Submission.hackathon_id == hackathon.id)
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {submission_id} not found in this hackathon.",
        )

    submission.status = target_status
    db.commit()
    db.refresh(submission)

    return map_managed_submission_out(submission)

