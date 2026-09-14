from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class SubmissionCreatePayload(BaseModel):
    team_id: int
    project_title: str = Field(..., min_length=2, max_length=200)
    tagline: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    github_url: Optional[str] = Field(None, max_length=500)
    live_demo_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)
    presentation_url: Optional[str] = Field(None, max_length=500)
    attachment_url: Optional[str] = Field(None, max_length=500)
    is_final: bool = False


class SubmissionUpdatePayload(BaseModel):
    project_title: Optional[str] = Field(None, min_length=2, max_length=200)
    tagline: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    github_url: Optional[str] = Field(None, max_length=500)
    live_demo_url: Optional[str] = Field(None, max_length=500)
    video_url: Optional[str] = Field(None, max_length=500)
    presentation_url: Optional[str] = Field(None, max_length=500)
    attachment_url: Optional[str] = Field(None, max_length=500)
    is_final: Optional[bool] = None


class SubmissionDetailOut(BaseModel):
    id: int
    submission_code: str
    team_id: int
    team_name: str
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    project_title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    video_url: Optional[str] = None
    presentation_url: Optional[str] = None
    attachment_url: Optional[str] = None
    version: int
    is_final: bool
    is_locked: bool
    status: str  # "draft" | "submitted"
    submitted_at: datetime
    can_edit: bool = True

    model_config = ConfigDict(from_attributes=True)


class SubmissionSummaryOut(BaseModel):
    id: int
    submission_code: str
    team_id: int
    team_name: str
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    project_title: str
    tagline: Optional[str] = None
    status: str
    version: int
    is_locked: bool
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
