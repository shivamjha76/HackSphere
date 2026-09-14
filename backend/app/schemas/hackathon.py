from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class OrganizationBriefOut(BaseModel):
    id: int
    name: str
    slug: str
    logo_url: Optional[str] = None
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class EvaluationCriterionBriefOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    max_score: int = 20
    weight: float = 1.0

    model_config = ConfigDict(from_attributes=True)


class JudgeBriefOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    avatar_url: Optional[str] = None
    expertise: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HackathonOut(BaseModel):
    id: int
    organization_id: int
    title: str
    slug: str
    tagline: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    banner_url: Optional[str] = None
    logo_url: Optional[str] = None
    theme: Optional[str] = None

    mode: str
    status: str
    visibility: str

    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_end: Optional[datetime] = None
    result_date: Optional[datetime] = None

    min_team_size: int = 1
    max_team_size: int = 4
    max_participants: Optional[int] = None
    prize_pool_summary: Optional[str] = None

    participant_count: int = 0
    organization: Optional[OrganizationBriefOut] = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HackathonDetailOut(HackathonOut):
    rules: Optional[str] = None
    eligibility: Optional[str] = None
    judging_start: Optional[datetime] = None
    judging_end: Optional[datetime] = None
    evaluation_criteria: List[EvaluationCriterionBriefOut] = []
    judges: List[JudgeBriefOut] = []
    teams_count: int = 0
    is_user_registered: bool = False


class HackathonRegistrationOut(BaseModel):
    id: int
    hackathon_id: int
    user_id: int
    status: str
    registered_at: datetime
    xp_awarded: int = 50
    message: str = "Successfully registered for hackathon"

    model_config = ConfigDict(from_attributes=True)


class RegistrationStatusOut(BaseModel):
    is_registered: bool
    registration_id: Optional[int] = None


class CriterionCreatePayload(BaseModel):
    name: str
    description: Optional[str] = None
    max_score: int = 20
    weight: float = 1.0


class HackathonCreatePayload(BaseModel):
    title: str
    slug: Optional[str] = None
    tagline: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    theme: Optional[str] = None
    mode: str = "online"  # "online" | "in_person" | "hybrid"
    status: str = "draft"  # "draft" | "published" | "live"
    visibility: str = "public"
    min_team_size: int = 1
    max_team_size: int = 4
    max_participants: Optional[int] = None
    prize_pool_summary: Optional[str] = None
    rules: Optional[str] = None
    eligibility: Optional[str] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    submission_start: Optional[datetime] = None
    submission_end: Optional[datetime] = None
    judging_start: Optional[datetime] = None
    judging_end: Optional[datetime] = None
    result_date: Optional[datetime] = None
    criteria: Optional[List[CriterionCreatePayload]] = None
