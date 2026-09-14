import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.team import Team
from app.models.certificate import Certificate
from app.schemas.certificate import (
    CertificateOut,
    CertificateVerifyOut,
    CertificateIssuePayload,
)

router = APIRouter()


def map_certificate_out(cert: Certificate) -> CertificateOut:
    """Helper to convert Certificate model to rich CertificateOut schema."""
    org_name = (
        cert.hackathon.organization.name
        if cert.hackathon and cert.hackathon.organization
        else "HackSphere"
    )
    return CertificateOut(
        id=cert.id,
        certificate_code=cert.certificate_code,
        hackathon_id=cert.hackathon_id,
        hackathon_title=cert.hackathon.title if cert.hackathon else "Hackathon",
        hackathon_slug=cert.hackathon.slug if cert.hackathon else "hackathon",
        org_name=org_name,
        certificate_type=cert.certificate_type,
        title=cert.title,
        recipient_name=cert.recipient_name,
        team_name=cert.team.name if cert.team else None,
        issue_date=cert.issue_date,
        qr_verification_url=cert.qr_verification_url or f"/verify/{cert.certificate_code}",
        pdf_url=cert.pdf_url,
        is_valid=cert.is_valid,
    )


@router.get("/my", response_model=List[CertificateOut], summary="List My Issued Certificates")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CertificateOut]:
    """
    Returns all verified certificates awarded to the current user.
    """
    certs = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon).joinedload(Hackathon.organization),
            joinedload(Certificate.team),
        )
        .filter(Certificate.user_id == current_user.id, Certificate.is_valid.is_(True))
        .order_by(Certificate.issue_date.desc())
        .all()
    )
    return [map_certificate_out(c) for c in certs]


@router.get("/verify/{code_or_id}", response_model=CertificateVerifyOut, summary="Public Credential Verification")
def verify_certificate_public(
    code_or_id: str,
    db: Session = Depends(get_db),
) -> CertificateVerifyOut:
    """
    Publicly verifies authenticity of a certificate without requiring login per Chapter 24.
    Accessible by recruiters, LinkedIn viewers, and employers.
    """
    clean_code = code_or_id.strip()
    query = db.query(Certificate).options(
        joinedload(Certificate.hackathon).joinedload(Hackathon.organization),
        joinedload(Certificate.team),
    )

    cert = query.filter(Certificate.certificate_code == clean_code).first()
    if not cert and clean_code.isdigit():
        cert = query.filter(Certificate.id == int(clean_code)).first()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate credential '{clean_code}' could not be verified in the registry.",
        )

    if not cert.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This certificate has been revoked or invalidated by the tournament organizers.",
        )

    org_name = (
        cert.hackathon.organization.name
        if cert.hackathon and cert.hackathon.organization
        else "HackSphere"
    )

    return CertificateVerifyOut(
        certificate_code=cert.certificate_code,
        is_valid=cert.is_valid,
        title=cert.title,
        recipient_name=cert.recipient_name,
        certificate_type=cert.certificate_type,
        hackathon_title=cert.hackathon.title if cert.hackathon else "Hackathon",
        hackathon_slug=cert.hackathon.slug if cert.hackathon else "hackathon",
        org_name=org_name,
        team_name=cert.team.name if cert.team else None,
        issue_date=cert.issue_date,
        verification_message="Verified Authentic Credential on the HackSphere Global Registry.",
    )


@router.get("/{certificate_id}", response_model=CertificateOut, summary="Get Certificate by ID")
def get_certificate_detail(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateOut:
    """
    Retrieves full certificate metadata by ID.
    """
    cert = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon).joinedload(Hackathon.organization),
            joinedload(Certificate.team),
        )
        .filter(Certificate.id == certificate_id)
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    return map_certificate_out(cert)


@router.post("/issue", response_model=CertificateOut, summary="Issue New Certificate")
def issue_certificate(
    payload: CertificateIssuePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateOut:
    """
    Issues a new verified certificate to a participant.
    """
    target_user = db.query(User).filter_by(id=payload.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Recipient user not found.")

    hackathon = db.query(Hackathon).filter_by(id=payload.hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    now = datetime.now(timezone.utc)
    type_tag = payload.certificate_type.upper()[:3]
    rand_suffix = secrets.token_hex(3).upper()
    code = f"HS-{now.year}-{type_tag}-{rand_suffix}"

    cert = Certificate(
        certificate_code=code,
        hackathon_id=hackathon.id,
        user_id=target_user.id,
        team_id=payload.team_id,
        certificate_type=payload.certificate_type,
        title=payload.title,
        recipient_name=target_user.full_name,
        issue_date=now,
        qr_verification_url=f"/verify/{code}",
        pdf_url=None,
        is_valid=True,
    )
    db.add(cert)
    db.commit()

    refreshed = (
        db.query(Certificate)
        .options(
            joinedload(Certificate.hackathon).joinedload(Hackathon.organization),
            joinedload(Certificate.team),
        )
        .filter(Certificate.id == cert.id)
        .first()
    )
    return map_certificate_out(refreshed)
