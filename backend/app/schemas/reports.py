from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class DailyTrendItem(BaseModel):
    date: str
    participants: int = 0
    teams: int = 0
    submissions: int = 0

    model_config = ConfigDict(from_attributes=True)


class RoleDistributionItem(BaseModel):
    role_name: str
    count: int = 0
    percentage: float = 0.0
    color: str = "blue"

    model_config = ConfigDict(from_attributes=True)


class TopPerformingTeamItem(BaseModel):
    rank: int
    team_id: int
    team_name: str
    team_code: str
    project_title: str
    track: Optional[str] = "General"
    average_score: float = 0.0
    evaluations_count: int = 0
    submission_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ManagedHackathonRef(BaseModel):
    id: int
    title: str
    slug: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class OrganizerReportsOverviewOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    organization_name: str
    total_participants: int = 0
    participants_growth_pct: float = 18.7
    total_teams: int = 0
    teams_growth_pct: float = 12.4
    total_submissions: int = 0
    submissions_growth_pct: float = 20.0
    evaluations_completed: int = 0
    judging_growth_pct: float = 20.0
    page_views: int = 3420
    views_growth_pct: float = 25.6
    date_range_label: str = "12 May 2025 - 18 May 2025"
    role_distribution: List[RoleDistributionItem] = []
    daily_trends: List[DailyTrendItem] = []
    top_teams: List[TopPerformingTeamItem] = []
    managed_hackathons: List[ManagedHackathonRef] = []

    model_config = ConfigDict(from_attributes=True)
