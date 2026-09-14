"""Central models registry for HackSphere."""
from app.db.base_class import Base, TimestampMixin
from app.models.user import User, Role, UserRole
from app.models.organization import Organization, OrganizationMember
from app.models.hackathon import Hackathon, HackathonRegistration
from app.models.team import Team, TeamMember
from app.models.submission import Submission
from app.models.judging import (
    HackathonJudge,
    JudgeAssignment,
    EvaluationCriteria,
    Evaluation,
    EvaluationScore,
)
from app.models.certificate import Certificate
from app.models.announcement import Announcement

__all__ = [
    "Base",
    "TimestampMixin",
    "User",
    "Role",
    "UserRole",
    "Organization",
    "OrganizationMember",
    "Hackathon",
    "HackathonRegistration",
    "Team",
    "TeamMember",
    "Submission",
    "HackathonJudge",
    "JudgeAssignment",
    "EvaluationCriteria",
    "Evaluation",
    "EvaluationScore",
    "Certificate",
    "Announcement",
]
