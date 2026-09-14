from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class JudgeAssignedHackathonOut(BaseModel):
    id: int
    title: str
    slug: str
    organization_name: str
    mode: str
    total_teams: int
    judging_end: Optional[datetime] = None
    days_remaining: int = 0
    pending_reviews_count: int = 0
    completed_reviews_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class JudgeSubmissionQueueItemOut(BaseModel):
    submission_id: int
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    team_id: int
    team_name: str
    team_code: str
    project_title: str
    tagline: Optional[str] = None
    submitted_at: datetime
    evaluation_status: str  # "not_started" | "in_progress" | "completed"
    total_score: Optional[float] = None
    evaluation_id: Optional[int] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JudgeDashboardStatsOut(BaseModel):
    completed_evaluations: int = 0
    pending_evaluations: int = 0
    total_assigned_submissions: int = 0
    average_score_given: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class JudgeUpcomingDeadlineOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    judging_end: Optional[datetime] = None
    days_remaining: int = 0
    pending_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class JudgeDashboardOverviewOut(BaseModel):
    judge_id: int
    judge_name: str
    expertise: Optional[str] = None
    stats: JudgeDashboardStatsOut
    assigned_hackathons: List[JudgeAssignedHackathonOut] = []
    submissions_queue: List[JudgeSubmissionQueueItemOut] = []
    upcoming_deadlines: List[JudgeUpcomingDeadlineOut] = []

    model_config = ConfigDict(from_attributes=True)
