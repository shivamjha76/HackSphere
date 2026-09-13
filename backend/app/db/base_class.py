import re
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column


def camel_to_snake(name: str) -> str:
    """Convert CamelCase to snake_case."""
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    Automatically derives table name from class name in snake_case.
    """

    @declared_attr.directive
    def __tablename__(cls) -> str:
        # e.g., HackathonJudge -> hackathon_judges, User -> users
        base_name = camel_to_snake(cls.__name__)
        if base_name.endswith("s"):
            return base_name
        return f"{base_name}s"


class TimestampMixin:
    """
    Mixin providing standardized timezone-aware created_at and updated_at fields.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
