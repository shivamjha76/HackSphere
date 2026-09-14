from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class JudgeInvitePayload(BaseModel):
    email: str
    expertise: Optional[str] = "General Technical Evaluation"


class AutoDistributePayload(BaseModel):
    reviews_per_team: int = 3
    strategy: str = "round_robin"  # "round_robin" | "balanced"


class ManualAssignmentPayload(BaseModel):
    judge_id: int
    team_id: int


class JudgeAssignmentItemOut(BaseModel):
    id: int
    judge_id: int
    judge_name: str
    team_id: int
    team_name: str
    status: str
    assigned_at: datetime
    is_evaluated: bool = False


class AppointedJudgeOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    expertise: Optional[str] = None
    status: str
    assigned_at: datetime
    assigned_teams_count: int = 0
    completed_evaluations_count: int = 0
    completion_percentage: float = 0.0


class HackathonJudgesOverviewOut(BaseModel):
    hackathon_id: int
    hackathon_slug: str
    hackathon_title: str
    total_judges: int = 0
    total_teams: int = 0
    total_assignments: int = 0
    completed_assignments: int = 0
    overall_progress_percentage: float = 0.0
    judges: List[AppointedJudgeOut] = []
    assignments: List[JudgeAssignmentItemOut] = []
