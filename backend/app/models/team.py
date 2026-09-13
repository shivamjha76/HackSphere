from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class Team(Base, TimestampMixin):
    """
    Team formed for a specific hackathon.
    Governed by Team Freeze Policy upon registration deadline closure.
    """
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    invite_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    track: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="registered", nullable=False)
    
    # Team Freeze Policy flag (Locks members & leaders at registration close)
    is_frozen: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_by_user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="teams")
    members: Mapped[List["TeamMember"]] = relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan"
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="team", cascade="all, delete-orphan"
    )
    judge_assignments: Mapped[List["JudgeAssignment"]] = relationship(
        "JudgeAssignment", back_populates="team", cascade="all, delete-orphan"
    )


class TeamMember(Base):
    """
    Team membership entity linking users with teams and roles (leader vs member).
    """
    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(50), default="member", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="team_memberships")
