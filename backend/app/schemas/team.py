from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TeamMemberOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    skills: Optional[str] = None
    role: str  # "leader" | "member"
    status: str = "active"
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamCreatePayload(BaseModel):
    hackathon_id: int
    name: str = Field(..., min_length=2, max_length=100)
    track: Optional[str] = None


class TeamJoinPayload(BaseModel):
    invite_code: str = Field(..., min_length=4, max_length=50)


class TeamTransferLeaderPayload(BaseModel):
    new_leader_user_id: int


class TeamDetailOut(BaseModel):
    id: int
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    min_team_size: int
    max_team_size: int
    name: str
    invite_code: str
    track: Optional[str] = None
    status: str
    is_frozen: bool
    created_by_user_id: Optional[int] = None
    members: List[TeamMemberOut] = []
    has_submission: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamSummaryOut(BaseModel):
    id: int
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    name: str
    invite_code: str
    members_count: int
    max_members: int
    is_leader: bool
    is_frozen: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
