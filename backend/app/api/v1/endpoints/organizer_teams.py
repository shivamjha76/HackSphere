from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import require_organizer
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.organization import Organization, OrganizationMember, ActivityLog
from app.models.team import Team, TeamMember
from app.models.submission import Submission
from app.schemas.organizer_teams import (
    OrganizerTeamMemberItem,
    OrganizerTeamItemOut,
    ManagedHackathonRef,
    OrganizerTeamsOverviewOut,
    UpdateTeamStatusIn,
    BulkUpdateTeamStatusIn,
)

router = APIRouter()


def map_organizer_team(team: Team) -> OrganizerTeamItemOut:
    """Helper to convert a Team model with submissions and members to OrganizerTeamItemOut."""
    members_out: List[OrganizerTeamMemberItem] = []
    for m in (team.members or []):
        user_name = m.user.full_name if m.user else "Unknown Member"
        user_email = m.user.email if m.user else ""
        user_avatar = m.user.avatar_url if m.user else None

        members_out.append(
            OrganizerTeamMemberItem(
                id=m.id,
                user_id=m.user_id,
                full_name=user_name,
                email=user_email,
                avatar_url=user_avatar,
                role=m.role or "member",
            )
        )
    # Put leader first
    members_out.sort(key=lambda x: 0 if x.role == "leader" else 1)

    latest_sub: Optional[Submission] = None
    if team.submissions and len(team.submissions) > 0:
        latest_sub = sorted(team.submissions, key=lambda s: s.version, reverse=True)[0]

    project_title = latest_sub.project_title if latest_sub else f"{team.name} Project"
    project_tagline = (
        latest_sub.tagline
        if latest_sub and latest_sub.tagline
        else f"Building innovative solutions for {team.track or 'Hackathon'}"
    )
    project_description = latest_sub.description if latest_sub else None
    submission_id = latest_sub.id if latest_sub else None
    has_submission = bool(latest_sub is not None)
    github_url = latest_sub.github_url if latest_sub else None
    live_demo_url = latest_sub.live_demo_url if latest_sub else None

    reg_date = team.created_at if team.created_at else datetime.now(timezone.utc)

    return OrganizerTeamItemOut(
        id=team.id,
        hackathon_id=team.hackathon_id,
        hackathon_title=team.hackathon.title if team.hackathon else "Hackathon",
        name=team.name,
        invite_code=team.invite_code,
        track=team.track,
        status=team.status or "registered",
        is_frozen=team.is_frozen,
        project_title=project_title,
        project_tagline=project_tagline,
        project_description=project_description,
        submission_id=submission_id,
        has_submission=has_submission,
        github_url=github_url,
        live_demo_url=live_demo_url,
        members_count=len(members_out),
        members=members_out,
        registered_at=reg_date,
    )


@router.get("", response_model=OrganizerTeamsOverviewOut, summary="List Organizer Teams Directory")
def list_organizer_teams(
    hackathon_id: Optional[int] = Query(None, description="Filter by hackathon ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Status filter: registered, shortlisted, disqualified"),
    search: Optional[str] = Query(None, description="Search query by team name or track"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> OrganizerTeamsOverviewOut:
    """
    Organizer Teams Management, Shortlisting & Cohort Directory Console per UI Screen #56.
    Returns total teams, status distributions, managed hackathons, and filtered teams cohort.
    """
    # 1. Resolve Organization for current organizer
    membership = (
        db.query(OrganizationMember)
        .filter_by(user_id=current_user.id)
        .first()
    )
    if membership:
        org = db.query(Organization).filter(Organization.id == membership.organization_id).first()
    else:
        org = db.query(Organization).first()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization associated with this organizer account.",
        )

    # 2. Resolve Managed Hackathons
    managed_hackathons_db = (
        db.query(Hackathon)
        .filter(Hackathon.organization_id == org.id)
        .order_by(Hackathon.id.desc())
        .all()
    )
    if not managed_hackathons_db:
        managed_hackathons_db = db.query(Hackathon).order_by(Hackathon.id.desc()).limit(10).all()

    if not managed_hackathons_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hackathons available to manage teams.",
        )

    managed_refs: List[ManagedHackathonRef] = []
    for h in managed_hackathons_db:
        count = db.query(Team).filter(Team.hackathon_id == h.id).count()
        managed_refs.append(
            ManagedHackathonRef(
                id=h.id,
                title=h.title,
                slug=h.slug,
                status=h.status,
                teams_count=count,
            )
        )

    # Select target hackathon
    target_hackathon: Optional[Hackathon] = None
    if hackathon_id:
        target_hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
        if not target_hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hackathon with ID {hackathon_id} not found.",
            )
    else:
        # Pick the hackathon with active teams cohort, or fallback to first
        active_hack = None
        best_count = -1
        for h in managed_hackathons_db:
            c = db.query(Team).filter(Team.hackathon_id == h.id).count()
            if c > best_count:
                best_count = c
                active_hack = h
        target_hackathon = active_hack or managed_hackathons_db[0]

    # 3. Query all teams for this hackathon to compute overview statistics
    all_hackathon_teams = (
        db.query(Team)
        .options(
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
            joinedload(Team.hackathon),
        )
        .filter(Team.hackathon_id == target_hackathon.id)
        .order_by(Team.id.desc())
        .all()
    )

    total_teams = len(all_hackathon_teams)
    shortlisted_count = sum(1 for t in all_hackathon_teams if (t.status or "").lower() == "shortlisted")
    disqualified_count = sum(1 for t in all_hackathon_teams if (t.status or "").lower() == "disqualified")
    registered_count = sum(1 for t in all_hackathon_teams if (t.status or "").lower() == "registered")

    # 4. Filter teams based on status_filter and search
    filtered_teams = all_hackathon_teams
    if status_filter and status_filter.lower() != "all":
        norm_filter = status_filter.strip().lower()
        filtered_teams = [t for t in filtered_teams if (t.status or "").lower() == norm_filter]

    if search and search.strip():
        q = search.strip().lower()
        filtered_teams = [
            t for t in filtered_teams
            if q in (t.name or "").lower()
            or q in (t.track or "").lower()
            or any(q in (s.project_title or "").lower() or q in (s.tagline or "").lower() for s in (t.submissions or []))
        ]

    teams_out = [map_organizer_team(t) for t in filtered_teams]

    return OrganizerTeamsOverviewOut(
        hackathon_id=target_hackathon.id,
        hackathon_title=target_hackathon.title,
        managed_hackathons=managed_refs,
        total_teams=total_teams,
        registered_count=registered_count,
        shortlisted_count=shortlisted_count,
        disqualified_count=disqualified_count,
        teams=teams_out,
    )


