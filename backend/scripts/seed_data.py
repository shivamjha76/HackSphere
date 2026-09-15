"""
HackSphere Standalone Database Seeding & Demo Harness
Initializes database schema and populates production-like demo fixtures
for all 4 platform roles (Participant, Organizer, Judge, SuperAdmin).
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure backend directory is in python search path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app.models import (
    User,
    Role,
    UserRole,
    Organization,
    OrganizationMember,
    Hackathon,
    EvaluationCriteria,
    Team,
    TeamMember,
    Submission,
    JudgeAssignment,
    Evaluation,
    EvaluationScore,
    Certificate,
    Announcement,
    ModerationReport,
    ActivityLog,
)


def seed_database():
    print("=" * 70)
    print("HackSphere Database Seed & Demo Harness")
    print("=" * 70)

    # 1. Create all database tables
    print("[1/8] Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 2. Seed Roles
        print("[2/8] Seeding core platform roles...")
        role_specs = [
            ("super_admin", "Global Platform SuperAdmin with governance and moderation authority"),
            ("organizer", "Tournament Organizer with hackathon and organization management"),
            ("judge", "Domain Specialist Judge with rubric grading capabilities"),
            ("participant", "Hacker participant who joins teams and submits projects"),
        ]
        roles = {}
        for name, desc in role_specs:
            role = db.query(Role).filter_by(name=name).first()
            if not role:
                role = Role(name=name, description=desc)
                db.add(role)
                db.flush()
            roles[name] = role
        db.commit()

        # 3. Seed Users
        print("[3/8] Seeding demo accounts for all 4 roles...")
        users_data = [
            {
                "email": "admin@hacksphere.dev",
                "password": "AdminPass123!",
                "full_name": "Platform SuperAdmin",
                "roles": ["super_admin", "judge"],
                "bio": "Global platform governance and system operator.",
                "is_superuser": True,
                "xp": 5000,
                "level": 10,
            },
            {
                "email": "organizer@technova.com",
                "password": "OrgPass123!",
                "full_name": "TechNova Lead Organizer",
                "roles": ["organizer"],
                "bio": "Tournament Director at TechNova Labs.",
                "xp": 3400,
                "level": 7,
            },
            {
                "email": "rohan.mehta@judge.com",
                "password": "JudgePass123!",
                "full_name": "Rohan Mehta",
                "roles": ["judge"],
                "bio": "Senior AI Systems Architect & Veteran Hackathon Judge.",
                "xp": 2800,
                "level": 6,
            },
            {
                "email": "shivam@example.com",
                "password": "UserPass123!",
                "full_name": "Shivam Jha",
                "roles": ["participant"],
                "bio": "Full-Stack Builder & Autonomous Systems Enthusiast.",
                "github_url": "https://github.com/shivamjha76",
                "xp": 1450,
                "level": 3,
            },
            {
                "email": "arjun@example.com",
                "password": "Participant123!",
                "full_name": "Arjun Verma",
                "roles": ["participant"],
                "bio": "Machine Learning Engineer & Open Source Contributor.",
                "xp": 1250,
                "level": 3,
            },
            {
                "email": "priya@example.com",
                "password": "Participant123!",
                "full_name": "Priya Sharma",
                "roles": ["participant"],
                "bio": "Frontend Engineer & UI/UX Specialist.",
                "xp": 950,
                "level": 2,
            },
            {
                "email": "aman@example.com",
                "password": "Participant123!",
                "full_name": "Aman Gupta",
                "roles": ["participant"],
                "bio": "Cloud Native & DevOps Architect.",
                "xp": 800,
                "level": 2,
            },
        ]

        seeded_users = {}
        for udata in users_data:
            user = db.query(User).filter_by(email=udata["email"]).first()
            if not user:
                user = User(
                    email=udata["email"],
                    hashed_password=hash_password(udata["password"]),
                    full_name=udata["full_name"],
                    bio=udata.get("bio"),
                    github_url=udata.get("github_url"),
                    is_active=True,
                    is_superuser=udata.get("is_superuser", False),
                    xp=udata.get("xp", 100),
                    level=udata.get("level", 1),
                )
                db.add(user)
                db.flush()

                # Assign roles
                for rname in udata["roles"]:
                    db.add(UserRole(user_id=user.id, role_id=roles[rname].id))
                db.flush()
            seeded_users[udata["email"]] = user
        db.commit()

        # 4. Seed Organization
        print("[4/8] Seeding organization workspaces...")
        org = db.query(Organization).filter_by(slug="technova-labs").first()
        if not org:
            org = Organization(
                name="TechNova Labs",
                slug="technova-labs",
                tagline="Pioneering autonomous intelligence and distributed developer networks.",
                description="TechNova Labs organizes international engineering hackathons and open-source bounties.",
                website_url="https://technovalabs.ai",
                is_verified=True,
                billing_tier="enterprise",
                billing_address="TechNova Labs HQ, Jaipur, Rajasthan, India",
            )
            db.add(org)
            db.flush()

            # Assign organizer as owner
            db.add(
                OrganizationMember(
                    organization_id=org.id,
                    user_id=seeded_users["organizer@technova.com"].id,
                    role="owner",
                )
            )
            db.commit()

        # 5. Seed Hackathons & Rubrics
        print("[5/8] Seeding hackathons and evaluation rubrics...")
        now = datetime.now(timezone.utc)
        hackathon = db.query(Hackathon).filter_by(slug="ai-hack-summit-2026").first()
        if not hackathon:
            hackathon = Hackathon(
                title="AI Hack Summit 2026",
                slug="ai-hack-summit-2026",
                tagline="Build the future of agentic AI, LLMs, and autonomous software.",
                description="Join over 1,500 builders globally for 48 hours of intense hacking with $25,000 in prizes.",
                organization_id=org.id,
                creator_id=seeded_users["organizer@technova.com"].id,
                status="published",
                current_phase="hacking",
                mode="online",
                start_date=now - timedelta(days=1),
                end_date=now + timedelta(days=2),
                registration_start=now - timedelta(days=14),
                registration_end=now - timedelta(days=2),
                submission_deadline=now + timedelta(days=1, hours=12),
                min_team_size=1,
                max_team_size=4,
                max_teams=500,
                prize_pool_usd=25000,
            )
            db.add(hackathon)
            db.flush()

            # Seed 6 Criteria Rubrics (summing to 100 max points)
            criteria_specs = [
                ("Impact & Innovation", "Novelty and market potential of the solution", 25, 1),
                ("Technical Execution", "Robustness, architecture, and complexity of codebase", 25, 2),
                ("UI & Developer Experience", "Clean interface, intuitive flow, and UX polish", 15, 3),
                ("Scalability & Architecture", "System design, modularity, and deployment readiness", 15, 4),
                ("Presentation & Demo", "Pitch clarity, live working demonstration, and documentation", 10, 5),
                ("Code Quality & Tests", "Clean code structure, test coverage, and repository health", 10, 6),
            ]
            for c_title, c_desc, max_pts, order in criteria_specs:
                db.add(
                    EvaluationCriteria(
                        hackathon_id=hackathon.id,
                        title=c_title,
                        description=c_desc,
                        max_score=max_pts,
                        display_order=order,
                    )
                )
            db.commit()

        # 6. Seed Teams, Submissions & Judge Assignments
        print("[6/8] Seeding teams, project submissions, and judge evaluations...")
        team = db.query(Team).filter_by(invite_code="CODE-CRAFT-26").first()
        if not team:
            team = Team(
                hackathon_id=hackathon.id,
                name="CodeCrafters",
                tagline="Building autonomous developer tooling.",
                invite_code="CODE-CRAFT-26",
                leader_id=seeded_users["shivam@example.com"].id,
            )
            db.add(team)
            db.flush()

            # Add team members
            db.add(TeamMember(team_id=team.id, user_id=seeded_users["shivam@example.com"].id, role="leader"))
            db.add(TeamMember(team_id=team.id, user_id=seeded_users["arjun@example.com"].id, role="member"))
            db.add(TeamMember(team_id=team.id, user_id=seeded_users["priya@example.com"].id, role="member"))
            db.commit()

        # Submission
        submission = db.query(Submission).filter_by(team_id=team.id).first()
        if not submission:
            submission = Submission(
                hackathon_id=hackathon.id,
                team_id=team.id,
                project_title="SmartAssist AI",
                tagline="Self-healing CI/CD agentic workflow optimizer for distributed dev teams.",
                description="SmartAssist AI monitors production failures, generates hotfix diffs, and submits pull requests autonomously.",
                github_url="https://github.com/shivamjha76/smartassist-ai",
                demo_url="https://smartassist.ai/demo",
                video_url="https://youtube.com/watch?v=demo123",
                tech_stack="FastAPI, Next.js, PostgreSQL, OpenAI, Docker",
                status="submitted",
                version=1,
                is_locked=False,
            )
            db.add(submission)
            db.flush()

            # Judge Assignment
            assignment = JudgeAssignment(
                hackathon_id=hackathon.id,
                judge_id=seeded_users["rohan.mehta@judge.com"].id,
                team_id=team.id,
                is_completed=True,
            )
            db.add(assignment)
            db.flush()

            # Evaluation & Rubric Scores
            evaluation = Evaluation(
                hackathon_id=hackathon.id,
                submission_id=submission.id,
                judge_id=seeded_users["rohan.mehta@judge.com"].id,
                total_score=91.0,
                feedback="Outstanding execution with brilliant multi-agent architecture and clean developer UX.",
            )
            db.add(evaluation)
            db.flush()

            criteria = db.query(EvaluationCriteria).filter_by(hackathon_id=hackathon.id).order_by(EvaluationCriteria.display_order).all()
            assigned_scores = [23.0, 24.0, 14.0, 13.5, 9.0, 7.5]
            for crit, sc in zip(criteria, assigned_scores):
                db.add(
                    EvaluationScore(
                        evaluation_id=evaluation.id,
                        criterion_id=crit.id,
                        score=sc,
                    )
                )
            db.commit()

        # 7. Seed Verifiable Certificates
        print("[7/8] Seeding verifiable credentials...")
        cert = db.query(Certificate).filter_by(certificate_code="HS-2026-WINNER-001").first()
        if not cert:
            cert = Certificate(
                certificate_code="HS-2026-WINNER-001",
                hackathon_id=hackathon.id,
                user_id=seeded_users["shivam@example.com"].id,
                team_id=team.id,
                recipient_name="Shivam Jha",
                award_title="1st Place Champion - AI Hack Summit 2026",
                qr_verification_url="http://localhost:3000/verify/HS-2026-WINNER-001",
                verification_hash="a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
                is_valid=True,
            )
            db.add(cert)
            db.commit()

        # 8. Seed Announcements
        print("[8/8] Seeding community announcements...")
        if db.query(Announcement).filter_by(hackathon_id=hackathon.id).count() == 0:
            announcements = [
                Announcement(
                    hackathon_id=hackathon.id,
                    organization_id=org.id,
                    author_name="TechNova Labs Team",
                    title="Welcome to AI Hack Summit 2026!",
                    content="We're excited to have you all here. Get ready to build, innovate, and win amazing prizes across our tracks!",
                    priority="important",
                    status="published",
                    target_audience="all",
                    is_pinned=True,
                    views_count=1240,
                ),
                Announcement(
                    hackathon_id=hackathon.id,
                    organization_id=org.id,
                    author_name="TechNova Labs Team",
                    title="Schedule Update: Submission Deadline Extended",
                    content="The submission deadline has been extended by 2 hours. New deadline: Tonight at 11:59 PM IST.",
                    priority="urgent",
                    status="published",
                    target_audience="participants",
                    is_pinned=True,
                    views_count=856,
                ),
                Announcement(
                    hackathon_id=hackathon.id,
                    organization_id=org.id,
                    author_name="TechNova Labs Team",
                    title="Judging Round Begins Tomorrow",
                    content="Judging will commence tomorrow at 09:00 AM IST. Make sure your GitHub repo and demo video are public!",
                    priority="important",
                    status="scheduled",
                    target_audience="judges",
                    is_pinned=False,
                    scheduled_for=now + timedelta(days=1),
                    views_count=0,
                ),
            ]
            db.add_all(announcements)
            db.commit()

        print("\n" + "=" * 70)
        print("[SUCCESS] HackSphere Database Seeding Complete!")
        print("=" * 70)
        print("Demo User Accounts Available:")
        print("  1. SuperAdmin:  admin@hacksphere.dev     / AdminPass123!")
        print("  2. Organizer:   organizer@technova.com   / OrgPass123!")
        print("  3. Judge:       rohan.mehta@judge.com    / JudgePass123!")
        print("  4. Participant: shivam@example.com       / UserPass123!")
        print("  5. Participant: arjun@example.com        / Participant123!")
        print("=" * 70 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
