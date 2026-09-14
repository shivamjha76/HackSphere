from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CertificateOut(BaseModel):
    id: int
    certificate_code: str
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    org_name: str
    certificate_type: str  # "winner" | "runner_up" | "participation" | "judge" | "organizer"
    title: str
    recipient_name: str
    team_name: Optional[str] = None
    issue_date: datetime
    qr_verification_url: Optional[str] = None
    pdf_url: Optional[str] = None
    is_valid: bool

    model_config = ConfigDict(from_attributes=True)


class CertificateVerifyOut(BaseModel):
    certificate_code: str
    is_valid: bool
    title: str
    recipient_name: str
    certificate_type: str
    hackathon_title: str
    hackathon_slug: str
    org_name: str
    team_name: Optional[str] = None
    issue_date: datetime
    verification_message: str

    model_config = ConfigDict(from_attributes=True)


class CertificateIssuePayload(BaseModel):
    hackathon_id: int
    user_id: int
    team_id: Optional[int] = None
    certificate_type: str = Field(default="participation")
    title: str = Field(..., min_length=3, max_length=200)
