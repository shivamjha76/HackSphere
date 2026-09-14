import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.core.security import hash_password
from app.models import (
    User,
    Role,
    UserRole,
    Organization,
    OrganizationMember,
    ActivityLog,
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
    Announcement,
    HackathonWinner,
)
from sqlalchemy import text


def ensure_sqlite_columns(eng):
    """Safely migrate missing columns into SQLite tables."""
    try:
        with eng.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(organizations)"))
            existing_cols = {row[1] for row in res.fetchall()}
            columns_to_add = [
                ("plan_tier", "VARCHAR(50) DEFAULT 'pro'"),
                ("billing_cycle", "VARCHAR(50) DEFAULT 'monthly'"),
                ("plan_price", "FLOAT DEFAULT 999.0"),
                ("next_billing_date", "DATETIME"),
                ("billing_email", "VARCHAR(255)"),
                ("billing_address", "TEXT"),
                ("storage_used_gb", "FLOAT DEFAULT 12.4"),
                ("max_storage_gb", "FLOAT DEFAULT 50.0"),
                ("max_hackathons", "INTEGER DEFAULT 20"),
                ("max_participants", "INTEGER DEFAULT 10000"),
                ("max_submissions", "INTEGER DEFAULT 5000"),
            ]
            for col_name, col_type in columns_to_add:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE organizations ADD COLUMN {col_name} {col_type}"))
            conn.commit()
    except Exception as e:
        print(f"[!] Migration notice: {e}")


