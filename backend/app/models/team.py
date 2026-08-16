from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True)

    hackathon_id: Mapped[int] = mapped_column(
        ForeignKey("hackathons.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    leader_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    max_members: Mapped[int] = mapped_column(
        nullable=False,
        default=4
    )