@router.patch("/{team_id}/status", response_model=OrganizerTeamItemOut, summary="Update Single Team Status")
def update_team_status(
    team_id: int,
    payload: UpdateTeamStatusIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> OrganizerTeamItemOut:
    """
    Update a team's status (shortlisted, disqualified, registered) with audit logging.
    """
    valid_statuses = {"registered", "shortlisted", "disqualified"}
    target_status = payload.status.strip().lower()
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed: {', '.join(valid_statuses)}",
        )

    team = (
        db.query(Team)
        .options(
            joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(Team.submissions),
            joinedload(Team.hackathon),
        )
        .filter(Team.id == team_id)
        .first()
    )
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team with ID {team_id} not found.",
        )

    # Resolve Organization
    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    if membership:
        org_id = membership.organization_id
    else:
        first_org = db.query(Organization).first()
        org_id = first_org.id if first_org else (team.hackathon.organization_id if team.hackathon else 1)

    previous_status = team.status
    team.status = target_status
    db.add(team)

    # Create ActivityLog entry for governance & compliance
    action_type = f"TEAM_{target_status.upper()}"
    log_detail = (
        f"Team '{team.name}' (ID: {team.id}) status changed from '{previous_status}' to '{target_status}'. "
        f"Reason: {payload.reason or 'No reason provided'}."
    )
    audit_entry = ActivityLog(
        organization_id=org_id,
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action=action_type,
        details=log_detail,
        ip_address="127.0.0.1",
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(team)

    return map_organizer_team(team)


@router.post("/bulk-status", summary="Bulk Update Team Statuses")
def bulk_update_teams_status(
    payload: BulkUpdateTeamStatusIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> Dict[str, Any]:
    """
    Bulk update statuses for multiple teams at once.
    """
    valid_statuses = {"registered", "shortlisted", "disqualified"}
    target_status = payload.status.strip().lower()
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed: {', '.join(valid_statuses)}",
        )

    teams = db.query(Team).filter(Team.id.in_(payload.team_ids)).all()
    if not teams:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No matching teams found for bulk update.",
        )

    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    first_org = db.query(Organization).first()
    org_id = membership.organization_id if membership else (first_org.id if first_org else 1)

    updated_count = 0
    for t in teams:
        t.status = target_status
        db.add(t)
        updated_count += 1

    audit_entry = ActivityLog(
        organization_id=org_id,
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action=f"BULK_TEAM_{target_status.upper()}",
        details=(
            f"Bulk updated {updated_count} teams to status '{target_status}'. "
            f"Team IDs: {payload.team_ids}. Reason: {payload.reason or 'Bulk operation'}."
        ),
        ip_address="127.0.0.1",
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "updated_count": updated_count,
        "status": target_status,
        "team_ids": payload.team_ids,
    }