def seed_database():
    print("[*] Starting HackSphere database seeding...")
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns(engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        role_names = [
            ("super_admin", "Global platform administrator with complete authority"),
            ("organizer", "Organization owner/admin capable of hosting hackathons"),
            ("participant", "Developer/student participating in hackathons"),
            ("judge", "Domain expert appointed to evaluate hackathon submissions"),
        ]
        roles = {}
        for name, desc in role_names:
            role = db.query(Role).filter_by(name=name).first()
            if not role:
                role = Role(name=name, description=desc)
                db.add(role)
                db.flush()
            roles[name] = role
        print(f"[+] Verified {len(roles)} core roles.")

        # 2. Seed Users
        users_data = [
            {
                "email": "admin@hacksphere.dev",
                "full_name": "Platform SuperAdmin",
                "password": "AdminPass123!",
                "role": "super_admin",
                "xp": 5000,
                "level": 10,
                "is_superuser": True,
            },
            {
                "email": "organizer@technova.com",
                "full_name": "TechNova Lead Organizer",
                "password": "OrganizerPass123!",
                "role": "organizer",
                "xp": 2400,
                "level": 5,
                "is_superuser": False,
            },
            {
                "email": "rohan.mehta@judge.com",
                "full_name": "Rohan Mehta",
                "password": "JudgePass123!",
                "role": "judge",
                "bio": "Principal AI Architect & Tech Judge. Evaluated 20+ national hackathons.",
                "skills": "AI, PyTorch, Distributed Systems, Cloud",
                "xp": 3500,
                "level": 7,
                "is_superuser": False,
            },
            {
                "email": "shivam@example.com",
                "full_name": "Shivam Jha",
                "password": "UserPass123!",
                "role": "participant",
                "bio": "Full-stack developer & AI enthusiast. Building autonomous systems.",
                "skills": "Next.js, Python, FastAPI, TypeScript, PostgreSQL",
                "github_url": "https://github.com/shivamjha76",
                "linkedin_url": "https://linkedin.com/in/shivamjha",
                "xp": 1250,
                "level": 3,
                "is_superuser": False,
            },
            {
                "email": "arjun@example.com",
                "full_name": "Arjun Verma",
                "password": "UserPass123!",
                "role": "participant",
                "bio": "Frontend designer & React enthusiast.",
                "skills": "React, Tailwind, Figma, UI/UX",
                "xp": 1250,
                "level": 3,
                "is_superuser": False,
            },
            {
                "email": "priya@example.com",
                "full_name": "Priya Sharma",
                "password": "UserPass123!",
                "role": "participant",
                "bio": "Backend developer & database specialist.",
                "skills": "PostgreSQL, Python, Docker, APIs",
                "xp": 600,
                "level": 2,
                "is_superuser": False,
            },
            {
                "email": "aman@example.com",
                "full_name": "Aman Gupta",
                "password": "UserPass123!",
                "role": "participant",
                "bio": "Cloud architect & DevOps engineer.",
                "skills": "AWS, Kubernetes, CI/CD, Go",
                "xp": 850,
                "level": 2,
                "is_superuser": False,
            },
            {
                "email": "rahul@example.com",
                "full_name": "Rahul Sharma",
                "password": "UserPass123!",
                "roles": ["participant", "judge", "organizer"],
                "bio": "Multi-role veteran: 3x Hackathon winner, AI Judge & Tech Community Organizer.",
                "skills": "Full-Stack, React, Python, ML, System Design",
                "github_url": "https://github.com/rahulsharma",
                "linkedin_url": "https://linkedin.com/in/rahulsharma-tech",
                "xp": 1850,
                "level": 4,
                "is_superuser": False,
            },
            {
                "email": "priya.sharma@technovalabs.dev",
                "full_name": "Priya Sharma",
                "password": "UserPass123!",
                "role": "organizer",
                "bio": "Lead Operations & Hackathon Coordinator at TechNova Labs.",
                "xp": 2100,
                "level": 5,
                "is_superuser": False,
            },
            {
                "email": "aman.kumar@technovalabs.dev",
                "full_name": "Aman Kumar",
                "password": "UserPass123!",
                "role": "organizer",
                "bio": "Technical Evaluation Moderator & Community Lead.",
                "xp": 1400,
                "level": 3,
                "is_superuser": False,
            },
            {
                "email": "neha.saxena@technovalabs.dev",
                "full_name": "Neha Saxena",
                "password": "UserPass123!",
                "role": "organizer",
                "bio": "Developer Relations & Hackathon Moderator.",
                "xp": 1600,
                "level": 4,
                "is_superuser": False,
            },
            {
                "email": "karan.verma@technovalabs.dev",
                "full_name": "Karan Verma",
                "password": "UserPass123!",
                "role": "organizer",
                "bio": "Audit & Compliance Reviewer at TechNova Labs.",
                "xp": 1200,
                "level": 3,
                "is_superuser": False,
            },
        ]

        users = {}
        for u in users_data:
            user = db.query(User).filter_by(email=u["email"]).first()
            if not user:
                user = User(
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    full_name=u["full_name"],
                    bio=u.get("bio"),
                    skills=u.get("skills"),
                    github_url=u.get("github_url"),
                    linkedin_url=u.get("linkedin_url"),
                    xp=u["xp"],
                    level=u["level"],
                    is_active=True,
                    is_superuser=u["is_superuser"],
                )
                db.add(user)
                db.flush()

            # Map Roles (supports single or multiple roles)
            user_roles = u.get("roles") or ([u["role"]] if "role" in u else [])
            for r_name in user_roles:
                existing_ur = db.query(UserRole).filter_by(user_id=user.id, role_id=roles[r_name].id).first()
                if not existing_ur:
                    ur = UserRole(user_id=user.id, role_id=roles[r_name].id)
                    db.add(ur)
                    db.flush()

            users[u["email"]] = user
        print(f"[+] Verified {len(users)} test users with hashed passwords and roles.")

        # 3. Seed Organization (TechNova Labs)
        org = db.query(Organization).filter_by(slug="technova-labs").first()
        if not org:
            org = Organization(
                name="TechNova Labs",
                slug="technova-labs",
                org_type="company",
                official_email="contact@technovalabs.com",
                phone="+91-11-23456789",
                website_url="https://technovalabs.com",
                description="Pioneering AI research and technology innovation community.",
                country="India",
                state="Delhi",
                city="New Delhi",
                is_verified=True,
                created_by_user_id=users["organizer@technova.com"].id,
            )
            db.add(org)
            db.flush()

        # Update / ensure billing attributes matching Screen #52
        org.plan_tier = "pro"
        org.billing_cycle = "monthly"
        org.plan_price = 999.0
        org.next_billing_date = datetime(2025, 6, 12, tzinfo=timezone.utc)
        org.billing_email = "billing@technovalabs.dev"
        org.billing_address = "TechNova Labs, Jaipur, Rajasthan, India"
        org.storage_used_gb = 12.4
        org.max_storage_gb = 50.0
        org.max_hackathons = 20
        org.max_participants = 10000
        org.max_submissions = 5000
        db.flush()

        # Add Organization Members
        members_config = [
            ("organizer@technova.com", "owner"),
            ("priya.sharma@technovalabs.dev", "admin"),
            ("aman.kumar@technovalabs.dev", "moderator"),
            ("neha.saxena@technovalabs.dev", "moderator"),
            ("karan.verma@technovalabs.dev", "viewer"),
        ]
        for email, m_role in members_config:
            if email in users:
                existing_m = db.query(OrganizationMember).filter_by(
                    organization_id=org.id, user_id=users[email].id
                ).first()
                if not existing_m:
                    db.add(OrganizationMember(
                        organization_id=org.id,
                        user_id=users[email].id,
                        role=m_role,
                    ))
        db.flush()

        # Seed Activity Logs matching Screen #51
        activity_records = [
            {
                "user_name": "Rohan Mehta",
                "user_email": "rohan.mehta@judge.com",
                "action": "Added Team Member",
                "details": "Added Priya Sharma as Moderator",
                "ip_address": "103.45.67.89",
                "offset_hours": 2,
            },
            {
                "user_name": "Priya Sharma",
                "user_email": "priya.sharma@technovalabs.dev",
                "action": "Updated Role",
                "details": "Changed role of Aman Kumar from Viewer to Moderator",
                "ip_address": "103.45.67.89",
                "offset_hours": 5,
            },
            {
                "user_name": "Aman Kumar",
                "user_email": "aman.kumar@technovalabs.dev",
                "action": "Edited Draft",
                "details": "Updated details of 'Codecraft 3.0' hackathon",
                "ip_address": "117.201.34.22",
                "offset_hours": 26,
            },
            {
                "user_name": "Neha Saxena",
                "user_email": "neha.saxena@technovalabs.dev",
                "action": "Deleted Draft",
                "details": "Deleted draft 'AI Innovators Hackathon'",
                "ip_address": "152.58.87.11",
                "offset_hours": 30,
            },
            {
                "user_name": "Karan Verma",
                "user_email": "karan.verma@technovalabs.dev",
                "action": "Changed Settings",
                "details": "Updated organization preferences",
                "ip_address": "103.45.67.89",
                "offset_hours": 52,
            },
            {
                "user_name": "Priya Sharma",
                "user_email": "priya.sharma@technovalabs.dev",
                "action": "Logged In",
                "details": "User logged in successfully",
                "ip_address": "117.201.34.22",
                "offset_hours": 56,
            },
            {
                "user_name": "Rohan Mehta",
                "user_email": "rohan.mehta@judge.com",
                "action": "Reviewed Submission",
                "details": "Reviewed submission for Codecraft 3.0",
                "ip_address": "103.45.67.89",
                "offset_hours": 74,
            },
            {
                "user_name": "TechNova Lead Organizer",
                "user_email": "organizer@technova.com",
                "action": "Announced Winners",
                "details": "Announced Winners for AI Summit Hackathon",
                "ip_address": "103.45.67.89",
                "offset_hours": 78,
            },
            {
                "user_name": "TechNova Lead Organizer",
                "user_email": "organizer@technova.com",
                "action": "Added Team Member",
                "details": "Invited Neha Saxena to organization workspace",
                "ip_address": "103.45.67.89",
                "offset_hours": 102,
            },
            {
                "user_name": "Priya Sharma",
                "user_email": "priya.sharma@technovalabs.dev",
                "action": "Edited Draft",
                "details": "Configured judging rubric for AI Hack Summit",
                "ip_address": "103.45.67.89",
                "offset_hours": 126,
            },
            {
                "user_name": "TechNova Lead Organizer",
                "user_email": "organizer@technova.com",
                "action": "Changed Settings",
                "details": "Enabled GitHub OAuth & Auto-Shortlisting pipeline",
                "ip_address": "103.45.67.89",
                "offset_hours": 168,
            },
            {
                "user_name": "TechNova Lead Organizer",
                "user_email": "organizer@technova.com",
                "action": "Logged In",
                "details": "Admin session authenticated via 2FA verification",
                "ip_address": "103.45.67.89",
                "offset_hours": 192,
            },
        ]
        now_seed = datetime.now(timezone.utc)
        for rec in activity_records:
            existing_log = db.query(ActivityLog).filter_by(
                organization_id=org.id, details=rec["details"]
            ).first()
            if not existing_log:
                u_id = users[rec["user_email"]].id if rec["user_email"] in users else None
                log_item = ActivityLog(
                    organization_id=org.id,
                    user_id=u_id,
                    user_name=rec["user_name"],
                    action=rec["action"],
                    details=rec["details"],
                    ip_address=rec["ip_address"],
                    created_at=now_seed - timedelta(hours=rec["offset_hours"]),
                )
                db.add(log_item)
        db.flush()
        print("[+] Verified Organization: TechNova Labs (Roster & Screen #51 Activity Logs seeded).")

        # 4. Seed Hackathons
        now = datetime.now(timezone.utc)
        hackathons_data = [
            {
                "title": "AI Hack Summit 2026",
                "slug": "ai-hack-summit-2026",
                "tagline": "Build next-generation autonomous AI and machine learning solutions",
                "short_description": "A 48-hour global sprint to design and ship production-ready AI applications.",
                "theme": "AI/ML",
                "mode": "online",
                "status": "live",
                "visibility": "public",
                "prize_pool_summary": "50,000 INR Pool",
                "registration_start": now - timedelta(days=10),
                "registration_end": now + timedelta(days=2),
                "event_start": now + timedelta(days=3),
                "event_end": now + timedelta(days=5),
                "submission_start": now + timedelta(days=3),
                "submission_end": now + timedelta(days=5),
                "judging_start": now + timedelta(days=5, hours=1),
                "judging_end": now + timedelta(days=7),
                "result_date": now + timedelta(days=8),
                "min_team_size": 2,
                "max_team_size": 4,
            },
            {
                "title": "Codecraft 3.0",
                "slug": "codecraft-3",
                "tagline": "Scale real-time web and distributed cloud architectures",
                "short_description": "National web challenge testing system resilience and clean architecture.",
                "theme": "Web & Cloud",
                "mode": "hybrid",
                "status": "judging",
                "visibility": "public",
                "prize_pool_summary": "75,000 INR Pool",
                "registration_start": now - timedelta(days=20),
                "registration_end": now - timedelta(days=5),
                "event_start": now - timedelta(days=4),
                "event_end": now - timedelta(days=2),
                "submission_start": now - timedelta(days=4),
                "submission_end": now - timedelta(days=2),
                "judging_start": now - timedelta(days=2),
                "judging_end": now + timedelta(days=1),
                "result_date": now + timedelta(days=2),
                "min_team_size": 1,
                "max_team_size": 4,
            },
            {
                "title": "CyberVerse Challenge",
                "slug": "cyberverse-challenge",
                "tagline": "Defend the grid: Cybersecurity and threat intelligence hackathon",
                "short_description": "Identify vulnerabilities and engineer zero-trust defensive systems.",
                "theme": "Cyber Security",
                "mode": "online",
                "status": "registration_open",
                "visibility": "public",
                "prize_pool_summary": "40,000 INR Pool",
                "registration_start": now - timedelta(days=1),
                "registration_end": now + timedelta(days=14),
                "event_start": now + timedelta(days=15),
                "event_end": now + timedelta(days=17),
                "min_team_size": 2,
                "max_team_size": 4,
            },
        ]

        hackathons = {}
        for h in hackathons_data:
            hack = db.query(Hackathon).filter_by(slug=h["slug"]).first()
            if not hack:
                hack = Hackathon(
                    organization_id=org.id,
                    title=h["title"],
                    slug=h["slug"],
                    tagline=h["tagline"],
                    short_description=h["short_description"],
                    theme=h["theme"],
                    mode=h["mode"],
                    status=h["status"],
                    visibility=h["visibility"],
                    prize_pool_summary=h["prize_pool_summary"],
                    registration_start=h["registration_start"],
                    registration_end=h["registration_end"],
                    event_start=h["event_start"],
                    event_end=h["event_end"],
                    submission_start=h.get("submission_start"),
                    submission_end=h.get("submission_end"),
                    judging_start=h.get("judging_start"),
                    judging_end=h.get("judging_end"),
                    result_date=h.get("result_date"),
                    min_team_size=h["min_team_size"],
                    max_team_size=h["max_team_size"],
                    created_by_user_id=users["organizer@technova.com"].id,
                )
                db.add(hack)
                db.flush()
            hackathons[h["slug"]] = hack
        print(f"[+] Verified {len(hackathons)} sample hackathons.")

        # 5. Seed Rubrics for AI Hack Summit 2026 (Total 100 Marks from UI Screen #55)
        ai_hack = hackathons["ai-hack-summit-2026"]
        criteria_list = [
            ("Problem Definition", "Clarity, relevance, and significance of the problem", 15),
            ("Innovation & Creativity", "Originality of the idea and creative problem solving approach", 20),
            ("Solution & Functionality", "How well the solution works and addresses the problem", 25),
            ("Technical Complexity", "Code quality, modern architecture, and technology depth", 20),
            ("Impact & Scalability", "Potential market impact and scalability of the architecture", 10),
            ("Presentation & Demo", "Quality of presentation, communication, and live demo", 10),
        ]
        criteria_map = {}
        for c_name, c_desc, c_max in criteria_list:
            crit = (
                db.query(EvaluationCriteria)
                .filter_by(hackathon_id=ai_hack.id, name=c_name)
                .first()
            )
            if not crit:
                crit = EvaluationCriteria(
                    hackathon_id=ai_hack.id,
                    name=c_name,
                    description=c_desc,
                    max_score=c_max,
                    weight=1.0,
                )
                db.add(crit)
                db.flush()
            criteria_map[c_name] = crit
        print("[+] Verified 6 Evaluation Rubric Criteria for AI Hack Summit 2026 (Total: 100 Marks).")

        # 6. Seed Registrations
        for email in ["shivam@example.com", "arjun@example.com", "priya@example.com", "aman@example.com"]:
            user = users[email]
            reg = (
                db.query(HackathonRegistration)
                .filter_by(hackathon_id=ai_hack.id, user_id=user.id)
                .first()
            )
            if not reg:
                reg = HackathonRegistration(hackathon_id=ai_hack.id, user_id=user.id, status="registered")
                db.add(reg)
                db.flush()
        print("[+] Verified participant registrations.")

        # 7. Seed Teams
        team_codecrafters = db.query(Team).filter_by(invite_code="CODE-CRAFT-26").first()
        if not team_codecrafters:
            team_codecrafters = Team(
                hackathon_id=ai_hack.id,
                name="CodeCrafters",
                invite_code="CODE-CRAFT-26",
                track="AI & Machine Learning",
                status="shortlisted",
                is_frozen=False,
                created_by_user_id=users["shivam@example.com"].id,
            )
            db.add(team_codecrafters)
            db.flush()

            # Add Leader and Members
            m1 = TeamMember(team_id=team_codecrafters.id, user_id=users["shivam@example.com"].id, role="leader")
            m2 = TeamMember(team_id=team_codecrafters.id, user_id=users["arjun@example.com"].id, role="member")
            m3 = TeamMember(team_id=team_codecrafters.id, user_id=users["priya@example.com"].id, role="member")
            db.add_all([m1, m2, m3])
            db.flush()

        team_bytebuilders = db.query(Team).filter_by(invite_code="BYTE-BUILD-26").first()
        if not team_bytebuilders:
            team_bytebuilders = Team(
                hackathon_id=ai_hack.id,
                name="ByteBuilders",
                invite_code="BYTE-BUILD-26",
                track="Sustainability & CleanTech",
                status="registered",
                is_frozen=False,
                created_by_user_id=users["aman@example.com"].id,
            )
            db.add(team_bytebuilders)
            db.flush()

            m4 = TeamMember(team_id=team_bytebuilders.id, user_id=users["aman@example.com"].id, role="leader")
            db.add(m4)
            db.flush()
        print("[+] Verified teams: CodeCrafters (3 members) & ByteBuilders.")

        # 8. Seed Submissions
        sub = db.query(Submission).filter_by(team_id=team_codecrafters.id).first()
        if not sub:
            sub = Submission(
                team_id=team_codecrafters.id,
                hackathon_id=ai_hack.id,
                project_title="SmartAssist AI",
                tagline="Intelligent autonomous agent for workflow automation",
                description=(
                    "SmartAssist AI provides automated developer sprint planning, "
                    "context-aware code reviews, and predictive issue detection."
                ),
                github_url="https://github.com/shivamjha76/smartassist-ai",
                live_demo_url="https://smartassist.demo",
                video_url="https://youtube.com/watch?v=demo1234",
                version=1,
                is_final=True,
                is_locked=False,
                status="evaluated",
            )
            db.add(sub)
            db.flush()
        print("[+] Verified project submission for CodeCrafters (SmartAssist AI v1).")

        # 9. Seed Judge Assignment & Evaluation
        judge_user = users["rohan.mehta@judge.com"]
        hack_judge = (
            db.query(HackathonJudge)
            .filter_by(hackathon_id=ai_hack.id, user_id=judge_user.id)
            .first()
        )
        if not hack_judge:
            hack_judge = HackathonJudge(
                hackathon_id=ai_hack.id,
                user_id=judge_user.id,
                expertise="AI / Machine Learning & Systems",
                status="active",
            )
            db.add(hack_judge)
            db.flush()

        assignment = (
            db.query(JudgeAssignment)
            .filter_by(hackathon_id=ai_hack.id, judge_id=hack_judge.id, team_id=team_codecrafters.id)
            .first()
        )
        if not assignment:
            assignment = JudgeAssignment(
                hackathon_id=ai_hack.id,
                judge_id=hack_judge.id,
                team_id=team_codecrafters.id,
                status="completed",
            )
            db.add(assignment)
            db.flush()

        eval_record = db.query(Evaluation).filter_by(submission_id=sub.id).first()
        if not eval_record:
            eval_record = Evaluation(
                assignment_id=assignment.id,
                judge_id=hack_judge.id,
                submission_id=sub.id,
                total_score=91.0,
                feedback=(
                    "Exceptional project with production-grade engineering. "
                    "The autonomous agent execution and clean UI interface stand out."
                ),
                is_flagged_for_review=False,
                status="submitted",
            )
            db.add(eval_record)
            db.flush()
        else:
            eval_record.total_score = 91.0
            eval_record.status = "submitted"
            eval_record.is_flagged_for_review = False
            eval_record.feedback = (
                "Exceptional project with production-grade engineering. "
                "The autonomous agent execution and clean UI interface stand out."
            )
            db.flush()

        # Rubric breakdown scores (Total = 91/100)
        db.query(EvaluationScore).filter_by(evaluation_id=eval_record.id).delete()
        db.flush()
        scores_data = [
                ("Problem Definition", 14.0),
                ("Innovation & Creativity", 19.0),
                ("Solution & Functionality", 23.0),
                ("Technical Complexity", 18.0),
                ("Impact & Scalability", 9.0),
                ("Presentation & Demo", 8.0),
            ]
        for c_name, sc in scores_data:
            score_entry = EvaluationScore(
                evaluation_id=eval_record.id,
                criterion_id=criteria_map[c_name].id,
                score=sc,
            )
            db.add(score_entry)
        db.flush()
        print("[+] Verified Judge evaluation & rubric scores (Score: 91/100 by Judge Rohan Mehta).")

        # 10. Seed Verifiable Certificate
        cert = db.query(Certificate).filter_by(certificate_code="HS-2026-WINNER-001").first()
        if not cert:
            cert = Certificate(
                certificate_code="HS-2026-WINNER-001",
                hackathon_id=ai_hack.id,
                user_id=users["shivam@example.com"].id,
                team_id=team_codecrafters.id,
                certificate_type="winner",
                title="1st Place Winner - AI Hack Summit 2026",
                recipient_name="Shivam Jha",
                qr_verification_url="https://hacksphere.dev/verify/HS-2026-WINNER-001",
                is_valid=True,
            )
            db.add(cert)
            db.flush()
        print("[+] Verified tamper-proof certificate: HS-2026-WINNER-001.")

        # 11. Seed Announcements matching Screen #30
        announcements_data = [
            {
                "title": "Welcome to AI Hack Summit 2026!",
                "content": "We're excited to have you all here. Get ready to build, innovate, and win amazing prizes across AI and Agentic development tracks!",
                "priority": "important",
                "status": "published",
                "target_audience": "all",
                "is_pinned": True,
                "views_count": 1240,
                "created_at": datetime.now(timezone.utc) - timedelta(days=2),
            },
            {
                "title": "Schedule Update: Submission Deadline Extended",
                "content": "The final submission deadline has been extended by 2 hours. New project lock deadline: Today at 11:59 PM IST.",
                "priority": "urgent",
                "status": "published",
                "target_audience": "participants",
                "is_pinned": True,
                "views_count": 856,
                "created_at": datetime.now(timezone.utc) - timedelta(hours=6),
            },
            {
                "title": "Exciting Prizes Await!",
                "content": "Check out our amazing prize pool worth $25,000 USD + ₹50,000 INR and exclusive goodies, swag kits, and venture credits for top teams.",
                "priority": "normal",
                "status": "published",
                "target_audience": "all",
                "is_pinned": False,
                "views_count": 743,
                "created_at": datetime.now(timezone.utc) - timedelta(days=1),
            },
            {
                "title": "Judging Round Begins Tomorrow",
                "content": "Judging round starts tomorrow morning. Appointed judges will evaluate problem definition, innovation, and technical implementation.",
                "priority": "important",
                "status": "scheduled",
                "target_audience": "judges",
                "is_pinned": False,
                "scheduled_for": datetime.now(timezone.utc) + timedelta(days=1),
                "views_count": 0,
                "created_at": datetime.now(timezone.utc) - timedelta(hours=3),
            },
            {
                "title": "Code of Conduct & Original Work Reminder",
                "content": "Please ensure all submissions follow our code of conduct. Pre-built proprietary products are disqualified; let's keep it respectful and fair.",
                "priority": "normal",
                "status": "published",
                "target_audience": "all",
                "is_pinned": False,
                "views_count": 612,
                "created_at": datetime.now(timezone.utc) - timedelta(days=3),
            },
        ]

        for a_data in announcements_data:
            existing = db.query(Announcement).filter_by(
                hackathon_id=ai_hack.id,
                title=a_data["title"],
            ).first()
            if not existing:
                a_obj = Announcement(
                    hackathon_id=ai_hack.id,
                    organization_id=org.id,
                    author_id=users["organizer@technova.com"].id,
                    **a_data,
                )
                db.add(a_obj)
        db.flush()
        print("[+] Seeded Hackathon broadcast announcements matching Screen #30.")

        # 12. Seed Podium Winners matching Screen #53 & #57
        winners_seed = [
            {
                "team_id": team_codecrafters.id,
                "submission_id": sub.id,
                "rank": 1,
                "title": "1st Place Winner",
                "prize_amount": "₹25,000",
                "prize_type": "cash",
                "notes": "Outstanding agentic architecture and autonomous tool integration.",
            },
            {
                "team_id": team_bytebuilders.id,
                "rank": 2,
                "title": "1st Runner Up",
                "prize_amount": "₹15,000",
                "prize_type": "cash",
                "notes": "Excellent multimodal UI and edge computing optimization.",
            },
        ]

        for w_s in winners_seed:
            existing_w = db.query(HackathonWinner).filter_by(
                hackathon_id=ai_hack.id,
                team_id=w_s["team_id"],
            ).first()
            if not existing_w:
                w_obj = HackathonWinner(
                    hackathon_id=ai_hack.id,
                    **w_s,
                )
                db.add(w_obj)
        db.flush()
        print("[+] Seeded Hackathon podium winners (CodeCrafters: 1st, ByteBuilders: 2nd).")

        db.commit()
        print("\n[SUCCESS] HackSphere database seeded cleanly with complete mock ecosystem!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
