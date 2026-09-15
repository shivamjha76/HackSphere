import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.api.deps import require_organizer
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.organization import Organization, OrganizationMember, ActivityLog
from app.models.team import Team, TeamMember
from app.models.winner import HackathonWinner
from app.schemas.organizer_teams import ManagedHackathonRef
from app.schemas.organizer_prizes import (
    PrizeTierItemOut,
    PrizePoolSummaryOut,
    EligibleTeamRef,
    OrganizerWinnersPrizesOverviewOut,
    UpdatePrizeTierIn,
    DisbursePrizeIn,
    CreatePrizeTierIn,
)

router = APIRouter()


def ensure_default_prize_tiers_for_hackathon(hackathon: Hackathon, db: Session) -> List[HackathonWinner]:
    """Ensures Screen #57 standard 1st, 2nd, 3rd, and Special Mentions exist for the hackathon."""
    existing_winners = (
        db.query(HackathonWinner)
        .options(joinedload(HackathonWinner.team).joinedload(Team.members).joinedload(TeamMember.user))
        .filter(HackathonWinner.hackathon_id == hackathon.id)
        .order_by(HackathonWinner.rank.asc())
        .all()
    )
    if existing_winners:
        return existing_winners

    # Resolve available teams
    teams = db.query(Team).filter(Team.hackathon_id == hackathon.id).order_by(Team.id.asc()).all()
    t_map = {t.name.lower(): t for t in teams}

    default_tiers_data = [
        {
            "rank": 1,
            "title": "1st Place",
            "prize_amount": "₹25,000",
            "prize_type": "cash",
            "notes": "Twenty Five Thousand Rupees Only",
            "team": t_map.get("codecrafters") or (teams[0] if len(teams) > 0 else None),
            "disbursement_status": "disbursed",
            "transaction_reference": "TXN-HS-2026-9841",
        },
        {
            "rank": 2,
            "title": "2nd Place",
            "prize_amount": "₹15,000",
            "prize_type": "cash",
            "notes": "Fifteen Thousand Rupees Only",
            "team": t_map.get("bytebuilders") or (teams[1] if len(teams) > 1 else None),
            "disbursement_status": "ready",
            "transaction_reference": None,
        },
        {
            "rank": 3,
            "title": "3rd Place",
            "prize_amount": "₹10,000",
            "prize_type": "cash",
            "notes": "Ten Thousand Rupees Only",
            "team": t_map.get("devdynamos") or (teams[2] if len(teams) > 2 else None),
            "disbursement_status": "pending",
            "transaction_reference": None,
        },
        {
            "rank": 4,
            "title": "Special Mentions",
            "prize_amount": "Goodies & Swag",
            "prize_type": "goodies",
            "notes": "Exclusive goodies, swag kits and certificates",
            "team": t_map.get("pixelpioneers") or (teams[3] if len(teams) > 3 else None),
            "disbursement_status": "ready",
            "transaction_reference": None,
        },
    ]

    new_winners = []
    for item in default_tiers_data:
        if item["team"]:
            w = HackathonWinner(
                hackathon_id=hackathon.id,
                team_id=item["team"].id,
                rank=item["rank"],
                title=item["title"],
                prize_amount=item["prize_amount"],
                prize_type=item["prize_type"],
                notes=item["notes"],
                disbursement_status=item["disbursement_status"],
                transaction_reference=item["transaction_reference"],
                is_published=True,
            )
            db.add(w)
            new_winners.append(w)

    db.commit()
    return (
        db.query(HackathonWinner)
        .options(joinedload(HackathonWinner.team).joinedload(Team.members).joinedload(TeamMember.user))
        .filter(HackathonWinner.hackathon_id == hackathon.id)
        .order_by(HackathonWinner.rank.asc())
        .all()
    )


def map_prize_tier_item(w: HackathonWinner) -> PrizeTierItemOut:
    """Map a HackathonWinner entity to rich PrizeTierItemOut matching Screen #57."""
    team_name = w.team.name if w.team else None
    team_track = w.team.track if w.team else None
    members_names: List[str] = []
    members_count = 0
    if w.team and w.team.members:
        members_count = len(w.team.members)
        members_names = [m.user.full_name for m in w.team.members if m.user]

    prize_type_display = "Cash prize"
    if w.prize_type in ("goodies", "in_kind", "swag"):
        prize_type_display = "In-kind Prize"
    elif w.prize_type in ("credits", "cloud"):
        prize_type_display = "Cloud Credits"

    team_quantity = 5 if "special" in w.title.lower() or w.rank >= 4 else 1

    return PrizeTierItemOut(
        id=w.id,
        rank=w.rank,
        place_title=w.title,
        amount_summary=w.prize_amount or "₹0",
        amount_in_words=w.notes,
        prize_type=prize_type_display,
        team_quantity=team_quantity,
        assigned_team_id=w.team_id,
        assigned_team_name=team_name,
        assigned_team_track=team_track,
        team_members_count=members_count,
        team_members_names=members_names,
        disbursement_status=w.disbursement_status or "pending",
        transaction_reference=w.transaction_reference,
        disbursed_at=w.disbursed_at,
        notes=w.notes,
    )


