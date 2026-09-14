from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrgMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    email: str
    role: str
    joined_at: datetime
    status: str = "active"


class InviteMemberIn(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field("moderator", pattern="^(admin|moderator|viewer)$")


class UpdateMemberRoleIn(BaseModel):
    role: str = Field(..., pattern="^(owner|admin|moderator|viewer)$")


class ActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    user_id: Optional[int] = None
    user_name: str
    action: str
    details: str
    ip_address: str
    created_at: datetime


class ActivityLogsListOut(BaseModel):
    logs: List[ActivityLogOut]
    total_count: int
    page: int
    page_size: int
    available_actions: List[str]


class TeamMembersOverviewOut(BaseModel):
    organization_id: int
    organization_name: str
    is_verified: bool
    members: List[OrgMemberOut]
    total_members: int
    roles_summary: Dict[str, int]
