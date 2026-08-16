from sqlalchemy import ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class JudgeScore(Base):
    __tablename__ = "judge_scores"

    id: Mapped[int] = mapped_column(primary_key=True)

    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.id"),
        nullable=False
    )

    judge_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    innovation: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    technical_execution: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    impact: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    presentation: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "submission_id",
            "judge_id",
            name="uq_submission_judge_score"
        ),
    )