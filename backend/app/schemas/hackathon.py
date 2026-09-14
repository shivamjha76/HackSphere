from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class OrganizationBriefOut(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class HackathonOut(BaseModel):
    id: int
    organization_id: int
    title: str
    slug: str
    tagline: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    banner_url: Optional[str] = None
    logo_url: Optional[str] = None
    theme: Optional[str] = None

    mode: str
    status: str
    visibility: str

    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_end: Optional[datetime] = None
    result_date: Optional[datetime] = None

    min_team_size: int = 1
    max_team_size: int = 4
    max_participants: Optional[int] = None
    prize_pool_summary: Optional[str] = None

    participant_count: int = 0
    organization: Optional[OrganizationBriefOut] = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
