from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CertificateTemplateOut(BaseModel):
    id: int
    hackathon_id: int
    name: str
    template_type: str
    description: str
    target_audience: str
    title_text: str
    subtitle_text: Optional[str] = None
    issuer_name: str
    signatory_name: str
    signatory_title: str
    badge_text: str
    theme: str
    is_default: bool
    is_active: bool
    updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CertificateTemplateCreate(BaseModel):
    hackathon_slug: Optional[str] = None
    hackathon_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=150)
    template_type: str = Field(default="winner", max_length=50)
    description: str = Field(..., min_length=5, max_length=500)
    target_audience: str = Field(default="Winners (1st, 2nd, 3rd Place)", max_length=200)
    title_text: str = Field(default="Certificate of Excellence", max_length=200)
    subtitle_text: Optional[str] = Field(None, max_length=300)
    issuer_name: str = Field(default="TechNova Labs Organizing Committee", max_length=200)
    signatory_name: str = Field(default="Dr. Sarah Jenkins", max_length=150)
    signatory_title: str = Field(default="Lead Judge & Director of AI", max_length=150)
    badge_text: str = Field(default="CERTIFICATE", max_length=50)
    theme: str = Field(default="gold", max_length=50)


class CertificateTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    template_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    target_audience: Optional[str] = Field(None, max_length=200)
    title_text: Optional[str] = Field(None, max_length=200)
    subtitle_text: Optional[str] = Field(None, max_length=300)
    issuer_name: Optional[str] = Field(None, max_length=200)
    signatory_name: Optional[str] = Field(None, max_length=150)
    signatory_title: Optional[str] = Field(None, max_length=150)
    badge_text: Optional[str] = Field(None, max_length=50)
    theme: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class OrganizerCertificateItemOut(BaseModel):
    id: int
    certificate_code: str
    hackathon_id: int
    hackathon_title: str
    recipient_name: str
    team_id: Optional[int] = None
    team_name: Optional[str] = None
    team_position: Optional[str] = None
    member_count: int
    certificate_type: str
    title: str
    status: str
    issue_date: datetime
    qr_verification_url: str
    pdf_url: Optional[str] = None
    is_valid: bool
    template_id: Optional[int] = None
    template_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrganizerCertificatesSummaryOut(BaseModel):
    total_certificates: int
    issued_count: int
    pending_count: int
    issued_percentage: str


class OrganizerCertificatesDashboardOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    summary: OrganizerCertificatesSummaryOut
    templates: List[CertificateTemplateOut]
    certificates: List[OrganizerCertificateItemOut]

    model_config = ConfigDict(from_attributes=True)


class BulkCertificateActionPayload(BaseModel):
    hackathon_slug: Optional[str] = None
    hackathon_id: Optional[int] = None
    target: str = Field(default="all")  # "all", "winner", "special_mention", "participation"
    template_id: Optional[int] = None


class BulkCertificateActionResult(BaseModel):
    success: bool
    issued_count: int
    skipped_count: int
    message: str


class EmailCertificatesPayload(BaseModel):
    hackathon_slug: Optional[str] = None
    hackathon_id: Optional[int] = None
    subject: Optional[str] = None
    custom_message: Optional[str] = None
    certificate_ids: Optional[List[int]] = None


class EmailCertificatesResult(BaseModel):
    success: bool
    sent_count: int
    message: str
