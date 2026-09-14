import secrets
from datetime import datetime, timezone
from typing import List, Optional, Dict
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
from app.models.team import Team, TeamMember
from app.models.submission import Submission
from app.models.judging import Evaluation, HackathonJudge
from app.models.winner import HackathonWinner
from app.models.certificate import Certificate
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.winner import (
    WinnerItemCreate,
    DeclareWinnersPayload,
    WinnerOut,
    LeaderboardEntryOut,
    PrizeDistributionItemOut,
    PrizePoolOverviewOut,
    BulkCertificateIssuePayload,
    BulkCertificateIssueResult,
    WinnersDashboardOverviewOut,
)
from app.schemas.certificate import CertificateOut

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
    if user.is_superuser:
        return True
    user_roles = get_user_roles(user)
    if "super_admin" in user_roles:
        return True
    if "organizer" not in user_roles:
        return False
    return True


def build_default_prizes(winners: List[HackathonWinner]) -> PrizePoolOverviewOut:
    """Builds standard prize pool breakdown matching UI Screen #57."""
    winner_by_rank: Dict[int, str] = {w.rank: w.team.name for w in winners if w.team}

    prizes = [
        PrizeDistributionItemOut(
            rank=1,
            place_title="1st Place",
            amount_summary="₹25,000",
            amount_in_words="Twenty Five Thousand Rupees Only",
            prize_type="Cash prize",
            team_quantity=1,
            assigned_team_name=winner_by_rank.get(1),
        ),
        PrizeDistributionItemOut(
            rank=2,
            place_title="2nd Place",
            amount_summary="₹15,000",
            amount_in_words="Fifteen Thousand Rupees Only",
            prize_type="Cash prize",
            team_quantity=1,
            assigned_team_name=winner_by_rank.get(2),
        ),
        PrizeDistributionItemOut(
            rank=3,
            place_title="3rd Place",
            amount_summary="₹10,000",
            amount_in_words="Ten Thousand Rupees Only",
            prize_type="Cash prize",
            team_quantity=1,
            assigned_team_name=winner_by_rank.get(3),
        ),
        PrizeDistributionItemOut(
            rank=4,
            place_title="Special Mentions",
            amount_summary="Goodies & Swag",
            amount_in_words="Exclusive goodies, swag kits and certificates",
            prize_type="In-kind Prize",
            team_quantity=5,
            assigned_team_name=winner_by_rank.get(4),
        ),
    ]

    return PrizePoolOverviewOut(
        total_prize_pool_summary="₹50,000 + Exclusive Goodies",
        total_winners_count=3,
        prizes=prizes,
    )


def map_winner_out(w: HackathonWinner, db: Session) -> WinnerOut:
    team_name = w.team.name if w.team else "Unknown Team"
    members_list = [tm.user.full_name for tm in w.team.members if tm.user] if w.team else []

    # Get submission project title and average evaluation score
    project_title = None
    avg_score = None
    sub = w.submission
    if not sub and w.team:
        sub = db.query(Submission).filter(Submission.team_id == w.team.id).first()

    if sub:
        project_title = sub.project_title
        evals = db.query(Evaluation).filter(Evaluation.submission_id == sub.id).all()
        if evals:
            avg_score = round(sum(e.total_score for e in evals) / len(evals), 1)

    return WinnerOut(
        id=w.id,
        hackathon_id=w.hackathon_id,
        team_id=w.team_id,
        team_name=team_name,
        rank=w.rank,
        title=w.title,
        prize_amount=w.prize_amount,
        prize_type=w.prize_type,
        notes=w.notes,
        submission_id=sub.id if sub else None,
        project_title=project_title,
        average_score=avg_score,
        members_count=len(members_list),
        members=members_list,
        is_published=w.is_published,
        announced_at=w.announced_at,
        created_at=w.created_at,
    )


