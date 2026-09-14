from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class OrganizerStatsOut(BaseModel):
    total_hackathons: int
    draft_hackathons: int
    live_hackathons: int
    completed_hackathons: int
    total_participants: int
    total_submissions: int
    total_judges: int

    model_config = ConfigDict(from_attributes=True)


class ManagedHackathonItemOut(BaseModel):
    id: int
    title: str
    slug: str
    mode: str
    status: str
    visibility: str
    participant_count: int
    submissions_count: int
    teams_count: int
    registration_end: Optional[datetime] = None
    submission_end: Optional[datetime] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OrganizerActivityItemOut(BaseModel):
    id: str
    title: str
    description: str
    timestamp: datetime
    event_type: str  # "registration" | "submission" | "evaluation" | "hackathon"
    hackathon_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrganizerDashboardOut(BaseModel):
    organization_id: int
    organization_name: str
    organization_slug: str
    organization_logo_url: Optional[str] = None
    is_verified: bool
    stats: OrganizerStatsOut
    hackathons: List[ManagedHackathonItemOut]
    recent_activity: List[OrganizerActivityItemOut]

    model_config = ConfigDict(from_attributes=True)
