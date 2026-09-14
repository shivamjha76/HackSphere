from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.hackathon import HackathonOut


class OrganizationMemberBriefOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationListItemOut(BaseModel):
    id: int
    name: str
    slug: str
    org_type: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    country: str
    city: Optional[str] = None
    is_verified: bool = False
    hackathons_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationProfileOut(BaseModel):
    id: int
    name: str
    slug: str
    org_type: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    official_email: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    country: str
    state: Optional[str] = None
    city: Optional[str] = None
    is_verified: bool = False

    hackathons_count: int = 0
    total_participants_reached: int = 0
    active_hackathons: List[HackathonOut] = []
    past_hackathons: List[HackathonOut] = []
    members: List[OrganizationMemberBriefOut] = []

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
