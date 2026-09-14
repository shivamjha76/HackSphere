from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class WinnerItemCreate(BaseModel):
    team_id: int
    rank: int = Field(..., ge=1)
    title: str = Field(..., min_length=2, max_length=200)
    prize_amount: Optional[str] = None
    prize_type: str = Field(default="cash", pattern="^(cash|in_kind|goodies|credits)$")
    notes: Optional[str] = None


class DeclareWinnersPayload(BaseModel):
    winners: List[WinnerItemCreate]
    auto_issue_certificates: bool = True
    broadcast_announcement: bool = True


class WinnerOut(BaseModel):
    id: int
    hackathon_id: int
    team_id: int
    team_name: str
    rank: int
    title: str
    prize_amount: Optional[str] = None
    prize_type: str
    notes: Optional[str] = None
    submission_id: Optional[int] = None
    project_title: Optional[str] = None
    average_score: Optional[float] = None
    members_count: int = 0
    members: List[str] = []
    is_published: bool = True
    announced_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaderboardEntryOut(BaseModel):
    rank: int
    team_id: int
    team_name: str
    submission_id: int
    project_title: str
    tagline: Optional[str] = None
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    average_score: float
    evaluations_count: int
    is_winner: bool = False
    winner_rank: Optional[int] = None
    winner_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PrizeDistributionItemOut(BaseModel):
    rank: int
    place_title: str
    amount_summary: str
    amount_in_words: str
    prize_type: str
    team_quantity: int
    assigned_team_name: Optional[str] = None


class PrizePoolOverviewOut(BaseModel):
    total_prize_pool_summary: str
    total_winners_count: int
    prizes: List[PrizeDistributionItemOut]


class BulkCertificateIssuePayload(BaseModel):
    certificate_type: str = Field(default="all", pattern="^(all|winner|participation)$")


class BulkCertificateIssueResult(BaseModel):
    issued_count: int
    skipped_count: int
    total_certificates: int
    details: str


class WinnersDashboardOverviewOut(BaseModel):
    hackathon_id: int
    hackathon_slug: str
    hackathon_title: str
    status: str
    is_completed: bool
    total_submissions: int
    total_evaluated: int
    winners: List[WinnerOut]
    prizes_overview: PrizePoolOverviewOut

    model_config = ConfigDict(from_attributes=True)
