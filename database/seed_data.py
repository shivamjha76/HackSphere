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


def seed_database():
    print("[*] Starting HackSphere database seeding...")
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
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

            # Add Organizer as Owner
            org_member = OrganizationMember(
                organization_id=org.id,
                user_id=users["organizer@technova.com"].id,
                role="owner",
            )
            db.add(org_member)
            db.flush()
        print("[+] Verified Organization: TechNova Labs (Verified Owner assigned).")

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

            # Rubric breakdown scores (Total = 91/100)
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
