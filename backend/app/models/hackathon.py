from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class Hackathon(Base, TimestampMixin):
    """
    Central Hackathon entity controlling the event lifecycle, rules, and stages.
    """
    __tablename__ = "hackathons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    tagline: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    detailed_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    banner_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    theme: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    mode: Mapped[str] = mapped_column(String(50), default="online", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True)
    visibility: Mapped[str] = mapped_column(String(50), default="public", nullable=False)
    invite_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Automated Timeline Dates
    registration_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    registration_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    event_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    event_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    submission_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    submission_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    judging_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    judging_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    result_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Rules & Quotas
    min_team_size: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_team_size: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_teams: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    prize_pool_summary: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by_user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="hackathons")
    registrations: Mapped[List["HackathonRegistration"]] = relationship(
        "HackathonRegistration", back_populates="hackathon", cascade="all, delete-orphan"
    )
    teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="hackathon", cascade="all, delete-orphan"
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="hackathon", cascade="all, delete-orphan"
    )
    judges: Mapped[List["HackathonJudge"]] = relationship(
        "HackathonJudge", back_populates="hackathon", cascade="all, delete-orphan"
    )
    evaluation_criteria: Mapped[List["EvaluationCriteria"]] = relationship(
        "EvaluationCriteria", back_populates="hackathon", cascade="all, delete-orphan"
    )
    certificates: Mapped[List["Certificate"]] = relationship(
        "Certificate", back_populates="hackathon", cascade="all, delete-orphan"
    )


class HackathonRegistration(Base):
    """
    Individual participant registration for a hackathon.
    """
    __tablename__ = "hackathon_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(50), default="registered", nullable=False)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="registrations")
    user: Mapped["User"] = relationship("User", back_populates="hackathon_registrations")
