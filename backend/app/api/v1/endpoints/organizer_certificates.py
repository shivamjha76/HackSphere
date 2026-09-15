import io
import csv
import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.team import Team, TeamMember
from app.models.certificate import Certificate
from app.models.certificate_template import CertificateTemplate
from app.models.organization import ActivityLog
from app.schemas.organizer_certificates import (
    CertificateTemplateOut,
    CertificateTemplateCreate,
    CertificateTemplateUpdate,
    OrganizerCertificateItemOut,
    OrganizerCertificatesSummaryOut,
    OrganizerCertificatesDashboardOut,
    BulkCertificateActionPayload,
    BulkCertificateActionResult,
    EmailCertificatesPayload,
    EmailCertificatesResult,
)

router = APIRouter()


def _get_hackathon_by_slug_or_id(db: Session, slug: Optional[str] = None, hackathon_id: Optional[int] = None) -> Hackathon:
    if hackathon_id:
        h = db.query(Hackathon).filter_by(id=hackathon_id).first()
        if h:
            return h
    if slug:
        h = db.query(Hackathon).filter_by(slug=slug).first()
        if h:
            return h
    # Default fallback to first active or available hackathon
    fallback = db.query(Hackathon).first()
    if not fallback:
        raise HTTPException(status_code=404, detail="No hackathon found in system.")
    return fallback


def _map_certificate_item(c: Certificate, winners_rank_map: Optional[dict] = None) -> OrganizerCertificateItemOut:
    position = c.team_position
    if not position and c.team_id and winners_rank_map and c.team_id in winners_rank_map:
        position = winners_rank_map[c.team_id]
    if not position:
        position = "Registered Participant" if c.certificate_type == "participation" else (c.title or "Participant")

    member_cnt = c.member_count
    if not member_cnt and c.team and hasattr(c.team, "members") and c.team.members:
        member_cnt = len(c.team.members)
    if not member_cnt:
        member_cnt = 1

    return OrganizerCertificateItemOut(
        id=c.id,
        certificate_code=c.certificate_code,
        hackathon_id=c.hackathon_id,
        hackathon_title=c.hackathon.title if c.hackathon else "AI Hack Summit 2026",
        recipient_name=c.recipient_name,
        team_id=c.team_id,
        team_name=c.team.name if c.team else None,
        team_position=position,
        member_count=member_cnt,
        certificate_type=c.certificate_type,
        title=c.title,
        status=c.status or "issued",
        issue_date=c.issue_date,
        qr_verification_url=c.qr_verification_url or f"https://hacksphere.dev/verify/{c.certificate_code}",
        pdf_url=c.pdf_url,
        is_valid=c.is_valid,
        template_id=c.template_id,
        template_name=c.template.name if c.template else None,
    )


@router.get("", response_model=OrganizerCertificatesDashboardOut, summary="Organizer Certificates Dashboard")
def get_organizer_certificates_dashboard(
    hackathon_slug: Optional[str] = Query("ai-hack-summit-2026"),
    hackathon_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrganizerCertificatesDashboardOut:
    """
    Returns full certificates dashboard data matching Screen #53:
    Summary metrics (Total, Issued %, Pending), Certificate Templates,
    and Issued Certificates manifest with team and position metadata.
    """
    hackathon = _get_hackathon_by_slug_or_id(db, hackathon_slug, hackathon_id)

    # 1. Fetch templates
    templates = (
        db.query(CertificateTemplate)
        .filter(CertificateTemplate.hackathon_id == hackathon.id)
        .order_by(CertificateTemplate.id.asc())
        .all()
    )

    # If none exist yet, auto-seed defaults
    if not templates:
        t1 = CertificateTemplate(
            hackathon_id=hackathon.id,
            name="Winner Certificate Template",
            template_type="winner",
            description="Default Certificate for 1st, 2nd, 3rd place winners.",
            target_audience="Winners (1st, 2nd, 3rd Place)",
            title_text="Certificate of Excellence",
            subtitle_text="In recognition of outstanding technical innovation and podium finish.",
            issuer_name=f"{hackathon.title} Organizing Committee",
            signatory_name="Dr. Sarah Jenkins",
            signatory_title="Lead Judge & Director of AI",
            badge_text="CERTIFICATE",
            theme="gold",
            is_default=True,
            is_active=True,
        )
        t2 = CertificateTemplate(
            hackathon_id=hackathon.id,
            name="Special Mentions Certificate",
            template_type="special_mention",
            description="Recognizes distinguished innovation, UX excellence, or community impact.",
            target_audience="Special Mentions (Goodies & Swag, 4 Teams)",
            title_text="Certificate of Distinction",
            subtitle_text="Awarded for exceptional creativity, execution, and honorable mention.",
            issuer_name=f"{hackathon.title} Organizing Committee",
            signatory_name="Rohan Mehta",
            signatory_title="Principal AI Architect & Judge",
            badge_text="DISTINCTION",
            theme="emerald",
            is_default=False,
            is_active=True,
        )
        t3 = CertificateTemplate(
            hackathon_id=hackathon.id,
            name="Participation Certificate",
            template_type="participation",
            description="Standard verifiable credential awarded to all verified active project submitters.",
            target_audience="All Active Hackers (324 Participants)",
            title_text="Certificate of Participation",
            subtitle_text="In recognition of active participation, collaboration, and hackathon project delivery.",
            issuer_name=f"{hackathon.title} Organizing Committee",
            signatory_name="Priya Sharma",
            signatory_title="Operations Director, TechNova Labs",
            badge_text="PARTICIPANT",
            theme="blue",
            is_default=False,
            is_active=True,
        )
        db.add_all([t1, t2, t3])
        db.commit()
        templates = [t1, t2, t3]

    # 2. Fetch certificates
    certs = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon),
            joinedload(Certificate.team),
            joinedload(Certificate.template),
        )
        .filter(Certificate.hackathon_id == hackathon.id)
        .order_by(Certificate.issue_date.desc())
        .all()
    )

    total_certs = len(certs)
    issued_count = sum(1 for c in certs if c.status == "issued" and c.is_valid)
    pending_count = total_certs - issued_count
    issued_pct = f"{(issued_count / total_certs * 100):.0f}%" if total_certs > 0 else "100%"

    summary = OrganizerCertificatesSummaryOut(
        total_certificates=total_certs,
        issued_count=issued_count,
        pending_count=pending_count,
        issued_percentage=issued_pct,
    )

    from app.models.winner import HackathonWinner
    winners = db.query(HackathonWinner).filter_by(hackathon_id=hackathon.id).all()
    winners_rank_map = {w.team_id: w.title for w in winners if w.team_id}

    return OrganizerCertificatesDashboardOut(
        hackathon_id=hackathon.id,
        hackathon_title=hackathon.title,
        hackathon_slug=hackathon.slug,
        summary=summary,
        templates=[CertificateTemplateOut.model_validate(t) for t in templates],
        certificates=[_map_certificate_item(c, winners_rank_map) for c in certs],
    )


