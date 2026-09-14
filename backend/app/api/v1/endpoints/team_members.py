from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.session import get_db
from app.api.deps import get_current_user, require_organizer
from app.core.security import hash_password
from app.models.user import User, Role, UserRole
from app.models.organization import Organization, OrganizationMember, ActivityLog
from app.schemas.team_members import (
    OrgMemberOut,
    InviteMemberIn,
    UpdateMemberRoleIn,
    ActivityLogOut,
    ActivityLogsListOut,
    TeamMembersOverviewOut,
)

router = APIRouter()


def _resolve_user_org(db: Session, current_user: User) -> Organization:
    """Helper to resolve the organization for the current organizer or fallback for admin."""
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
            detail="No organization workspace found for this account.",
        )
    return org


@router.get("/my/members", response_model=TeamMembersOverviewOut)
def get_my_organization_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Retrieve organization roster, members with their scoped roles, and role distribution.
    """
    org = _resolve_user_org(db, current_user)

    memberships = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == org.id)
        .order_by(OrganizationMember.id.asc())
        .all()
    )

    members_out: List[OrgMemberOut] = []
    roles_summary: Dict[str, int] = {"owner": 0, "admin": 0, "moderator": 0, "viewer": 0}

    for m in memberships:
        user = m.user
        role_key = m.role.lower()
        roles_summary[role_key] = roles_summary.get(role_key, 0) + 1

        members_out.append(
            OrgMemberOut(
                id=m.id,
                user_id=m.user_id,
                full_name=user.full_name if user else "Unknown Member",
                email=user.email if user else "",
                role=m.role,
                joined_at=m.joined_at,
                status="active",
            )
        )

    return TeamMembersOverviewOut(
        organization_id=org.id,
        organization_name=org.name,
        is_verified=org.is_verified,
        members=members_out,
        total_members=len(members_out),
        roles_summary=roles_summary,
    )


@router.post("/my/members/invite", response_model=OrgMemberOut, status_code=status.HTTP_201_CREATED)
def invite_organization_member(
    data: InviteMemberIn,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Invite a new team member to the organization with a designated role and emit an audit log.
    """
    org = _resolve_user_org(db, current_user)

    # Verify caller authority
    caller_membership = (
        db.query(OrganizationMember)
        .filter_by(organization_id=org.id, user_id=current_user.id)
        .first()
    )
    if caller_membership and caller_membership.role not in ["owner", "admin"] and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Owners and Admins can invite team members.",
        )

    # Check if user already exists
    user = db.query(User).filter_by(email=data.email).first()
    if not user:
        user = User(
            email=data.email,
            hashed_password=hash_password("TempPassword123!"),
            full_name=data.full_name,
            is_active=True,
            is_superuser=False,
            xp=200,
            level=1,
        )
        db.add(user)
        db.flush()

        # Assign organizer role
        organizer_role = db.query(Role).filter_by(name="organizer").first()
        if organizer_role:
            ur = UserRole(user_id=user.id, role_id=organizer_role.id)
            db.add(ur)
            db.flush()

    # Check if already a member of this organization
    existing_membership = (
        db.query(OrganizationMember)
        .filter_by(organization_id=org.id, user_id=user.id)
        .first()
    )
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{data.email} is already a member of this organization.",
        )

    # Create new membership
    new_member = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role=data.role.lower(),
        joined_at=datetime.now(timezone.utc),
    )
    db.add(new_member)
    db.flush()

    # Log audit entry
    client_ip = request.client.host if request.client else "103.45.67.89"
    audit_log = ActivityLog(
        organization_id=org.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="Added Team Member",
        details=f"Added {data.full_name} as {data.role.capitalize()}",
        ip_address=client_ip,
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_log)
    db.commit()
    db.refresh(new_member)

    return OrgMemberOut(
        id=new_member.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=new_member.role,
        joined_at=new_member.joined_at,
        status="active",
    )


