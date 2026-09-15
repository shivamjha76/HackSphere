from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class CertificateTemplate(Base, TimestampMixin):
    """
    Configurable certificate templates for hackathon winners, special mentions,
    and verified participants per Roadmap Chapter 24 and UI Screen #53.
    """
    __tablename__ = "certificate_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    template_type: Mapped[str] = mapped_column(
        String(50), default="winner", nullable=False
    )  # "winner", "special_mention", "participation", "judge"
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    target_audience: Mapped[str] = mapped_column(
        String(200), default="Winners (1st, 2nd, 3rd Place)", nullable=False
    )
    title_text: Mapped[str] = mapped_column(
        String(200), default="Certificate of Excellence", nullable=False
    )
    subtitle_text: Mapped[Optional[str]] = mapped_column(
        String(300),
        default="In recognition of outstanding technical innovation and podium finish",
        nullable=True,
    )
    issuer_name: Mapped[str] = mapped_column(
        String(200), default="TechNova Labs Organizing Committee", nullable=False
    )
    signatory_name: Mapped[str] = mapped_column(
        String(150), default="Dr. Sarah Jenkins", nullable=False
    )
    signatory_title: Mapped[str] = mapped_column(
        String(150), default="Lead Judge & Director of AI", nullable=False
    )
    badge_text: Mapped[str] = mapped_column(
        String(50), default="CERTIFICATE", nullable=False
    )
    theme: Mapped[str] = mapped_column(
        String(50), default="gold", nullable=False
    )  # "gold", "emerald", "blue", "purple"
    is_default: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon")
    certificates: Mapped[list["Certificate"]] = relationship(
        "Certificate", back_populates="template"
    )
