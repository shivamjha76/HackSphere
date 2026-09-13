from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class Submission(Base, TimestampMixin):
    """
    Project deliverables submitted by teams.
    Supports versioning (v1, v2, v3) and submission locking at deadlines.
    """
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    project_title: Mapped[str] = mapped_column(String(200), nullable=False)
    tagline: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Deliverables & URLs
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    live_demo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    presentation_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Versioning & Locking
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_final: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="submitted", nullable=False)

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="submissions")
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="submissions")
    evaluations: Mapped[List["Evaluation"]] = relationship(
        "Evaluation", back_populates="submission", cascade="all, delete-orphan"
    )
