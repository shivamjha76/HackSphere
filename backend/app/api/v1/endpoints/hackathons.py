from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import get_current_user, get_current_user_optional
from app.models.hackathon import Hackathon, HackathonRegistration
from app.models.organization import Organization
from app.models.judging import HackathonJudge, EvaluationCriteria
from app.models.user import User
from app.schemas.hackathon import (
    HackathonOut,
    HackathonDetailOut,
    OrganizationBriefOut,
    EvaluationCriterionBriefOut,
    JudgeBriefOut,
    HackathonRegistrationOut,
    RegistrationStatusOut,
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
