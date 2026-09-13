from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base, TimestampMixin


class HackathonJudge(Base):
    """
    Appointed judges for a specific hackathon.
    """
    __tablename__ = "hackathon_judges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expertise: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="judges")
    user: Mapped["User"] = relationship("User")
    assignments: Mapped[List["JudgeAssignment"]] = relationship(
        "JudgeAssignment", back_populates="judge", cascade="all, delete-orphan"
    )
    evaluations: Mapped[List["Evaluation"]] = relationship(
        "Evaluation", back_populates="judge", cascade="all, delete-orphan"
    )


class JudgeAssignment(Base):
    """
    Mapping between judges and specific teams (Hybrid assignment engine).
    """
    __tablename__ = "judge_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    judge_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathon_judges.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(50), default="assigned", nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon")
    judge: Mapped["HackathonJudge"] = relationship("HackathonJudge", back_populates="assignments")
    team: Mapped["Team"] = relationship("Team", back_populates="judge_assignments")


class EvaluationCriteria(Base):
    """
    Customizable evaluation rubric criteria (e.g. Innovation, Technical, UI/UX, Presentation).
    """
    __tablename__ = "evaluation_criteria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hackathon_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    max_score: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="evaluation_criteria")
    scores: Mapped[List["EvaluationScore"]] = relationship(
        "EvaluationScore", back_populates="criterion", cascade="all, delete-orphan"
    )


class Evaluation(Base, TimestampMixin):
    """
    Submitted judge evaluation for a team submission.
    Includes outlier/anomaly detection review flag.
    """
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assignment_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("judge_assignments.id", ondelete="SET NULL"), nullable=True
    )
    judge_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hackathon_judges.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    total_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Anomaly Detection & Dispute Flag
    is_flagged_for_review: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    flag_reason: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="submitted", nullable=False)

    # Relationships
    judge: Mapped["HackathonJudge"] = relationship("HackathonJudge", back_populates="evaluations")
    submission: Mapped["Submission"] = relationship("Submission", back_populates="evaluations")
    scores: Mapped[List["EvaluationScore"]] = relationship(
        "EvaluationScore", back_populates="evaluation", cascade="all, delete-orphan"
    )


class EvaluationScore(Base):
    """
    Score breakdown per rubric criterion.
    """
    __tablename__ = "evaluation_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    evaluation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    criterion_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("evaluation_criteria.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="scores")
    criterion: Mapped["EvaluationCriteria"] = relationship("EvaluationCriteria", back_populates="scores")
