from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class Certificate(Base, TimestampMixin):
    """
    Automated certificates issued to participants, winners, and judges.
    Contains unique verification code and public validation link.
    """
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    certificate_code: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    certificate_type: Mapped[str] = mapped_column(
        String(50), default="participation", nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    recipient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    qr_verification_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="certificates")
    user: Mapped["User"] = relationship("User", back_populates="certificates")
    team: Mapped[Optional["Team"]] = relationship("Team")
