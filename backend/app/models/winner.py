from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class HackathonWinner(Base, TimestampMixin):
    """
    Hackathon podium placement and award entity per Chapter 19.
    Tracks 1st, 2nd, 3rd place winners and track-specific special mentions.
    """
    __tablename__ = "hackathon_winners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Podium rank: 1 for Winner, 2 for 1st Runner Up, 3 for 2nd Runner Up, 4+ for Special Mentions
    rank: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    # Award title: e.g. "1st Place Winner", "1st Runner Up", "Best AI Agent Architecture"
    title: Mapped[str] = mapped_column(String(200), nullable=False)

    # Prize amount / goodies: e.g. "₹25,000", "$5,000", "Exclusive Goodies & Swag Kit"
    prize_amount: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Prize category: 'cash', 'in_kind', 'goodies', 'credits'
    prize_type: Mapped[str] = mapped_column(String(50), default="cash", nullable=False)

    # Optional jury citation or reason
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Whether published publicly
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    announced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="winners")
    team: Mapped["Team"] = relationship("Team")
    submission: Mapped[Optional["Submission"]] = relationship("Submission")
