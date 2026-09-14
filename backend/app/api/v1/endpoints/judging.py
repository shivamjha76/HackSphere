from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import get_current_user, get_user_roles
from app.models.hackathon import Hackathon
from app.models.judging import HackathonJudge, JudgeAssignment, Evaluation
from app.models.team import Team, TeamMember
from app.models.user import User, Role, UserRole
from app.schemas.judge_assignment import (
    JudgeInvitePayload,
    AutoDistributePayload,
    ManualAssignmentPayload,
    JudgeAssignmentItemOut,
    AppointedJudgeOut,
    HackathonJudgesOverviewOut,
)

router = APIRouter()


def check_organizer_permission(user: User):
    roles = get_user_roles(user)
    if not ("organizer" in roles or user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Organizer role required to manage tournament judges.",
        )


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


def build_judges_overview(hackathon: Hackathon, db: Session) -> HackathonJudgesOverviewOut:
    # 1. Fetch judges with user profiles
    judges = (
        db.query(HackathonJudge)
        .options(joinedload(HackathonJudge.user))
        .filter(HackathonJudge.hackathon_id == hackathon.id)
        .all()
    )

    # 2. Fetch assignments
    assignments = (
        db.query(JudgeAssignment)
        .options(
            joinedload(JudgeAssignment.judge).joinedload(HackathonJudge.user),
            joinedload(JudgeAssignment.team),
        )
        .filter(JudgeAssignment.hackathon_id == hackathon.id)
        .all()
    )

    # 3. Fetch evaluations for this hackathon
    evaluations = (
        db.query(Evaluation)
        .join(HackathonJudge, Evaluation.judge_id == HackathonJudge.id)
        .filter(HackathonJudge.hackathon_id == hackathon.id)
        .all()
    )
    # Set of completed (judge_id, team_id)
    evaluated_pairs = {
        (e.judge_id, e.submission.team_id)
        for e in evaluations
        if e.submission and e.status == "submitted"
    }

    # 4. Map judges with metrics
    judges_out = []
    total_completed_assignments = 0

    for j in judges:
        j_assignments = [a for a in assignments if a.judge_id == j.id]
        assigned_count = len(j_assignments)
        
        completed_count = sum(
            1 for a in j_assignments if a.status == "completed" or (j.id, a.team_id) in evaluated_pairs
        )
        total_completed_assignments += completed_count

        pct = round((completed_count / assigned_count * 100), 1) if assigned_count > 0 else 0.0

        judges_out.append(
            AppointedJudgeOut(
                id=j.id,
                user_id=j.user_id,
                full_name=j.user.full_name if j.user else "Judge",
                email=j.user.email if j.user else "",
                avatar_url=j.user.avatar_url if j.user else None,
                expertise=j.expertise,
                status=j.status,
                assigned_at=j.assigned_at,
                assigned_teams_count=assigned_count,
                completed_evaluations_count=completed_count,
                completion_percentage=pct,
            )
        )

    # 5. Map assignment items
    assignments_out = []
    for a in assignments:
        is_done = a.status == "completed" or (a.judge_id, a.team_id) in evaluated_pairs
        assignments_out.append(
            JudgeAssignmentItemOut(
                id=a.id,
                judge_id=a.judge_id,
                judge_name=a.judge.user.full_name if (a.judge and a.judge.user) else f"Judge #{a.judge_id}",
                team_id=a.team_id,
                team_name=a.team.name if a.team else f"Team #{a.team_id}",
                status=a.status,
                assigned_at=a.assigned_at,
                is_evaluated=is_done,
            )
        )

    total_assignments = len(assignments)
    overall_pct = (
        round((total_completed_assignments / total_assignments * 100), 1)
        if total_assignments > 0
        else 0.0
    )

    teams_count = db.query(Team).filter(Team.hackathon_id == hackathon.id).count()

    return HackathonJudgesOverviewOut(
        hackathon_id=hackathon.id,
        hackathon_slug=hackathon.slug,
        hackathon_title=hackathon.title,
        total_judges=len(judges),
        total_teams=teams_count,
        total_assignments=total_assignments,
        completed_assignments=total_completed_assignments,
        overall_progress_percentage=overall_pct,
        judges=judges_out,
        assignments=assignments_out,
    )


