from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut
from app.schemas.hackathon import HackathonOut


class DeadlineItemOut(BaseModel):
    title: str
    hackathon_title: str
    hackathon_slug: str
    deadline_date: datetime
    days_left: int
    milestone_type: str

    model_config = ConfigDict(from_attributes=True)


class ParticipantTeamSummaryOut(BaseModel):
    team_id: int
    team_name: str
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    members_count: int
    max_members: int
    is_leader: bool
    invite_code: str

    model_config = ConfigDict(from_attributes=True)


class ParticipantHackathonItemOut(HackathonOut):
    registration_status: str = "registered"
    team: Optional[ParticipantTeamSummaryOut] = None
    submission_status: Optional[str] = None


class ActivityItemOut(BaseModel):
    id: str
    title: str
    description: str
    timestamp: datetime
    event_type: str
    xp_earned: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ParticipantDashboardStatsOut(BaseModel):
    registered_count: int = 0
    teams_count: int = 0
    submissions_count: int = 0
    certificates_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ParticipantDashboardOut(BaseModel):
    user: UserOut
    stats: ParticipantDashboardStatsOut
    registered_hackathons: List[ParticipantHackathonItemOut] = []
    teams: List[ParticipantTeamSummaryOut] = []
    upcoming_deadlines: List[DeadlineItemOut] = []
    recent_activities: List[ActivityItemOut] = []

    model_config = ConfigDict(from_attributes=True)