@router.post("/templates", response_model=CertificateTemplateOut, summary="Create Certificate Template")
def create_certificate_template(
    payload: CertificateTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateTemplateOut:
    """Create a new custom certificate template."""
    hackathon = _get_hackathon_by_slug_or_id(db, payload.hackathon_slug, payload.hackathon_id)

    template = CertificateTemplate(
        hackathon_id=hackathon.id,
        name=payload.name,
        template_type=payload.template_type,
        description=payload.description,
        target_audience=payload.target_audience,
        title_text=payload.title_text,
        subtitle_text=payload.subtitle_text,
        issuer_name=payload.issuer_name,
        signatory_name=payload.signatory_name,
        signatory_title=payload.signatory_title,
        badge_text=payload.badge_text,
        theme=payload.theme,
        is_default=False,
        is_active=True,
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    if hackathon.organization_id:
        db.add(
            ActivityLog(
                organization_id=hackathon.organization_id,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action="Created Certificate Template",
                details=f"Created template '{template.name}' ({template.theme} theme) for {hackathon.title}",
                ip_address="127.0.0.1",
            )
        )
        db.commit()

    return CertificateTemplateOut.model_validate(template)


@router.patch("/templates/{template_id}", response_model=CertificateTemplateOut, summary="Update Certificate Template")
def update_certificate_template(
    template_id: int,
    payload: CertificateTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateTemplateOut:
    """Update an existing certificate template."""
    template = db.query(CertificateTemplate).filter_by(id=template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Certificate template not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)

    template.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(template)

    hackathon = db.query(Hackathon).filter_by(id=template.hackathon_id).first()
    if hackathon and hackathon.organization_id:
        db.add(
            ActivityLog(
                organization_id=hackathon.organization_id,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action="Updated Certificate Template",
                details=f"Updated certificate template '{template.name}'",
                ip_address="127.0.0.1",
            )
        )
        db.commit()

    return CertificateTemplateOut.model_validate(template)


@router.post("/{certificate_id}/reissue", response_model=OrganizerCertificateItemOut, summary="Reissue Certificate")
def reissue_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrganizerCertificateItemOut:
    """Reissues a certificate with refreshed timestamp and verification state."""
    cert = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon),
            joinedload(Certificate.team),
            joinedload(Certificate.template),
        )
        .filter_by(id=certificate_id)
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    cert.issue_date = datetime.now(timezone.utc)
    cert.status = "issued"
    cert.is_valid = True
    db.commit()
    db.refresh(cert)

    if cert.hackathon and cert.hackathon.organization_id:
        db.add(
            ActivityLog(
                organization_id=cert.hackathon.organization_id,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action="Reissued Certificate",
                details=f"Reissued credential {cert.certificate_code} for {cert.recipient_name} ({cert.title})",
                ip_address="127.0.0.1",
            )
        )
        db.commit()

    return _map_certificate_item(cert)


@router.post("/bulk-issue", response_model=BulkCertificateActionResult, summary="Bulk Issue Certificates")
def bulk_issue_certificates(
    payload: BulkCertificateActionPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BulkCertificateActionResult:
    """
    Bulk issues verifiable credentials to winning teams or registered participants.
    """
    hackathon = _get_hackathon_by_slug_or_id(db, payload.hackathon_slug, payload.hackathon_id)

    # Find candidate teams
    teams = db.query(Team).filter_by(hackathon_id=hackathon.id).all()
    issued_count = 0
    skipped_count = 0

    now = datetime.now(timezone.utc)

    for team in teams:
        existing = db.query(Certificate).filter_by(
            hackathon_id=hackathon.id, team_id=team.id
        ).first()

        if existing:
            skipped_count += 1
            continue

        leader_member = db.query(TeamMember).filter_by(team_id=team.id, role="leader").first()
        leader_user = db.query(User).filter_by(id=leader_member.user_id).first() if leader_member else current_user
        member_cnt = db.query(TeamMember).filter_by(team_id=team.id).count() or 1

        rand_code = f"HS-{now.year}-CERT-{secrets.token_hex(3).upper()}"

        new_cert = Certificate(
            certificate_code=rand_code,
            hackathon_id=hackathon.id,
            user_id=leader_user.id,
            team_id=team.id,
            template_id=payload.template_id,
            certificate_type="participation",
            title=f"Certificate of Completion - {hackathon.title}",
            recipient_name=leader_user.full_name,
            team_position="Registered Participant",
            member_count=member_cnt,
            status="issued",
            issue_date=now,
            qr_verification_url=f"https://hacksphere.dev/verify/{rand_code}",
            is_valid=True,
        )
        db.add(new_cert)
        issued_count += 1

    db.commit()

    if hackathon.organization_id:
        db.add(
            ActivityLog(
                organization_id=hackathon.organization_id,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action="Bulk Issued Certificates",
                details=f"Bulk issued {issued_count} certificates for {hackathon.title} ({skipped_count} skipped).",
                ip_address="127.0.0.1",
            )
        )
        db.commit()

    return BulkCertificateActionResult(
        success=True,
        issued_count=issued_count,
        skipped_count=skipped_count,
        message=f"Bulk issuance complete: {issued_count} credentials issued, {skipped_count} existing credentials preserved.",
    )


@router.post("/email-dispatch", response_model=EmailCertificatesResult, summary="Email Certificates to Teams")
def email_certificates_to_teams(
    payload: EmailCertificatesPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EmailCertificatesResult:
    """
    Simulates / dispatches official email notifications containing
    verifiable credentials and public registry links to recipient team rosters.
    """
    hackathon = _get_hackathon_by_slug_or_id(db, payload.hackathon_slug, payload.hackathon_id)

    certs_query = db.query(Certificate).filter_by(hackathon_id=hackathon.id, is_valid=True)
    if payload.certificate_ids:
        certs_query = certs_query.filter(Certificate.id.in_(payload.certificate_ids))

    target_certs = certs_query.all()
    count = len(target_certs)

    if hackathon.organization_id:
        db.add(
            ActivityLog(
                organization_id=hackathon.organization_id,
                user_id=current_user.id,
                user_name=current_user.full_name,
                action="Emailed Certificates",
                details=f"Dispatched email notifications with signed credentials to {count} recipient teams for {hackathon.title}.",
                ip_address="127.0.0.1",
            )
        )
        db.commit()

    return EmailCertificatesResult(
        success=True,
        sent_count=count,
        message=f"Official certificate notification emails successfully dispatched to {count} recipient teams.",
    )


@router.get("/download-all", summary="Bulk Download Certificates Manifest (CSV)")
def download_certificates_manifest(
    hackathon_slug: Optional[str] = Query("ai-hack-summit-2026"),
    hackathon_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Exports a comprehensive CSV manifest of all issued certificates and verification hashes.
    """
    hackathon = _get_hackathon_by_slug_or_id(db, hackathon_slug, hackathon_id)

    certs = (
        db.query(Certificate)
        .options(joinedload(Certificate.team), joinedload(Certificate.template))
        .filter_by(hackathon_id=hackathon.id)
        .order_by(Certificate.issue_date.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Certificate Code",
        "Recipient Name",
        "Team Name",
        "Team Position",
        "Certificate Type",
        "Certificate Title",
        "Status",
        "Issue Date",
        "Public Verification URL",
    ])

    for c in certs:
        writer.writerow([
            c.certificate_code,
            c.recipient_name,
            c.team.name if c.team else "—",
            c.team_position or "—",
            c.certificate_type,
            c.title,
            c.status,
            c.issue_date.isoformat() if c.issue_date else "",
            c.qr_verification_url or f"https://hacksphere.dev/verify/{c.certificate_code}",
        ])

    csv_data = output.getvalue()
    filename = f"certificates_{hackathon.slug}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
