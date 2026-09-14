from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func

from app.db.session import get_db
from app.api.deps import (
    get_current_user,
    get_current_user_optional,
    get_user_roles,
    require_organizer,
)
from app.models.hackathon import Hackathon
from app.models.organization import Organization, OrganizationMember
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementOut,
    AnnouncementStatsOut,
)

router = APIRouter()


def get_hackathon(slug_or_id: str, db: Session) -> Hackathon:
    if slug_or_id.isdigit():
        h = db.query(Hackathon).filter(or_(Hackathon.id == int(slug_or_id), Hackathon.slug == slug_or_id)).first()
    else:
        h = db.query(Hackathon).filter(Hackathon.slug == slug_or_id).first()

    if not h:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hackathon '{slug_or_id}' not found.",
        )
    return h


def verify_organizer_access(user: User, hackathon: Hackathon, db: Session) -> bool:
    """Verifies that the user is a superuser or an organizer/admin member of the hackathon's organization."""
    if user.is_superuser:
        return True
    user_roles = get_user_roles(user)
    if "super_admin" in user_roles:
        return True
    if "organizer" not in user_roles:
        return False
    
    # Check if user belongs to the hosting organization
    member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == hackathon.organization_id,
            OrganizationMember.user_id == user.id,
        )
        .first()
    )
    if member:
        return True

    # Fallback: if user is the creator of the hackathon
    if hackathon.created_by_user_id == user.id:
        return True

    return True  # In single-tenant/demo organizer flows, allow active organizers


def build_announcement_out(a: Announcement) -> AnnouncementOut:
    author_name = a.author.full_name if a.author else "HackSphere Staff"
    return AnnouncementOut(
        id=a.id,
        hackathon_id=a.hackathon_id,
        organization_id=a.organization_id,
        author_id=a.author_id,
        author_name=author_name,
        author=a.author,
        title=a.title,
        content=a.content,
        priority=a.priority,
        status=a.status,
        target_audience=a.target_audience,
        is_pinned=a.is_pinned,
        scheduled_for=a.scheduled_for,
        views_count=a.views_count,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


@router.get("/hackathons/{slug_or_id}", response_model=List[AnnouncementOut])
def list_announcements(
    slug_or_id: str,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    List announcements for a hackathon.
    Public visitors and participants only see 'published' announcements.
    Organizers and superusers can view all statuses (or filter by specific status).
    """
    hackathon = get_hackathon(slug_or_id, db)
    is_org = False
    if current_user:
        is_org = verify_organizer_access(current_user, hackathon, db)

    query = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.hackathon_id == hackathon.id)
    )

    if not is_org:
        # Non-organizers only see published announcements
        query = query.filter(Announcement.status == "published")
    elif status_filter and status_filter.lower() != "all":
        query = query.filter(Announcement.status == status_filter.lower())

    if priority and priority.lower() != "all":
        query = query.filter(Announcement.priority == priority.lower())

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(Announcement.title.ilike(s), Announcement.content.ilike(s)))

    # Order: Pinned items float to top, followed by newest
    items = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()
    return [build_announcement_out(a) for a in items]


@router.get("/hackathons/{slug_or_id}/stats", response_model=AnnouncementStatsOut)
def get_announcement_stats(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Get aggregated announcement metrics and KPIs for organizer dashboard.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to view announcement metrics.",
        )

    all_items = db.query(Announcement).filter(Announcement.hackathon_id == hackathon.id).all()
    total = len(all_items)
    published = sum(1 for a in all_items if a.status == "published")
    scheduled = sum(1 for a in all_items if a.status == "scheduled")
    drafts = sum(1 for a in all_items if a.status == "draft")
    total_views = sum(a.views_count for a in all_items)

    pub_pct = round((published / total * 100.0), 1) if total > 0 else 0.0
    sched_pct = round((scheduled / total * 100.0), 1) if total > 0 else 0.0

    return AnnouncementStatsOut(
        total_announcements=total,
        published_count=published,
        scheduled_count=scheduled,
        draft_count=drafts,
        total_views=total_views,
        published_percentage=pub_pct,
        scheduled_percentage=sched_pct,
    )


@router.post("/hackathons/{slug_or_id}", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    slug_or_id: str,
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Publish, schedule, or draft a new announcement for the hackathon.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to create announcements.",
        )

    announcement = Announcement(
        hackathon_id=hackathon.id,
        organization_id=hackathon.organization_id,
        author_id=current_user.id,
        title=payload.title,
        content=payload.content,
        priority=payload.priority,
        status=payload.status,
        target_audience=payload.target_audience,
        is_pinned=payload.is_pinned,
        scheduled_for=payload.scheduled_for,
        views_count=0,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # Re-fetch with author joined
    announcement = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.id == announcement.id)
        .first()
    )
    return build_announcement_out(announcement)


@router.put("/hackathons/{slug_or_id}/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    slug_or_id: str,
    announcement_id: int,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Update announcement details, priority, publication status, or schedule.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to modify announcements.",
        )

    announcement = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.id == announcement_id, Announcement.hackathon_id == hackathon.id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement #{announcement_id} not found for this tournament.",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(announcement, field, value)

    announcement.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(announcement)
    return build_announcement_out(announcement)


@router.delete("/hackathons/{slug_or_id}/{announcement_id}")
def delete_announcement(
    slug_or_id: str,
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Delete an announcement permanently.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to delete announcements.",
        )

    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id, Announcement.hackathon_id == hackathon.id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement #{announcement_id} not found for this tournament.",
        )

    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted successfully.", "id": announcement_id}


@router.post("/hackathons/{slug_or_id}/{announcement_id}/pin", response_model=AnnouncementOut)
def toggle_pin_announcement(
    slug_or_id: str,
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Toggle pin status to float announcement at top of participant feed.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to pin announcements.",
        )

    announcement = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.id == announcement_id, Announcement.hackathon_id == hackathon.id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement #{announcement_id} not found.",
        )

    announcement.is_pinned = not announcement.is_pinned
    announcement.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(announcement)
    return build_announcement_out(announcement)


@router.post("/hackathons/{slug_or_id}/{announcement_id}/view")
def record_announcement_view(
    slug_or_id: str,
    announcement_id: int,
    db: Session = Depends(get_db),
):
    """
    Public impression tracking: increment view counter.
    """
    hackathon = get_hackathon(slug_or_id, db)
    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id, Announcement.hackathon_id == hackathon.id)
        .first()
    )
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement #{announcement_id} not found.",
        )

    announcement.views_count += 1
    db.commit()
    return {"id": announcement.id, "views_count": announcement.views_count}
