from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.models.organization import Organization, OrganizationMember
from app.models.hackathon import Hackathon
from app.schemas.organization import (
    OrganizationProfileOut,
    OrganizationListItemOut,
    OrganizationMemberBriefOut,
)
from app.api.v1.endpoints.hackathons import map_hackathon_out

router = APIRouter()


@router.get("", response_model=List[OrganizationListItemOut], summary="List Public Organizations")
def list_organizations(
    search: Optional[str] = Query(None, description="Search by organization name or city"),
    org_type: Optional[str] = Query(None, description="Filter by type: company, college, community"),
    db: Session = Depends(get_db),
) -> List[OrganizationListItemOut]:
    """
    Public directory of verified hosting organizations per Chapter 15 & 36.
    """
    query = db.query(Organization).options(joinedload(Organization.hackathons))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Organization.name.ilike(term),
                Organization.city.ilike(term),
                Organization.description.ilike(term),
            )
        )

    if org_type and org_type.lower() != "all":
        query = query.filter(Organization.org_type == org_type.lower())

    orgs = query.all()

    return [
        OrganizationListItemOut(
            id=org.id,
            name=org.name,
            slug=org.slug,
            org_type=org.org_type,
            logo_url=org.logo_url,
            cover_url=org.cover_url,
            description=org.description,
            country=org.country,
            city=org.city,
            is_verified=org.is_verified,
            hackathons_count=len(org.hackathons) if org.hackathons else 0,
            created_at=org.created_at,
        )
        for org in orgs
    ]


@router.get("/{slug_or_id}", response_model=OrganizationProfileOut, summary="Get Organization Profile")
def get_organization(
    slug_or_id: str,
    db: Session = Depends(get_db),
) -> OrganizationProfileOut:
    """
    Retrieves public organization workspace profile per Chapter 15 & 36,
    including aggregated metrics, hosted hackathons, and leadership roster.
    """
    query = (
        db.query(Organization)
        .options(
            joinedload(Organization.members).joinedload(OrganizationMember.user),
            joinedload(Organization.hackathons).joinedload(Hackathon.registrations),
            joinedload(Organization.hackathons).joinedload(Hackathon.organization),
        )
    )

    if slug_or_id.isdigit():
        org = query.filter(
            or_(Organization.id == int(slug_or_id), Organization.slug == slug_or_id)
        ).first()
    else:
        org = query.filter(Organization.slug == slug_or_id).first()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization '{slug_or_id}' not found.",
        )

    # Calculate metrics
    hackathons = org.hackathons or []
    hackathons_count = len(hackathons)
    total_participants = sum(
        len(h.registrations) if h.registrations else 0 for h in hackathons
    )

    # Split into active and past hackathons
    active_hackathons = []
    past_hackathons = []
    for h in hackathons:
        if h.visibility == "private":
            continue
        mapped = map_hackathon_out(h)
        if h.status in ["completed", "archived"]:
            past_hackathons.append(mapped)
        else:
            active_hackathons.append(mapped)

    # Map members (Chapter 15: Owner, Admin, Staff)
    members_out = []
    for m in (org.members or []):
        if m.user:
            members_out.append(
                OrganizationMemberBriefOut(
                    id=m.id,
                    user_id=m.user_id,
                    full_name=m.user.full_name,
                    email=m.user.email,
                    avatar_url=m.user.avatar_url,
                    role=m.role,
                    joined_at=m.joined_at,
                )
            )

    return OrganizationProfileOut(
        id=org.id,
        name=org.name,
        slug=org.slug,
        org_type=org.org_type,
        logo_url=org.logo_url,
        cover_url=org.cover_url,
        official_email=org.official_email,
        phone=org.phone,
        website_url=org.website_url,
        description=org.description,
        country=org.country,
        state=org.state,
        city=org.city,
        is_verified=org.is_verified,
        hackathons_count=hackathons_count,
        total_participants_reached=total_participants,
        active_hackathons=active_hackathons,
        past_hackathons=past_hackathons,
        members=members_out,
        created_at=org.created_at,
    )
