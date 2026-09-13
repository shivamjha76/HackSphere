import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, get_db, check_db_connection
from app.db.base_class import Base, TimestampMixin
from fastapi.testclient import TestClient
from app.main import app


def test_db_connection():
    """Verify that database is reachable."""
    assert check_db_connection() is True


def test_session_execute():
    """Verify executing raw query with SessionLocal."""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT 1")).scalar()
        assert result == 1
    finally:
        db.close()


def test_get_db_generator():
    """Verify FastAPI dependency get_db yields session and closes properly."""
    gen = get_db()
    session = next(gen)
    assert isinstance(session, Session)
    assert session.is_active is True
    with pytest.raises(StopIteration):
        next(gen)


def test_base_tablename_convention():
    """Verify that Base automatically generates snake_case plural table names."""
    class DummyItem(Base):
        __table_args__ = {"extend_existing": True}
        from sqlalchemy.orm import Mapped, mapped_column
        id: Mapped[int] = mapped_column(primary_key=True)

    assert DummyItem.__tablename__ == "dummy_items"


def test_health_check_with_db():
    """Verify /api/v1/health reports database as connected."""
    client = TestClient(app)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
