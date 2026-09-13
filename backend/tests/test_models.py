import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.models import (
    User,
    Role,
    UserRole,
    Organization,
    OrganizationMember,
    Hackathon,
    HackathonRegistration,
    Team,
    TeamMember,
    Submission,
    HackathonJudge,
    JudgeAssignment,
    EvaluationCriteria,
    Evaluation,
    EvaluationScore,
    Certificate,
)


@pytest.fixture(scope="module")
def db_session():
    """Create fresh in-memory tables and yield session."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_user_and_multi_role(db_session):
    """Verify user creation and multiple roles assignment."""
    user = User(
        email="rahul@example.com",
        hashed_password="hashed_secret_123",
        full_name="Rahul Sharma",
        phone="+919876543210",
        xp=150,
        level=2,
    )
    role_participant = Role(name="participant", description="Hackathon Participant")
    role_judge = Role(name="judge", description="Hackathon Judge")
    
    db_session.add_all([user, role_participant, role_judge])
    db_session.commit()

    ur1 = UserRole(user_id=user.id, role_id=role_participant.id)
    ur2 = UserRole(user_id=user.id, role_id=role_judge.id)
    db_session.add_all([ur1, ur2])
    db_session.commit()

    db_session.refresh(user)
    assert len(user.user_roles) == 2
    assert user.email == "rahul@example.com"
    assert user.level == 2


def test_organization_and_hackathon_hierarchy(db_session):
    """Verify organization workspace, membership, and hackathon creation."""
    user = db_session.execute(select(User).filter_by(email="rahul@example.com")).scalar_one()

    org = Organization(
        name="TechNova Labs",
        slug="technova-labs",
        org_type="company",
        country="India",
        created_by_user_id=user.id,
    )
    db_session.add(org)
    db_session.commit()

    member = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role="owner",
    )
    db_session.add(member)
    db_session.commit()

    now = datetime.now(timezone.utc)
    hackathon = Hackathon(
        organization_id=org.id,
        title="AI Hack Summit 2026",
        slug="ai-hack-summit-2026",
        mode="online",
        status="published",
        visibility="public",
        registration_start=now,
        registration_end=now + timedelta(days=7),
        event_start=now + timedelta(days=8),
        event_end=now + timedelta(days=10),
        min_team_size=2,
        max_team_size=4,
        created_by_user_id=user.id,
    )
    db_session.add(hackathon)
    db_session.commit()

    assert hackathon.id is not None
    assert hackathon.organization.name == "TechNova Labs"


def test_team_registration_and_submission(db_session):
    """Verify team formation, registration, and versioned submission."""
    hackathon = db_session.execute(select(Hackathon).filter_by(slug="ai-hack-summit-2026")).scalar_one()
    user = db_session.execute(select(User).filter_by(email="rahul@example.com")).scalar_one()

    # Register participant
    reg = HackathonRegistration(hackathon_id=hackathon.id, user_id=user.id)
    db_session.add(reg)
    db_session.commit()

    # Form team
    team = Team(
        hackathon_id=hackathon.id,
        name="CodeCrafters",
        invite_code="CODE-1234",
        track="AI",
        is_frozen=False,
        created_by_user_id=user.id,
    )
    db_session.add(team)
    db_session.commit()

    team_member = TeamMember(
        team_id=team.id,
        user_id=user.id,
        role="leader",
        status="active",
    )
    db_session.add(team_member)
    db_session.commit()

    # Submit project deliverables (version 1)
    submission = Submission(
        team_id=team.id,
        hackathon_id=hackathon.id,
        project_title="SmartAssist AI",
        tagline="AI-powered task assistant",
        github_url="https://github.com/shivamjha76/smart-assist",
        live_demo_url="https://smartassist.demo",
        version=1,
        is_final=True,
        is_locked=False,
    )
    db_session.add(submission)
    db_session.commit()

    assert submission.id is not None
    assert submission.team.name == "CodeCrafters"
    assert submission.version == 1


def test_judging_evaluation_and_scores(db_session):
    """Verify criteria, judge assignment, evaluation, and rubrics score breakdown."""
    hackathon = db_session.execute(select(Hackathon).filter_by(slug="ai-hack-summit-2026")).scalar_one()
    team = db_session.execute(select(Team).filter_by(name="CodeCrafters")).scalar_one()
    submission = db_session.execute(select(Submission).filter_by(team_id=team.id)).scalar_one()
    user = db_session.execute(select(User).filter_by(email="rahul@example.com")).scalar_one()

    # Add Rubric Criterion
    crit_innovation = EvaluationCriteria(
        hackathon_id=hackathon.id,
        name="Innovation",
        max_score=20,
        weight=1.0,
    )
    crit_tech = EvaluationCriteria(
        hackathon_id=hackathon.id,
        name="Technical Implementation",
        max_score=30,
        weight=1.0,
    )
    db_session.add_all([crit_innovation, crit_tech])
    db_session.commit()

    # Assign Judge
    judge = HackathonJudge(
        hackathon_id=hackathon.id,
        user_id=user.id,
        expertise="AI / Machine Learning",
    )
    db_session.add(judge)
    db_session.commit()

    assignment = JudgeAssignment(
        hackathon_id=hackathon.id,
        judge_id=judge.id,
        team_id=team.id,
        status="assigned",
    )
    db_session.add(assignment)
    db_session.commit()

    # Submit Evaluation
    evaluation = Evaluation(
        assignment_id=assignment.id,
        judge_id=judge.id,
        submission_id=submission.id,
        total_score=45.0,
        feedback="Great architecture and clean code implementation.",
        is_flagged_for_review=False,
        status="submitted",
    )
    db_session.add(evaluation)
    db_session.commit()

    score1 = EvaluationScore(
        evaluation_id=evaluation.id,
        criterion_id=crit_innovation.id,
        score=18.0,
    )
    score2 = EvaluationScore(
        evaluation_id=evaluation.id,
        criterion_id=crit_tech.id,
        score=27.0,
    )
    db_session.add_all([score1, score2])
    db_session.commit()

    db_session.refresh(evaluation)
    assert len(evaluation.scores) == 2
    assert sum(s.score for s in evaluation.scores) == 45.0


def test_certificate_issuance_and_verification(db_session):
    """Verify issuing verifiable certificate with unique code."""
    hackathon = db_session.execute(select(Hackathon).filter_by(slug="ai-hack-summit-2026")).scalar_one()
    user = db_session.execute(select(User).filter_by(email="rahul@example.com")).scalar_one()
    team = db_session.execute(select(Team).filter_by(name="CodeCrafters")).scalar_one()

    cert = Certificate(
        certificate_code="HS-2026-WINNER-001",
        hackathon_id=hackathon.id,
        user_id=user.id,
        team_id=team.id,
        certificate_type="winner",
        title="1st Place - AI Hack Summit 2026",
        recipient_name="Rahul Sharma",
        qr_verification_url="https://hacksphere.dev/verify/HS-2026-WINNER-001",
        is_valid=True,
    )
    db_session.add(cert)
    db_session.commit()

    saved_cert = db_session.execute(
        select(Certificate).filter_by(certificate_code="HS-2026-WINNER-001")
    ).scalar_one()
    assert saved_cert.recipient_name == "Rahul Sharma"
    assert saved_cert.is_valid is True
    assert saved_cert.hackathon.title == "AI Hack Summit 2026"
