import pytest
from sqlalchemy import select
from app.db.session import SessionLocal
from app.core.security import verify_password
from app.models import (
    User,
    Role,
    Organization,
    Hackathon,
    Team,
    Submission,
    Evaluation,
    Certificate,
)


@pytest.fixture(scope="module")
def session():
    db = SessionLocal()
    yield db
    db.close()


def test_seed_roles_and_users(session):
    """Verify default roles and seeded user accounts."""
    roles = session.execute(select(Role)).scalars().all()
    role_names = [r.name for r in roles]
    assert "super_admin" in role_names
    assert "organizer" in role_names
    assert "participant" in role_names
    assert "judge" in role_names

    shivam = session.execute(select(User).filter_by(email="shivam@example.com")).scalar_one()
    assert shivam.full_name == "Shivam Jha"
    assert shivam.xp >= 1250
    assert shivam.level >= 3
    assert verify_password("UserPass123!", shivam.hashed_password) is True

    rohan = session.execute(select(User).filter_by(email="rohan.mehta@judge.com")).scalar_one()
    assert rohan.full_name == "Rohan Mehta"
    assert verify_password("JudgePass123!", rohan.hashed_password) is True


def test_seed_organization(session):
    """Verify TechNova Labs organization workspace."""
    org = session.execute(select(Organization).filter_by(slug="technova-labs")).scalar_one()
    assert org.name == "TechNova Labs"
    assert org.is_verified is True
    assert len(org.members) >= 1
    assert org.members[0].role == "owner"


def test_seed_hackathons_and_rubrics(session):
    """Verify hackathons and evaluation rubrics."""
    ai_hack = session.execute(select(Hackathon).filter_by(slug="ai-hack-summit-2026")).scalar_one()
    assert ai_hack.mode == "online"
    assert len(ai_hack.evaluation_criteria) == 6
    total_rubric_max = sum(c.max_score for c in ai_hack.evaluation_criteria)
    assert total_rubric_max == 100


def test_seed_submission_and_evaluation(session):
    """Verify submission and judge evaluation scores."""
    team = session.execute(select(Team).filter_by(invite_code="CODE-CRAFT-26")).scalar_one()
    assert team.name == "CodeCrafters"
    assert len(team.members) == 3

    sub = session.execute(select(Submission).filter_by(team_id=team.id)).scalar_one()
    assert sub.project_title == "SmartAssist AI"
    assert sub.version == 1

    evaluation = session.execute(select(Evaluation).filter_by(submission_id=sub.id)).scalar_one()
    assert evaluation.total_score == 91.0
    assert len(evaluation.scores) == 6
    total_calculated = sum(s.score for s in evaluation.scores)
    assert total_calculated == 91.0


def test_seed_certificate(session):
    """Verify issued certificate."""
    cert = session.execute(select(Certificate).filter_by(certificate_code="HS-2026-WINNER-001")).scalar_one()
    assert cert.recipient_name == "Shivam Jha"
    assert cert.is_valid is True
    assert "verify" in cert.qr_verification_url
