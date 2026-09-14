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


class RubricCriterionItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    max_score: int = 20
    weight: float = 1.0

    model_config = ConfigDict(from_attributes=True)


class EvaluationScoreItem(BaseModel):
    criterion_id: int
    criterion_name: str
    score: float

    model_config = ConfigDict(from_attributes=True)


class ExistingEvaluationOut(BaseModel):
    id: int
    status: str  # "draft" | "submitted"
    total_score: float
    scores: List[EvaluationScoreItem] = []
    feedback: Optional[str] = None
    is_flagged_for_review: bool = False
    flag_reason: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionReviewTeamMemberOut(BaseModel):
    user_id: int
    name: str
    role: str  # "leader" | "member"
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionReviewTeamOut(BaseModel):
    id: int
    name: str
    invite_code: str
    track: Optional[str] = None
    members: List[SubmissionReviewTeamMemberOut] = []

    model_config = ConfigDict(from_attributes=True)


class SubmissionReviewHackathonOut(BaseModel):
    id: int
    title: str
    slug: str
    organization_name: str
    mode: str = "online"
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    judging_end: Optional[datetime] = None
    total_teams: int = 0

    model_config = ConfigDict(from_attributes=True)



class SubmissionReviewDetailOut(BaseModel):
    submission_id: int
    submission_code: str
    project_title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    video_url: Optional[str] = None
    presentation_url: Optional[str] = None
    attachment_url: Optional[str] = None
    submitted_at: datetime
    version: int = 1
    hackathon: SubmissionReviewHackathonOut
    team: SubmissionReviewTeamOut
    rubric_criteria: List[RubricCriterionItem] = []
    existing_evaluation: Optional[ExistingEvaluationOut] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluationScoreInput(BaseModel):
    criterion_id: int
    score: float


class EvaluationSubmitPayload(BaseModel):
    scores: List[EvaluationScoreInput] = []
    feedback: Optional[str] = None
    status: str = "submitted"  # "draft" | "submitted"
    is_flagged_for_review: bool = False
    flag_reason: Optional[str] = None


class EvaluationResultOut(BaseModel):
    evaluation_id: int
    submission_id: int
    judge_id: int
    total_score: float
    status: str
    feedback: Optional[str] = None
    is_flagged_for_review: bool = False
    flag_reason: Optional[str] = None
    scores: List[EvaluationScoreItem] = []
    updated_at: datetime
    message: str

    model_config = ConfigDict(from_attributes=True)


class JudgingRuleItem(BaseModel):
    id: int
    title: str
    description: str


class JudgingDosDonts(BaseModel):
    dos: List[str] = []
    donts: List[str] = []


class JudgingMilestoneDates(BaseModel):
    judging_start: Optional[datetime] = None
    judging_end: Optional[datetime] = None
    feedback_release: Optional[datetime] = None


class JudgingGuidelinesOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    countdown_seconds: int = 0
    rubric_criteria: List[RubricCriterionItem] = []
    total_max_score: int = 100
    rules: List[JudgingRuleItem] = []
    dos_and_donts: JudgingDosDonts
    important_dates: JudgingMilestoneDates
    conflict_of_interest_policy: str

    model_config = ConfigDict(from_attributes=True)


class ConflictOfInterestPayload(BaseModel):
    hackathon_id: int
    team_id: Optional[int] = None
    reason: str
    notes: Optional[str] = None


class ConflictOfInterestOut(BaseModel):
    id: int
    judge_id: int
    hackathon_id: int
    team_id: Optional[int] = None
    status: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class ScoreDistributionBracket(BaseModel):
    label: str  # "80-100", "60-80", "40-60", "Below 40"
    count: int = 0
    percentage: float = 0.0
    color: str = "blue"

    model_config = ConfigDict(from_attributes=True)


class JudgeImpactMetrics(BaseModel):
    evaluations_submitted: int = 0
    consistency_score: float = 100.0
    average_deviation: float = 0.0
    strictness_label: str = "Balanced"  # "Balanced", "Slightly Rigorous", "Generous", "Calibrated"
    agreement_rate: float = 100.0  # Percentage within ±5 points of consensus
    evaluated_sub_ids: List[int] = []

    model_config = ConfigDict(from_attributes=True)


class LeaderboardRankItem(BaseModel):
    rank: int
    team_id: int
    team_name: str
    team_code: str
    submission_id: int
    project_title: str
    tagline: Optional[str] = None
    track: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    evaluations_count: int = 0
    required_evaluations: int = 3
    average_score: float = 0.0
    innovation_score: Optional[float] = None
    technical_score: Optional[float] = None
    presentation_score: Optional[float] = None
    is_flagged_for_review: bool = False
    flag_reason: Optional[str] = None
    current_judge_evaluated: bool = False
    current_judge_score: Optional[float] = None
    current_judge_deviation: Optional[float] = None
    is_winner: bool = False
    winner_rank: Optional[int] = None
    winner_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JudgeLeaderboardOverviewOut(BaseModel):
    hackathon_id: int
    hackathon_title: str
    hackathon_slug: str
    total_teams: int = 0
    scores_published: int = 0
    in_progress_scores: int = 0
    pending_scores: int = 0
    days_remaining: int = 0
    judging_status: str = "in_progress"
    tracks: List[str] = []
    rankings: List[LeaderboardRankItem] = []
    score_distribution: List[ScoreDistributionBracket] = []
    judge_impact: JudgeImpactMetrics

    model_config = ConfigDict(from_attributes=True)



