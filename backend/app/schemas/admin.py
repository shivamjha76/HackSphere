from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AdminMetricCardOut(BaseModel):
    key: str
    title: str
    value: str
    delta_percent: float
    is_positive: bool
    delta_label: str
    icon: str


class PlatformDailyPointOut(BaseModel):
    date_label: str
    users_count: int
    hackathons_count: int


class RoleDistributionItemOut(BaseModel):
    role_name: str
    count: int
    percentage: float
    color: str


class AdminActivityItemOut(BaseModel):
    id: int
    action: str
    title: str
    details: Optional[str] = None
    timestamp_human: str
    created_at: Optional[datetime] = None
    category: str  # org, hackathon, user, submission, moderation


class AdminRecentOrgOut(BaseModel):
    id: int
    name: str
    slug: str
    official_email: Optional[str] = None
    members_count: int
    hackathons_count: int
    status: str
    is_verified: bool
    created_at_human: str


class AdminOngoingHackathonOut(BaseModel):
    id: int
    title: str
    slug: str
    date_range: str
    status: str
    teams_count: int
    participants_count: int
    mode: str


class AdminPendingQueueItemOut(BaseModel):
    id: int
    category: str  # organization, hackathon, report, judge
    title: str
    requested_by: str
    details: str
    date_human: str
    status: str


class AdminPendingActionsOut(BaseModel):
    orgs_awaiting_approval_count: int
    hackathons_approval_count: int
    reported_issues_count: int
    judge_applications_count: int
    items: List[AdminPendingQueueItemOut]


class AdminPlatformHealthOut(BaseModel):
    latency_ms: int
    uptime_percent: float
    status_message: str
    core_api_status: str
    database_status: str
    cache_status: str
    storage_status: str


class SuperAdminDashboardOut(BaseModel):
    stats: List[AdminMetricCardOut]
    daily_metrics: List[PlatformDailyPointOut]
    total_7d_activity: int
    total_7d_delta: float
    role_distribution: List[RoleDistributionItemOut]
    total_users_count: int
    recent_activities: List[AdminActivityItemOut]
    recent_organizations: List[AdminRecentOrgOut]
    ongoing_hackathons: List[AdminOngoingHackathonOut]
    pending_actions: AdminPendingActionsOut
    platform_health: AdminPlatformHealthOut


# Governance Actions Payloads
class ApproveOrganizationIn(BaseModel):
    is_verified: bool = True
    notes: Optional[str] = None


class ApproveHackathonIn(BaseModel):
    status: str = "published"
    notes: Optional[str] = None


class ResolveReportedIssueIn(BaseModel):
    status: str  # resolved, dismissed
    resolution_notes: str


class UpdateUserStatusIn(BaseModel):
    is_active: bool
    reason: Optional[str] = None
