from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import (
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
)


DATABASE_URL = (
    f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}"
    f"@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
)


engine = create_engine(DATABASE_URL)


class Base(DeclarativeBase):
    pass