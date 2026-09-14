from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class PhaseTransitionPayload(BaseModel):
    phase: str  # "draft" | "published" | "registration" | "hacking" | "submission_closed" | "judging" | "completed"
    override_reason: Optional[str] = None


class SubmissionModerationPayload(BaseModel):
    status: str  # "submitted" | "flagged" | "disqualified"
    notes: Optional[str] = None


class ManagedSubmissionItemOut(BaseModel):
    id: int
    team_id: int
    team_name: str
    team_members_count: int
    project_title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    video_url: Optional[str] = None
    presentation_url: Optional[str] = None
    attachment_url: Optional[str] = None
    version: int
    is_locked: bool
    status: str
    submitted_at: datetime
    evaluations_count: int = 0
    average_score: Optional[float] = None


class HackathonManagementDetailOut(BaseModel):
    id: int
    slug: str
    title: str
    tagline: Optional[str] = None
    status: str
    mode: str
    theme: Optional[str] = None
    min_team_size: int
    max_team_size: int
    prize_pool_summary: Optional[str] = None
    
    # Milestone dates
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_end: Optional[datetime] = None
    judging_start: Optional[datetime] = None
    judging_end: Optional[datetime] = None
    result_date: Optional[datetime] = None

    # Aggregated metrics
    total_registered: int = 0
    total_teams: int = 0
    total_submissions: int = 0
    locked_submissions_count: int = 0
    flagged_submissions_count: int = 0
    average_evaluations_per_submission: float = 0.0

    # Submissions
    submissions: List[ManagedSubmissionItemOut] = []
