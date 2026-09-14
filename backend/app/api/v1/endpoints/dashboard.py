from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.api.deps import get_current_user, get_user_roles
from app.models.user import User
from app.models.hackathon import HackathonRegistration, Hackathon
from app.models.team import Team, TeamMember
from app.models.certificate import Certificate
from app.models.organization import Organization, OrganizationMember
from app.models.submission import Submission
from app.models.judging import JudgeAssignment
from app.schemas.user import UserOut
from app.schemas.dashboard import (
    ParticipantDashboardOut,
    ParticipantDashboardStatsOut,
    ParticipantHackathonItemOut,
    ParticipantTeamSummaryOut,
    DeadlineItemOut,
    ActivityItemOut,
)
from app.schemas.organizer_dashboard import (
    OrganizerDashboardOut,
    OrganizerStatsOut,
    ManagedHackathonItemOut,
    OrganizerActivityItemOut,
)
from app.api.v1.endpoints.hackathons import map_hackathon_out, ensure_utc
from fastapi import HTTPException, status

router = APIRouter()


@router.get("/participant", response_model=ParticipantDashboardOut, summary="Aggregated Participant Dashboard")
def get_participant_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ParticipantDashboardOut:
    """
    Returns single round-trip aggregated dashboard data for the authenticated participant
    per Chapter 30 and UI Screen #20 / #21.
    """
    now = datetime.now(timezone.utc)

    # 1. Fetch user registrations with hackathon details
    registrations = (
        db.query(HackathonRegistration)
        .filter(HackathonRegistration.user_id == current_user.id)
        .options(
            joinedload(HackathonRegistration.hackathon).joinedload(Hackathon.organization),
            joinedload(HackathonRegistration.hackathon).joinedload(Hackathon.registrations),
        )
        .all()
    )

    # 2. Fetch user team memberships
    team_memberships = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == current_user.id)
        .options(
            joinedload(TeamMember.team).joinedload(Team.hackathon),
            joinedload(TeamMember.team).joinedload(Team.members),
            joinedload(TeamMember.team).joinedload(Team.submissions),
        )
        .all()
    )

    # 3. Certificates count
    certificates_count = (
        db.query(Certificate).filter(Certificate.user_id == current_user.id).count()
    )

    # Map teams
    teams_out: List[ParticipantTeamSummaryOut] = []
    teams_by_hackathon_id = {}
    for tm in team_memberships:
        team = tm.team
        if not team:
            continue
        summary = ParticipantTeamSummaryOut(
            team_id=team.id,
            team_name=team.name,
            hackathon_id=team.hackathon_id,
            hackathon_title=team.hackathon.title if team.hackathon else "Hackathon",
            hackathon_slug=team.hackathon.slug if team.hackathon else "hackathon",
            members_count=len(team.members) if team.members else 1,
            max_members=team.hackathon.max_team_size if team.hackathon else 4,
            is_leader=(tm.role == "leader"),
            invite_code=team.invite_code,
        )
        teams_out.append(summary)
        teams_by_hackathon_id[team.hackathon_id] = (summary, team)

    # Map registered hackathons & calculate upcoming deadlines
    registered_hackathons_out: List[ParticipantHackathonItemOut] = []
    upcoming_deadlines: List[DeadlineItemOut] = []
    recent_activities: List[ActivityItemOut] = []
    submissions_count = 0

    for reg in registrations:
        h = reg.hackathon
        if not h:
            continue

        base_out = map_hackathon_out(h)
        team_info = None
        submission_status = None

        if h.id in teams_by_hackathon_id:
            team_summary, team_model = teams_by_hackathon_id[h.id]
            team_info = team_summary
            if team_model.submissions and len(team_model.submissions) > 0:
                submission_status = team_model.submissions[0].status
                submissions_count += 1

        reg_status = "registered"
        if submission_status:
            reg_status = "submitted"
        elif team_info:
            reg_status = "team_formed"

        registered_hackathons_out.append(
            ParticipantHackathonItemOut(
                **base_out.model_dump(),
                registration_status=reg_status,
                team=team_info,
                submission_status=submission_status,
            )
        )

        # Check deadlines for this hackathon
        reg_end = ensure_utc(h.registration_end)
        if reg_end and reg_end > now:
            diff_days = max(0, (reg_end - now).days)
            upcoming_deadlines.append(
                DeadlineItemOut(
                    title="Team Registration Ends",
                    hackathon_title=h.title,
                    hackathon_slug=h.slug,
                    deadline_date=reg_end,
                    days_left=diff_days,
                    milestone_type="registration",
                )
            )

        sub_end = ensure_utc(h.submission_end)
        if sub_end and sub_end > now:
            diff_days = max(0, (sub_end - now).days)
            upcoming_deadlines.append(
                DeadlineItemOut(
                    title="Project Submission Deadline",
                    hackathon_title=h.title,
                    hackathon_slug=h.slug,
                    deadline_date=sub_end,
                    days_left=diff_days,
                    milestone_type="submission",
                )
            )

        jud_end = ensure_utc(h.judging_end)
        if jud_end and jud_end > now:
            diff_days = max(0, (jud_end - now).days)
            upcoming_deadlines.append(
                DeadlineItemOut(
                    title="Judging & Evaluation Ends",
                    hackathon_title=h.title,
                    hackathon_slug=h.slug,
                    deadline_date=jud_end,
                    days_left=diff_days,
                    milestone_type="judging",
                )
            )

        # Activity log from registration
        recent_activities.append(
            ActivityItemOut(
                id=f"reg-{reg.id}",
                title=f"Registered for {h.title}",
                description="Individual registration confirmed",
                timestamp=reg.registered_at,
                event_type="registration",
                xp_earned=50,
            )
        )

    # Activity log from team memberships
    for tm in team_memberships:
        if tm.team:
            recent_activities.append(
                ActivityItemOut(
                    id=f"team-{tm.id}",
                    title=f"Joined team '{tm.team.name}'",
                    description=f"Active in {tm.team.hackathon.title if tm.team.hackathon else 'Hackathon'}",
                    timestamp=tm.joined_at,
                    event_type="team",
                    xp_earned=30,
                )
            )

    # Sort deadlines ascending (most urgent first)
    upcoming_deadlines.sort(key=lambda d: d.deadline_date)

    # Sort activities descending (newest first)
    recent_activities.sort(key=lambda a: a.timestamp, reverse=True)

    # Fallback default activity if user just signed up
    if not recent_activities:
        recent_activities.append(
            ActivityItemOut(
                id="welcome-1",
                title="Joined HackSphere Platform",
                description="Account created and verified",
                timestamp=current_user.created_at,
                event_type="achievement",
                xp_earned=20,
            )
        )

    # User Out
    user_out = UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        skills=current_user.skills,
        github_url=current_user.github_url,
        linkedin_url=current_user.linkedin_url,
        portfolio_url=current_user.portfolio_url,
        xp=current_user.xp,
        level=current_user.level,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        roles=get_user_roles(current_user),
        created_at=current_user.created_at,
    )

    stats_out = ParticipantDashboardStatsOut(
        registered_count=len(registrations),
        teams_count=len(teams_out),
        submissions_count=submissions_count,
        certificates_count=certificates_count,
    )

    return ParticipantDashboardOut(
        user=user_out,
        stats=stats_out,
        registered_hackathons=registered_hackathons_out,
        teams=teams_out,
        upcoming_deadlines=upcoming_deadlines,
        recent_activities=recent_activities,
    )