@router.get("", response_model=OrganizerWinnersPrizesOverviewOut, summary="Organizer Prize Pool & Winners Overview")
def get_organizer_prizes_overview(
    hackathon_id: Optional[int] = Query(None, description="Optional target hackathon ID"),
    search: Optional[str] = Query(None, description="Search prize tiers or winning teams"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> OrganizerWinnersPrizesOverviewOut:
    """
    Organizer Winners Prize Distribution & Podium Pool Management Console per UI Screen #57.
    """
    # 1. Resolve Organization
    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    org = db.query(Organization).filter(Organization.id == membership.organization_id).first() if membership else db.query(Organization).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization associated with this organizer account.",
        )

    # 2. Managed Hackathons
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
            detail="No hackathons available for prize management.",
        )

    managed_refs: List[ManagedHackathonRef] = []
    for h in managed_hackathons_db:
        t_count = db.query(Team).filter(Team.hackathon_id == h.id).count()
        managed_refs.append(
            ManagedHackathonRef(
                id=h.id,
                title=h.title,
                slug=h.slug,
                status=h.status,
                teams_count=t_count,
            )
        )

    # 3. Target Hackathon
    target_hackathon: Optional[Hackathon] = None
    if hackathon_id:
        target_hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
        if not target_hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hackathon with ID {hackathon_id} not found.",
            )
    else:
        # Default to hackathon with teams / winners
        active_hack = None
        best_count = -1
        for h in managed_hackathons_db:
            w_count = db.query(HackathonWinner).filter(HackathonWinner.hackathon_id == h.id).count()
            if w_count > best_count:
                best_count = w_count
                active_hack = h
        target_hackathon = active_hack or managed_hackathons_db[0]

    # 4. Fetch/ensure prize winners
    winners = ensure_default_prize_tiers_for_hackathon(target_hackathon, db)

    # Filter by search query if present
    filtered_winners = winners
    if search and search.strip():
        q = search.strip().lower()
        filtered_winners = [
            w for w in winners
            if q in (w.title or "").lower()
            or q in (w.prize_amount or "").lower()
            or (w.team and q in (w.team.name or "").lower())
            or q in (w.notes or "").lower()
        ]

    prize_items = [map_prize_tier_item(w) for w in filtered_winners]

    # 5. Compute summary
    first_p = next((w.prize_amount for w in winners if w.rank == 1), "₹25,000")
    second_p = next((w.prize_amount for w in winners if w.rank == 2), "₹15,000")
    third_p = next((w.prize_amount for w in winners if w.rank == 3), "₹10,000")
    special_m = "Goodies"

    # Calculate numeric cash pool
    total_cash = 0.0
    for w in winners:
        if w.prize_amount:
            # extract numeric part
            digits = re.sub(r"[^\d.]", "", w.prize_amount)
            if digits:
                try:
                    total_cash += float(digits)
                except ValueError:
                    pass

    formatted_pool = f"₹{int(total_cash):,}" if total_cash > 0 else "₹50,000"

    summary = PrizePoolSummaryOut(
        total_prize_pool=formatted_pool,
        total_cash_amount=total_cash if total_cash > 0 else 50000.0,
        currency_symbol="₹",
        total_winners_count=len(winners),
        first_place=first_p or "₹25,000",
        second_place=second_p or "₹15,000",
        third_place=third_p or "₹10,000",
        special_mentions=special_m,
        prizes=prize_items,
    )

    # 6. Available teams
    hack_teams = db.query(Team).filter(Team.hackathon_id == target_hackathon.id).all()
    available_teams = [
        EligibleTeamRef(
            id=t.id,
            name=t.name,
            track=t.track,
            members_count=len(t.members) if t.members else 0,
        )
        for t in hack_teams
    ]

    return OrganizerWinnersPrizesOverviewOut(
        hackathon_id=target_hackathon.id,
        hackathon_title=target_hackathon.title,
        hackathon_slug=target_hackathon.slug,
        status=target_hackathon.status,
        managed_hackathons=managed_refs,
        summary=summary,
        available_teams=available_teams,
    )