@router.patch("/my/members/{member_id}/role", response_model=OrgMemberOut)
def update_member_role(
    member_id: int,
    data: UpdateMemberRoleIn,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Update a member's role (owner, admin, moderator, viewer) and record audit log.
    """
    org = _resolve_user_org(db, current_user)

    target_membership = (
        db.query(OrganizationMember)
        .filter_by(id=member_id, organization_id=org.id)
        .first()
    )
    if not target_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this organization.",
        )

    caller_membership = (
        db.query(OrganizationMember)
        .filter_by(organization_id=org.id, user_id=current_user.id)
        .first()
    )
    if caller_membership and caller_membership.role not in ["owner", "admin"] and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Owners and Admins can modify member roles.",
        )

    old_role = target_membership.role
    target_membership.role = data.role.lower()

    # Log audit entry
    client_ip = request.client.host if request.client else "103.45.67.89"
    user_name = target_membership.user.full_name if target_membership.user else "Member"
    audit_log = ActivityLog(
        organization_id=org.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="Updated Role",
        details=f"Changed role of {user_name} from {old_role.capitalize()} to {data.role.capitalize()}",
        ip_address=client_ip,
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_log)
    db.commit()
    db.refresh(target_membership)

    user = target_membership.user
    return OrgMemberOut(
        id=target_membership.id,
        user_id=target_membership.user_id,
        full_name=user.full_name if user else "Unknown Member",
        email=user.email if user else "",
        role=target_membership.role,
        joined_at=target_membership.joined_at,
        status="active",
    )


@router.delete("/my/members/{member_id}")
def remove_organization_member(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Remove a member from the organization and emit an audit trail record.
    """
    org = _resolve_user_org(db, current_user)

    target_membership = (
        db.query(OrganizationMember)
        .filter_by(id=member_id, organization_id=org.id)
        .first()
    )
    if not target_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this organization.",
        )

    caller_membership = (
        db.query(OrganizationMember)
        .filter_by(organization_id=org.id, user_id=current_user.id)
        .first()
    )
    if caller_membership and caller_membership.role not in ["owner", "admin"] and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Owners and Admins can remove members.",
        )

    # Protect the last owner
    if target_membership.role == "owner":
        owner_count = (
            db.query(OrganizationMember)
            .filter_by(organization_id=org.id, role="owner")
            .count()
        )
        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the sole owner of the organization.",
            )

    user_name = target_membership.user.full_name if target_membership.user else "Member"
    client_ip = request.client.host if request.client else "103.45.67.89"

    audit_log = ActivityLog(
        organization_id=org.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="Removed Member",
        details=f"Removed {user_name} from organization",
        ip_address=client_ip,
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_log)
    db.delete(target_membership)
    db.commit()

    return {"message": f"Member {user_name} removed successfully"}


@router.get("/my/activity-logs", response_model=ActivityLogsListOut)
def get_my_organization_activity_logs(
    search: Optional[str] = Query(None, description="Search query in details or member name"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    days: Optional[int] = Query(None, description="Filter logs within recent N days"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Chronological activity and audit log stream matching UI Screen #51.
    Supports search, action type filtering, date ranges, and pagination.
    """
    org = _resolve_user_org(db, current_user)

    query = db.query(ActivityLog).filter(ActivityLog.organization_id == org.id)

    # 1. Filter by Action
    if action and action.lower() != "all" and action.lower() != "all actions":
        query = query.filter(ActivityLog.action.ilike(f"%{action}%"))

    # 2. Filter by Search
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ActivityLog.details.ilike(term),
                ActivityLog.user_name.ilike(term),
                ActivityLog.action.ilike(term),
                ActivityLog.ip_address.ilike(term),
            )
        )

    # 3. Filter by Date range (days)
    if days and days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(ActivityLog.created_at >= cutoff)

    # Total Count
    total_count = query.count()

    # Paginated slice sorted descending by created_at
    logs = (
        query.order_by(ActivityLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Fetch available distinct actions for UI dropdown
    raw_actions = (
        db.query(ActivityLog.action)
        .filter(ActivityLog.organization_id == org.id)
        .distinct()
        .all()
    )
    available_actions = [a[0] for a in raw_actions if a[0]]

    return ActivityLogsListOut(
        logs=[
            ActivityLogOut(
                id=l.id,
                organization_id=l.organization_id,
                user_id=l.user_id,
                user_name=l.user_name,
                action=l.action,
                details=l.details,
                ip_address=l.ip_address,
                created_at=l.created_at,
            )
            for l in logs
        ],
        total_count=total_count,
        page=page,
        page_size=page_size,
        available_actions=available_actions,
    )