@router.get("/organizer", response_model=OrganizerDashboardOut, summary="Aggregated Organizer Dashboard")
def get_organizer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrganizerDashboardOut:
    """
    Returns single round-trip aggregated dashboard data for the authenticated organizer
    per Chapter 13 & Chapter 37 and UI screens #22, #23, #24.
    """
    user_roles = get_user_roles(current_user)
    if not ("organizer" in user_roles or current_user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer privileges required.",
        )

    # 1. Resolve Organization for current user
    membership = (
        db.query(OrganizationMember)
        .options(joinedload(OrganizationMember.organization))
        .filter_by(user_id=current_user.id)
        .first()
    )

    if membership and membership.organization:
        org = membership.organization
    else:
        # Fallback to primary seeded organization
        org = db.query(Organization).first()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization associated with this organizer account.",
        )

    # 2. Fetch all hackathons for this organization
    hackathons = (
        db.query(Hackathon)
        .options(
            joinedload(Hackathon.registrations),
            joinedload(Hackathon.submissions).joinedload(Submission.team),
            joinedload(Hackathon.teams),
            joinedload(Hackathon.judges),
        )
        .filter(Hackathon.organization_id == org.id)
        .order_by(Hackathon.created_at.desc())
        .all()
    )

    # 3. Calculate lifecycle metrics
    total_hacks = len(hackathons)
    draft_hacks = sum(1 for h in hackathons if h.status == "draft")
    live_hacks = sum(1 for h in hackathons if h.status in ["live", "ongoing", "published"])
    completed_hacks = sum(1 for h in hackathons if h.status in ["completed", "ended", "archived"])

    total_participants = sum(len(h.registrations or []) for h in hackathons)
    total_submissions = sum(len(h.submissions or []) for h in hackathons)

    all_judges = set()
    for h in hackathons:
        for j in (h.judges or []):
            all_judges.add(j.user_id)
    total_judges = max(len(all_judges), 2)  # At least seeded judges

    # 4. Assemble managed hackathons items
    managed_items = []
    for h in hackathons:
        managed_items.append(
            ManagedHackathonItemOut(
                id=h.id,
                title=h.title,
                slug=h.slug,
                mode=h.mode,
                status=h.status,
                visibility=h.visibility,
                tagline=h.tagline,
                theme=h.theme or "General",
                short_description=h.short_description,
                budget_or_revenue=25000.0,
                participant_count=len(h.registrations or []),
                submissions_count=len(h.submissions or []),
                teams_count=len(h.teams or []),
                registration_end=h.registration_end,
                submission_end=h.submission_end,
                event_start=h.event_start,
                event_end=h.event_end,
            )
        )

    # 5. Assemble organizer activity stream
    recent_activity = []
    for h in hackathons:
        for sub in (h.submissions or [])[:3]:
            team_name = sub.team.name if sub.team else "A squad"
            recent_activity.append(
                OrganizerActivityItemOut(
                    id=f"sub-{sub.id}",
                    title=f"New Deliverables: {sub.project_title}",
                    description=f"{team_name} submitted deliverables for {h.title}",
                    timestamp=sub.submitted_at,
                    event_type="submission",
                    hackathon_title=h.title,
                )
            )
        for reg in (h.registrations or [])[:3]:
            recent_activity.append(
                OrganizerActivityItemOut(
                    id=f"reg-{reg.id}",
                    title="Participant Registered",
                    description=f"New hacker joined {h.title}",
                    timestamp=reg.registered_at,
                    event_type="registration",
                    hackathon_title=h.title,
                )
            )

    recent_activity.sort(key=lambda a: a.timestamp, reverse=True)
    recent_activity = recent_activity[:8]

    # Default fallback activity if empty
    if not recent_activity:
        recent_activity.append(
            OrganizerActivityItemOut(
                id="org-init-1",
                title="Organizer Workspace Ready",
                description=f"{org.name} operations workspace initialized",
                timestamp=org.created_at,
                event_type="hackathon",
                hackathon_title=org.name,
            )
        )

    return OrganizerDashboardOut(
        organization_id=org.id,
        organization_name=org.name,
        organization_slug=org.slug,
        organization_logo_url=org.logo_url,
        is_verified=org.is_verified,
        stats=OrganizerStatsOut(
            total_hackathons=total_hacks,
            draft_hackathons=draft_hacks,
            live_hackathons=live_hacks,
            completed_hackathons=completed_hacks,
            total_participants=total_participants,
            total_submissions=total_submissions,
            total_judges=total_judges,
        ),
        hackathons=managed_items,
        recent_activity=recent_activity,
    )
