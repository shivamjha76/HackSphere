from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class OrganizerTeamMemberItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    role: str = "member"


class OrganizerTeamItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hackathon_id: int
    hackathon_title: str
    name: str
    invite_code: str
    track: Optional[str] = None
    status: str = "registered"  # registered | shortlisted | disqualified
    is_frozen: bool = False
    project_title: Optional[str] = None
    project_tagline: Optional[str] = None
    project_description: Optional[str] = None
    submission_id: Optional[int] = None
    has_submission: bool = False
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    members_count: int = 0
    members: List[OrganizerTeamMemberItem] = Field(default_factory=list)
    registered_at: datetime


class ManagedHackathonRef(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    teams_count: int = 0


class OrganizerTeamsOverviewOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    managed_hackathons: List[ManagedHackathonRef] = Field(default_factory=list)
    total_teams: int = 0
    registered_count: int = 0
    shortlisted_count: int = 0
    disqualified_count: int = 0
    teams: List[OrganizerTeamItemOut] = Field(default_factory=list)


class UpdateTeamStatusIn(BaseModel):
    status: str = Field(..., description="Target status: registered, shortlisted, or disqualified")
    reason: Optional[str] = Field(None, description="Optional justification or guideline violation note")


class BulkUpdateTeamStatusIn(BaseModel):
    team_ids: List[int] = Field(..., min_length=1, description="List of team IDs to update")
    status: str = Field(..., description="Target status: registered, shortlisted, or disqualified")
    reason: Optional[str] = Field(None, description="Optional bulk reason or memo")
