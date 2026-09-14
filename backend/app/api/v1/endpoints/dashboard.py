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
from app.schemas.user import UserOut
from app.schemas.dashboard import (
    ParticipantDashboardOut,
    ParticipantDashboardStatsOut,
    ParticipantHackathonItemOut,
    ParticipantTeamSummaryOut,
    DeadlineItemOut,
    ActivityItemOut,
)
from app.api.v1.endpoints.hackathons import map_hackathon_out, ensure_utc

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
