from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class Announcement(Base, TimestampMixin):
    """
    Hackathon broadcast announcement entity for communicating updates,
    timeline changes, results, and critical alerts to participants and judges.
    """
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    organization_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Priority levels: 'normal', 'important', 'urgent'
    priority: Mapped[str] = mapped_column(String(50), default="normal", nullable=False, index=True)

    # Status: 'published', 'scheduled', 'draft'
    status: Mapped[str] = mapped_column(String(50), default="published", nullable=False, index=True)

    # Target audience: 'all', 'participants', 'judges', 'team_leaders'
    target_audience: Mapped[str] = mapped_column(String(50), default="all", nullable=False)

    # Highlight and float to top of feeds
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Future scheduled publication timestamp
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Impression tracking
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="announcements")
    organization: Mapped["Organization"] = relationship("Organization")
    author: Mapped[Optional["User"]] = relationship("User")