@router.get("/hackathons/{slug_or_id}", response_model=WinnersDashboardOverviewOut)
def get_winners_overview(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Get full winners podium, prize distribution, and competition completion metrics.
    """
    hackathon = get_hackathon(slug_or_id, db)
    winners = (
        db.query(HackathonWinner)
        .options(
            joinedload(HackathonWinner.team).joinedload(Team.members).joinedload(TeamMember.user),
            joinedload(HackathonWinner.submission),
        )
        .filter(HackathonWinner.hackathon_id == hackathon.id)
        .order_by(HackathonWinner.rank.asc())
        .all()
    )

    total_submissions = db.query(Submission).filter(Submission.hackathon_id == hackathon.id).count()
    evaluated_subs = (
        db.query(Submission.id)
        .join(Evaluation, Evaluation.submission_id == Submission.id)
        .filter(Submission.hackathon_id == hackathon.id)
        .distinct()
        .count()
    )

    winners_out = [map_winner_out(w, db) for w in winners]
    prizes_overview = build_default_prizes(winners)

    return WinnersDashboardOverviewOut(
        hackathon_id=hackathon.id,
        hackathon_slug=hackathon.slug,
        hackathon_title=hackathon.title,
        status=hackathon.status,
        is_completed=(hackathon.status == "completed" or len(winners) > 0),
        total_submissions=total_submissions,
        total_evaluated=evaluated_subs,
        winners=winners_out,
        prizes_overview=prizes_overview,
    )


@router.get("/hackathons/{slug_or_id}/leaderboard", response_model=List[LeaderboardEntryOut])
def get_ranked_leaderboard(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Calculates ranked leaderboard by aggregating judge evaluation composite scores.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to view scoring leaderboard.",
        )

    submissions = (
        db.query(Submission)
        .options(joinedload(Submission.team))
        .filter(Submission.hackathon_id == hackathon.id)
        .all()
    )

    # Fetch existing winners map
    existing_winners = {
        w.team_id: w for w in db.query(HackathonWinner).filter(HackathonWinner.hackathon_id == hackathon.id).all()
    }

    leaderboard_items = []
    for sub in submissions:
        evals = db.query(Evaluation).filter(Evaluation.submission_id == sub.id).all()
        avg = round(sum(e.total_score for e in evals) / len(evals), 1) if evals else 0.0

        winner_rec = existing_winners.get(sub.team_id)

        leaderboard_items.append({
            "team_id": sub.team_id,
            "team_name": sub.team.name if sub.team else "Team",
            "submission_id": sub.id,
            "project_title": sub.project_title,
            "tagline": sub.tagline,
            "demo_url": sub.live_demo_url,
            "github_url": sub.github_url,
            "average_score": avg,
            "evaluations_count": len(evals),
            "is_winner": winner_rec is not None,
            "winner_rank": winner_rec.rank if winner_rec else None,
            "winner_title": winner_rec.title if winner_rec else None,
        })

    # Sort descending by average score, then submission count
    leaderboard_items.sort(key=lambda x: (x["average_score"], x["evaluations_count"]), reverse=True)

    # Assign sequential ranks
    result = []
    for idx, item in enumerate(leaderboard_items, start=1):
        result.append(LeaderboardEntryOut(rank=idx, **item))

    return result


@router.post("/hackathons/{slug_or_id}/declare", response_model=WinnersDashboardOverviewOut)
def declare_winners(
    slug_or_id: str,
    payload: DeclareWinnersPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Declares podium winners, completes hackathon lifecycle, broadcasts announcement,
    and automatically issues cryptographic certificates.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to declare winners.",
        )

    # 1. Clean previous winners to allow recalculation/revision
    db.query(HackathonWinner).filter(HackathonWinner.hackathon_id == hackathon.id).delete()

    created_winners = []
    now = datetime.now(timezone.utc)

    for w_in in payload.winners:
        team = db.query(Team).filter(Team.id == w_in.team_id, Team.hackathon_id == hackathon.id).first()
        if not team:
            continue

        sub = db.query(Submission).filter(Submission.team_id == team.id).first()

        w_obj = HackathonWinner(
            hackathon_id=hackathon.id,
            team_id=team.id,
            submission_id=sub.id if sub else None,
            rank=w_in.rank,
            title=w_in.title,
            prize_amount=w_in.prize_amount,
            prize_type=w_in.prize_type,
            notes=w_in.notes,
            is_published=True,
            announced_at=now,
        )
        db.add(w_obj)
        created_winners.append(w_obj)

    # 2. Update hackathon phase to completed
    hackathon.status = "completed"
    hackathon.result_date = now

    # 3. Auto-issue digital certificates if requested
    if payload.auto_issue_certificates:
        for w_obj in created_winners:
            team = db.query(Team).options(joinedload(Team.members).joinedload(TeamMember.user)).filter_by(id=w_obj.team_id).first()
            if not team:
                continue

            cert_type = "winner" if w_obj.rank == 1 else "runner_up" if w_obj.rank in (2, 3) else "special_mention"

            for member in team.members:
                if not member.user:
                    continue
                # Check if certificate already issued
                existing_cert = (
                    db.query(Certificate)
                    .filter_by(hackathon_id=hackathon.id, user_id=member.user.id, certificate_type=cert_type)
                    .first()
                )
                if not existing_cert:
                    hex_code = secrets.token_hex(3).upper()
                    c_code = f"HS-{now.year}-{cert_type.upper()[:3]}-{hex_code}"
                    cert = Certificate(
                        certificate_code=c_code,
                        hackathon_id=hackathon.id,
                        user_id=member.user.id,
                        team_id=team.id,
                        certificate_type=cert_type,
                        title=f"{w_obj.title} - {hackathon.title}",
                        recipient_name=member.user.full_name,
                        issue_date=now,
                        qr_verification_url=f"/verify/{c_code}",
                        is_valid=True,
                    )
                    db.add(cert)

    # 4. Broadcast announcement if requested
    if payload.broadcast_announcement:
        # Build announcement content
        podium_lines = []
        for w_in in sorted(payload.winners, key=lambda x: x.rank):
            t = db.query(Team).filter_by(id=w_in.team_id).first()
            t_name = t.name if t else f"Team #{w_in.team_id}"
            prize_txt = f" ({w_in.prize_amount})" if w_in.prize_amount else ""
            podium_lines.append(f"• **{w_in.title}**: {t_name}{prize_txt}")

        announce_body = (
            f"We are thrilled to announce the official winners for **{hackathon.title}**!\n\n"
            + "\n".join(podium_lines)
            + "\n\nCongratulations to all podium finishers! Verified certificates and cash prize disbursements are now available."
        )

        announcement = Announcement(
            hackathon_id=hackathon.id,
            organization_id=hackathon.organization_id,
            author_id=current_user.id,
            title=f"🏆 Official Winners Announced for {hackathon.title}!",
            content=announce_body,
            priority="urgent",
            status="published",
            target_audience="all",
            is_pinned=True,
            views_count=0,
        )
        db.add(announcement)

    db.commit()

    # Re-fetch overview
    return get_winners_overview(slug_or_id, db, current_user)


@router.get("/hackathons/{slug_or_id}/prizes", response_model=PrizePoolOverviewOut)
def get_prizes_overview(
    slug_or_id: str,
    db: Session = Depends(get_db),
):
    """
    Get prize pool breakdown and allocations matching Screen #57.
    """
    hackathon = get_hackathon(slug_or_id, db)
    winners = db.query(HackathonWinner).filter(HackathonWinner.hackathon_id == hackathon.id).all()
    return build_default_prizes(winners)


@router.get("/hackathons/{slug_or_id}/certificates", response_model=List[CertificateOut])
def list_hackathon_certificates(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    List all digital credentials issued for this hackathon matching Screen #53.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to inspect certificate registry.",
        )

    certs = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon).joinedload(Hackathon.organization),
            joinedload(Certificate.team),
        )
        .filter(Certificate.hackathon_id == hackathon.id)
        .order_by(Certificate.issue_date.desc())
        .all()
    )

    def map_cert(c: Certificate) -> CertificateOut:
        org_name = c.hackathon.organization.name if c.hackathon and c.hackathon.organization else "HackSphere"
        return CertificateOut(
            id=c.id,
            certificate_code=c.certificate_code,
            hackathon_id=c.hackathon_id,
            hackathon_title=c.hackathon.title if c.hackathon else hackathon.title,
            hackathon_slug=c.hackathon.slug if c.hackathon else hackathon.slug,
            org_name=org_name,
            certificate_type=c.certificate_type,
            title=c.title,
            recipient_name=c.recipient_name,
            team_name=c.team.name if c.team else None,
            issue_date=c.issue_date,
            qr_verification_url=c.qr_verification_url or f"/verify/{c.certificate_code}",
            pdf_url=c.pdf_url,
            is_valid=c.is_valid,
        )

    return [map_cert(c) for c in certs]


@router.post("/hackathons/{slug_or_id}/certificates/bulk-issue", response_model=BulkCertificateIssueResult)
def bulk_issue_certificates(
    slug_or_id: str,
    payload: BulkCertificateIssuePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """
    Bulk issues digital credentials with QR verification codes for winners or all participating submitters.
    """
    hackathon = get_hackathon(slug_or_id, db)
    if not verify_organizer_access(current_user, hackathon, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Organizer role required to bulk issue certificates.",
        )

    issued_count = 0
    skipped_count = 0
    now = datetime.now(timezone.utc)

    # Collect target users based on certificate_type
    target_records = []  # list of (user, team, cert_type, title)

    if payload.certificate_type in ("winner", "all"):
        winners = db.query(HackathonWinner).filter(HackathonWinner.hackathon_id == hackathon.id).all()
        for w in winners:
            team = db.query(Team).options(joinedload(Team.members).joinedload(TeamMember.user)).filter_by(id=w.team_id).first()
            if not team:
                continue
            c_type = "winner" if w.rank == 1 else "runner_up" if w.rank in (2, 3) else "special_mention"
            for tm in team.members:
                if tm.user:
                    target_records.append((tm.user, team, c_type, f"{w.title} - {hackathon.title}"))

    if payload.certificate_type in ("participation", "all"):
        # All teams with valid submissions
        submissions = db.query(Submission).options(joinedload(Submission.team).joinedload(Team.members).joinedload(TeamMember.user)).filter_by(hackathon_id=hackathon.id).all()
        for s in submissions:
            if not s.team:
                continue
            for tm in s.team.members:
                if tm.user:
                    target_records.append((tm.user, s.team, "participation", f"Certificate of Participation - {hackathon.title}"))

    for user_obj, team_obj, c_type, cert_title in target_records:
        existing = (
            db.query(Certificate)
            .filter_by(hackathon_id=hackathon.id, user_id=user_obj.id, certificate_type=c_type)
            .first()
        )
        if existing:
            skipped_count += 1
            continue

        c_suffix = secrets.token_hex(3).upper()
        code = f"HS-{now.year}-{c_type.upper()[:3]}-{c_suffix}"
        cert = Certificate(
            certificate_code=code,
            hackathon_id=hackathon.id,
            user_id=user_obj.id,
            team_id=team_obj.id,
            certificate_type=c_type,
            title=cert_title,
            recipient_name=user_obj.full_name,
            issue_date=now,
            qr_verification_url=f"/verify/{code}",
            is_valid=True,
        )
        db.add(cert)
        issued_count += 1

    db.commit()

    total_certs = db.query(Certificate).filter(Certificate.hackathon_id == hackathon.id).count()

    return BulkCertificateIssueResult(
        issued_count=issued_count,
        skipped_count=skipped_count,
        total_certificates=total_certs,
        details=f"Successfully issued {issued_count} certificates. {skipped_count} existing certificates preserved.",
    )
