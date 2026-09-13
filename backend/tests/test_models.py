import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
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


def test_user_and_multi_role(db):
    """Verify user creation and multiple roles assignment."""
    user = User(
        email="rahul.test@example.com",
        hashed_password="hashed_secret_123",
        full_name="Rahul Sharma",
        phone="+919876543210",
        xp=150,
        level=2,
    )
    role_participant = Role(name="role_p", description="Hackathon Participant")
    role_judge = Role(name="role_j", description="Hackathon Judge")
    
    db.add_all([user, role_participant, role_judge])
    db.commit()

    ur1 = UserRole(user_id=user.id, role_id=role_participant.id)
    ur2 = UserRole(user_id=user.id, role_id=role_judge.id)
    db.add_all([ur1, ur2])
    db.commit()

    db.refresh(user)
    assert len(user.user_roles) == 2
    assert user.email == "rahul.test@example.com"
    assert user.level == 2


def test_organization_and_hackathon_hierarchy(db):
    """Verify organization workspace, membership, and hackathon creation."""
    user = User(
        email="org.owner@example.com",
        hashed_password="pwd",
        full_name="Org Owner",
    )
    db.add(user)
    db.commit()

    org = Organization(
        name="TechNova Labs Test",
        slug="technova-labs-test",
        org_type="company",
        country="India",
        created_by_user_id=user.id,
    )
    db.add(org)
    db.commit()

    member = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role="owner",
    )
    db.add(member)
    db.commit()

    now = datetime.now(timezone.utc)
    hackathon = Hackathon(
        organization_id=org.id,
        title="AI Hack Summit Test",
        slug="ai-hack-summit-test",
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
    db.add(hackathon)
    db.commit()

    assert hackathon.id is not None
    assert hackathon.organization.name == "TechNova Labs Test"


def test_team_registration_and_submission(db):
    """Verify team formation, registration, and versioned submission."""
    user = User(email="coder@example.com", hashed_password="pwd", full_name="Coder")
    org = Organization(name="Test Org", slug="test-org")
    db.add_all([user, org])
    db.commit()

    hackathon = Hackathon(
        organization_id=org.id,
        title="Hackathon Alpha",
        slug="hackathon-alpha",
        min_team_size=1,
        max_team_size=4,
    )
    db.add(hackathon)
    db.commit()

    # Register participant
    reg = HackathonRegistration(hackathon_id=hackathon.id, user_id=user.id)
    db.add(reg)
    db.commit()

    # Form team
    team = Team(
        hackathon_id=hackathon.id,
        name="Team Alpha",
        invite_code="ALPHA-123",
        track="AI",
        is_frozen=False,
        created_by_user_id=user.id,
    )
    db.add(team)
    db.commit()

    team_member = TeamMember(
        team_id=team.id,
        user_id=user.id,
        role="leader",
        status="active",
    )
    db.add(team_member)
    db.commit()

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
    db.add(submission)
    db.commit()

    assert submission.id is not None
    assert submission.team.name == "Team Alpha"
    assert submission.version == 1


def test_judging_evaluation_and_scores(db):
    """Verify criteria, judge assignment, evaluation, and rubrics score breakdown."""
    user = User(email="judge.test@example.com", hashed_password="pwd", full_name="Judge")
    org = Organization(name="Org X", slug="org-x")
    db.add_all([user, org])
    db.commit()

    hackathon = Hackathon(organization_id=org.id, title="Hack B", slug="hack-b")
    db.add(hackathon)
    db.commit()

    team = Team(hackathon_id=hackathon.id, name="Team B", invite_code="TEAM-B")
    db.add(team)
    db.commit()

    submission = Submission(
        team_id=team.id,
        hackathon_id=hackathon.id,
        project_title="Project B",
        version=1,
    )
    db.add(submission)
    db.commit()

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
    db.add_all([crit_innovation, crit_tech])
    db.commit()

    # Assign Judge
    judge = HackathonJudge(
        hackathon_id=hackathon.id,
        user_id=user.id,
        expertise="AI / Machine Learning",
    )
    db.add(judge)
    db.commit()

    assignment = JudgeAssignment(
        hackathon_id=hackathon.id,
        judge_id=judge.id,
        team_id=team.id,
        status="assigned",
    )
    db.add(assignment)
    db.commit()

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
    db.add(evaluation)
    db.commit()

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
    db.add_all([score1, score2])
    db.commit()

    db.refresh(evaluation)
    assert len(evaluation.scores) == 2
    assert sum(s.score for s in evaluation.scores) == 45.0


def test_certificate_issuance_and_verification(db):
    """Verify issuing verifiable certificate with unique code."""
    user = User(email="winner@example.com", hashed_password="pwd", full_name="Winner User")
    org = Organization(name="Cert Org", slug="cert-org")
    db.add_all([user, org])
    db.commit()

    hackathon = Hackathon(organization_id=org.id, title="Cert Hackathon", slug="cert-hackathon")
    db.add(hackathon)
    db.commit()

    team = Team(hackathon_id=hackathon.id, name="Cert Team", invite_code="CERT-TEAM")
    db.add(team)
    db.commit()

    cert = Certificate(
        certificate_code="HS-TEST-CERT-001",
        hackathon_id=hackathon.id,
        user_id=user.id,
        team_id=team.id,
        certificate_type="winner",
        title="1st Place Winner",
        recipient_name="Winner User",
        qr_verification_url="https://hacksphere.dev/verify/HS-TEST-CERT-001",
        is_valid=True,
    )
    db.add(cert)
    db.commit()

    saved_cert = db.execute(
        select(Certificate).filter_by(certificate_code="HS-TEST-CERT-001")
    ).scalar_one()
    assert saved_cert.recipient_name == "Winner User"
    assert saved_cert.is_valid is True
    assert saved_cert.hackathon.title == "Cert Hackathon"
