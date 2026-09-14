from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.models.hackathon import Hackathon
from app.models.organization import Organization
from app.schemas.hackathon import HackathonOut, OrganizationBriefOut

router = APIRouter()


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


@router.get("/{slug_or_id}", response_model=HackathonOut, summary="Get Hackathon Details")
def get_hackathon(
    slug_or_id: str,
    db: Session = Depends(get_db),
) -> HackathonOut:
    """
    Retrieves public hackathon details by either slug or numeric ID.
    """
    query = (
        db.query(Hackathon)
        .options(joinedload(Hackathon.organization), joinedload(Hackathon.registrations))
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

    return map_hackathon_out(hackathon)
