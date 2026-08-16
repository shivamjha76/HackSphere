from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)

    hackathon_id: Mapped[int] = mapped_column(
        ForeignKey("hackathons.id"),
        nullable=False
    )

    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    github_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    demo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="submitted",
        nullable=False
    )