@router.patch("/{prize_id}", response_model=PrizeTierItemOut, summary="Update Prize Tier Details")
def update_prize_tier(
    prize_id: int,
    payload: UpdatePrizeTierIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> PrizeTierItemOut:
    """
    Update prize tier amount, description, notes, or assigned winning team.
    """
    winner = (
        db.query(HackathonWinner)
        .options(joinedload(HackathonWinner.team).joinedload(Team.members).joinedload(TeamMember.user))
        .filter(HackathonWinner.id == prize_id)
        .first()
    )
    if not winner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prize tier with ID {prize_id} not found.",
        )

    if payload.place_title is not None:
        winner.title = payload.place_title
    if payload.amount_summary is not None:
        winner.prize_amount = payload.amount_summary
    if payload.notes is not None:
        winner.notes = payload.notes
    if payload.prize_type is not None:
        p_type = payload.prize_type.lower()
        if "cash" in p_type:
            winner.prize_type = "cash"
        elif "in-kind" in p_type or "goodies" in p_type or "swag" in p_type:
            winner.prize_type = "goodies"
        else:
            winner.prize_type = "cash"

    if payload.assigned_team_id is not None:
        team = db.query(Team).filter(Team.id == payload.assigned_team_id).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assigned team with ID {payload.assigned_team_id} not found.",
            )
        winner.team_id = team.id

    # Resolve organization for ActivityLog
    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    org_id = membership.organization_id if membership else 1

    audit_entry = ActivityLog(
        organization_id=org_id,
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action="PRIZE_TIER_UPDATED",
        details=f"Prize tier '{winner.title}' (ID: {winner.id}) updated. Amount: {winner.prize_amount}. Team: {winner.team.name if winner.team else 'Unassigned'}.",
        ip_address="127.0.0.1",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(winner)

    return map_prize_tier_item(winner)


@router.post("/{prize_id}/disburse", response_model=PrizeTierItemOut, summary="Disburse Prize Reward")
def disburse_prize_reward(
    prize_id: int,
    payload: DisbursePrizeIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> PrizeTierItemOut:
    """
    Mark prize disbursement as complete with transaction reference and audit logging.
    """
    winner = (
        db.query(HackathonWinner)
        .options(joinedload(HackathonWinner.team).joinedload(Team.members).joinedload(TeamMember.user))
        .filter(HackathonWinner.id == prize_id)
        .first()
    )
    if not winner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prize tier with ID {prize_id} not found.",
        )

    winner.disbursement_status = "disbursed"
    winner.transaction_reference = payload.transaction_reference
    winner.disbursed_at = datetime.now(timezone.utc)
    if payload.notes:
        winner.notes = (winner.notes or "") + f" [Disbursed: {payload.notes}]"

    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    org_id = membership.organization_id if membership else 1

    audit_entry = ActivityLog(
        organization_id=org_id,
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action="PRIZE_DISBURSED",
        details=f"Prize reward for '{winner.title}' disbursed to Team '{winner.team.name if winner.team else 'Unknown'}'. Txn: {payload.transaction_reference}.",
        ip_address="127.0.0.1",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(winner)

    return map_prize_tier_item(winner)


@router.post("/tiers", response_model=PrizeTierItemOut, summary="Create New Prize Tier or Special Mention")
def create_prize_tier(
    payload: CreatePrizeTierIn,
    hackathon_id: int = Query(..., description="Target hackathon ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
) -> PrizeTierItemOut:
    """
    Add a new custom prize tier or special mention category.
    """
    hack = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hack:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hackathon with ID {hackathon_id} not found.",
        )

    # Determine next rank
    existing_max_rank = (
        db.query(HackathonWinner.rank)
        .filter(HackathonWinner.hackathon_id == hack.id)
        .order_by(HackathonWinner.rank.desc())
        .first()
    )
    next_rank = (existing_max_rank[0] + 1) if existing_max_rank else 1

    # Team assignment
    target_team_id = payload.assigned_team_id
    if not target_team_id:
        first_team = db.query(Team).filter(Team.hackathon_id == hack.id).first()
        target_team_id = first_team.id if first_team else 1

    p_type = "cash"
    if "in-kind" in payload.prize_type.lower() or "goodies" in payload.prize_type.lower():
        p_type = "goodies"

    new_winner = HackathonWinner(
        hackathon_id=hack.id,
        team_id=target_team_id,
        rank=next_rank,
        title=payload.place_title,
        prize_amount=payload.amount_summary,
        prize_type=p_type,
        notes=payload.amount_in_words or payload.notes,
        disbursement_status="ready",
        is_published=True,
    )
    db.add(new_winner)

    membership = db.query(OrganizationMember).filter_by(user_id=current_user.id).first()
    org_id = membership.organization_id if membership else 1

    audit_entry = ActivityLog(
        organization_id=org_id,
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action="PRIZE_TIER_CREATED",
        details=f"Created new prize category '{payload.place_title}' (Reward: {payload.amount_summary}) for hackathon '{hack.title}'.",
        ip_address="127.0.0.1",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(new_winner)

    return map_prize_tier_item(new_winner)