@router.get("/hackathons/{slug_or_id}", response_model=HackathonJudgesOverviewOut, summary="Get Hackathon Judges Overview")
def get_hackathon_judges_overview(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonJudgesOverviewOut:
    """
    Returns complete tournament judge roster, evaluation distribution, and progress metrics per Chapter 17.
    """
    check_organizer_permission(current_user)
    hackathon = get_hackathon(slug_or_id, db)
    return build_judges_overview(hackathon, db)


@router.post("/hackathons/{slug_or_id}/judges", response_model=AppointedJudgeOut, summary="Appoint / Invite Judge")
def appoint_judge(
    slug_or_id: str,
    payload: JudgeInvitePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppointedJudgeOut:
    """
    Appoints a judge to the hackathon roster by email.
    Grants the user the 'judge' role if they don't already have it.
    """
    check_organizer_permission(current_user)
    hackathon = get_hackathon(slug_or_id, db)

    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{payload.email}' not found. They must first sign up for HackSphere.",
        )

    # Check if already appointed
    existing = (
        db.query(HackathonJudge)
        .filter_by(hackathon_id=hackathon.id, user_id=user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User '{user.full_name}' is already appointed as a judge for this hackathon.",
        )

    # Ensure user has the 'judge' role
    judge_role = db.query(Role).filter_by(name="judge").first()
    if judge_role:
        has_role = (
            db.query(UserRole)
            .filter_by(user_id=user.id, role_id=judge_role.id)
            .first()
        )
        if not has_role:
            db.add(UserRole(user_id=user.id, role_id=judge_role.id))

    # Appoint judge
    appointed = HackathonJudge(
        hackathon_id=hackathon.id,
        user_id=user.id,
        expertise=payload.expertise or "General Technical Evaluation",
        status="active",
    )
    db.add(appointed)
    db.commit()
    db.refresh(appointed)

    return AppointedJudgeOut(
        id=appointed.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        avatar_url=user.avatar_url,
        expertise=appointed.expertise,
        status=appointed.status,
        assigned_at=appointed.assigned_at,
        assigned_teams_count=0,
        completed_evaluations_count=0,
        completion_percentage=0.0,
    )


@router.post("/hackathons/{slug_or_id}/distribute", response_model=HackathonJudgesOverviewOut, summary="Auto-Distribute Submissions to Judges")
def auto_distribute_submissions(
    slug_or_id: str,
    payload: AutoDistributePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HackathonJudgesOverviewOut:
    """
    Executes balanced round-robin auto-distribution of teams to appointed judges per Chapter 17.
    Enforces conflict-of-interest checks so judges are never assigned to evaluate squads where they are a member.
    """
    check_organizer_permission(current_user)
    hackathon = get_hackathon(slug_or_id, db)

    # 1. Appointed judges
    judges = (
        db.query(HackathonJudge)
        .filter(HackathonJudge.hackathon_id == hackathon.id, HackathonJudge.status == "active")
        .all()
    )
    if not judges:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active judges appointed. Please appoint judges before running auto-distribution.",
        )

    # 2. Teams to distribute
    teams = (
        db.query(Team)
        .options(joinedload(Team.members))
        .filter(Team.hackathon_id == hackathon.id)
        .all()
    )
    if not teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No teams found in this hackathon to distribute.",
        )

    # Existing assignment pairs
    existing_pairs = set(
        db.query(JudgeAssignment.judge_id, JudgeAssignment.team_id)
        .filter(JudgeAssignment.hackathon_id == hackathon.id)
        .all()
    )

    target_reviews = max(1, min(payload.reviews_per_team, len(judges)))
    judge_index = 0
    new_assignments = 0

    # 3. Round-Robin Distribution with Conflict-of-Interest Safeguard
    for team in teams:
        member_user_ids = {m.user_id for m in team.members}
        assigned_for_team = sum(1 for (j_id, t_id) in existing_pairs if t_id == team.id)
        needed = target_reviews - assigned_for_team

        if needed <= 0:
            continue

        attempts = 0
        assigned_this_round = 0

        while assigned_this_round < needed and attempts < len(judges):
            judge = judges[judge_index % len(judges)]
            judge_index += 1
            attempts += 1

            # Conflict-of-interest check: judge cannot evaluate their own team!
            if judge.user_id in member_user_ids:
                continue

            # Skip if already assigned
            if (judge.id, team.id) in existing_pairs:
                continue

            assignment = JudgeAssignment(
                hackathon_id=hackathon.id,
                judge_id=judge.id,
                team_id=team.id,
                status="assigned",
            )
            db.add(assignment)
            existing_pairs.add((judge.id, team.id))
            assigned_this_round += 1
            new_assignments += 1

    db.commit()
    return build_judges_overview(hackathon, db)


@router.post("/hackathons/{slug_or_id}/assignments", response_model=JudgeAssignmentItemOut, summary="Manual Squad Assignment")
def create_manual_assignment(
    slug_or_id: str,
    payload: ManualAssignmentPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JudgeAssignmentItemOut:
    """
    Manually creates a specific Judge ➔ Squad assignment.
    """
    check_organizer_permission(current_user)
    hackathon = get_hackathon(slug_or_id, db)

    judge = (
        db.query(HackathonJudge)
        .options(joinedload(HackathonJudge.user))
        .filter_by(id=payload.judge_id, hackathon_id=hackathon.id)
        .first()
    )
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found for this hackathon.")

    team = (
        db.query(Team)
        .options(joinedload(Team.members))
        .filter_by(id=payload.team_id, hackathon_id=hackathon.id)
        .first()
    )
    if not team:
        raise HTTPException(status_code=404, detail="Team not found for this hackathon.")

    # Conflict-of-interest check
    if any(m.user_id == judge.user_id for m in team.members):
        raise HTTPException(
            status_code=400,
            detail="Conflict of Interest: Cannot assign judge to their own team.",
        )

    # Check duplicate
    existing = (
        db.query(JudgeAssignment)
        .filter_by(hackathon_id=hackathon.id, judge_id=judge.id, team_id=team.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Team is already assigned to this judge.")

    assignment = JudgeAssignment(
        hackathon_id=hackathon.id,
        judge_id=judge.id,
        team_id=team.id,
        status="assigned",
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return JudgeAssignmentItemOut(
        id=assignment.id,
        judge_id=judge.id,
        judge_name=judge.user.full_name if judge.user else f"Judge #{judge.id}",
        team_id=team.id,
        team_name=team.name,
        status=assignment.status,
        assigned_at=assignment.assigned_at,
        is_evaluated=False,
    )


@router.delete("/assignments/{assignment_id}", summary="Delete Judge Assignment")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deletes an existing judge-to-team assignment.
    """
    check_organizer_permission(current_user)
    assignment = db.query(JudgeAssignment).filter_by(id=assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully."}
