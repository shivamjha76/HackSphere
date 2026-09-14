from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    content: str = Field(..., min_length=2)
    priority: str = Field(default="normal", pattern="^(normal|important|urgent)$")
    status: str = Field(default="published", pattern="^(published|scheduled|draft)$")
    target_audience: str = Field(default="all", pattern="^(all|participants|judges|team_leaders)$")
    is_pinned: bool = False
    scheduled_for: Optional[datetime] = None


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    content: Optional[str] = Field(None, min_length=2)
    priority: Optional[str] = Field(None, pattern="^(normal|important|urgent)$")
    status: Optional[str] = Field(None, pattern="^(published|scheduled|draft)$")
    target_audience: Optional[str] = Field(None, pattern="^(all|participants|judges|team_leaders)$")
    is_pinned: Optional[bool] = None
    scheduled_for: Optional[datetime] = None


class AnnouncementAuthorBrief(BaseModel):
    id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AnnouncementOut(BaseModel):
    id: int
    hackathon_id: int
    organization_id: int
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    author: Optional[AnnouncementAuthorBrief] = None
    title: str
    content: str
    priority: str
    status: str
    target_audience: str
    is_pinned: bool
    scheduled_for: Optional[datetime] = None
    views_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AnnouncementStatsOut(BaseModel):
    total_announcements: int
    published_count: int
    scheduled_count: int
    draft_count: int
    total_views: int
    published_percentage: float
    scheduled_percentage: float
