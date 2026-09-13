# HackSphere 🌐⚡

> **One Platform for Complete Hackathon Management**  
> *"Run hackathons. Build the future."*

![HackSphere Logo](assets/logo_with_name.png)

---

## 🚀 Overview

**HackSphere** is an end-to-end, all-in-one hackathon operating system and developer ecosystem. It consolidates registration, team management, project submissions, multi-criteria judging rubrics, automated leaderboards, and verifiable QR-coded certificates into a unified, high-performance platform.

---

## ✨ Core Features

- 🏢 **Multi-Tenant Organization Workspaces:** Colleges, tech clubs, and enterprises can manage team members, staff roles, and host multiple hackathons.
- ⏱️ **Automated Time-Driven State Machine:** Seamless stage progression from Draft $\rightarrow$ Registration Open $\rightarrow$ Team Freeze $\rightarrow$ Live Hackathon $\rightarrow$ Judging $\rightarrow$ Winner Announcement.
- 👥 **Self-Serve Team Collaboration:** Dynamic team creation with invite codes/links, join request approvals, and activity tracking.
- 📦 **Multi-Version Submissions & Locking:** Version history (v1, v2, v3) with server-side latency protection ensuring fair submissions at deadlines.
- ⚖️ **Hybrid Judging Engine:** Expertise-based submission assignment with customizable multi-criteria rubrics, anomaly detection, and tie-breakers.
- 📜 **Verifiable QR Certificates:** Instant automated issuing of verifiable certificates with unique IDs and public validation pages.
- 🎮 **Developer Gamification:** User XP, levels, achievement badges, and public developer portfolios.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React 18+ App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Backend** | [Python 3.13](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://docs.pydantic.dev/), [SQLAlchemy 2.0](https://www.sqlalchemy.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Authentication**| JWT (JSON Web Tokens) with bcrypt password hashing + OAuth 2.0 |
| **Design System**| Modern Minimal (Desktop-First V1, Linear & Vercel inspired) |

---

## 📁 Repository Structure

```
HackSphere/
├── frontend/             # Next.js App Router, Tailwind, shadcn/ui components
├── backend/              # Python FastAPI modular application
├── database/             # Schemas, migrations, and seed scripts
├── docs/                 # Architecture, API specs, and technical guides
├── assets/               # Brand logos and design assets
├── Roadmap/              # 4 Blueprint specification documents (45 chapters)
├── UI Design/            # 59 High-fidelity UI screen mockups
├── .gitignore            # Git exclusion rules
└── README.md             # Project overview and roadmap guide
```

---

## 🗺️ Execution Roadmap (34 Steps)

The project is built sequentially across 9 structured phases:
1. **Phase 1:** Foundation & Project Setup *(Steps 1–4)*
2. **Phase 2:** Database & Relational Schema *(Steps 5–7)*
3. **Phase 3:** Authentication & Multi-Role RBAC *(Steps 8–11)*
4. **Phase 4:** Design System & UI Shell *(Steps 12–14)*
5. **Phase 5:** Public & Discovery Pages *(Steps 15–17)*
6. **Phase 6:** Organization & Hackathon Creation Engine *(Steps 18–22)*
7. **Phase 7:** Teams, Freeze Policy & Submissions *(Steps 23–26)*
8. **Phase 8:** Judging, Rubrics & Leaderboard *(Steps 27–30)*
9. **Phase 9:** Certificates, Gamification & Final Polish *(Steps 31–34)*

For detailed architectural specifications, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
