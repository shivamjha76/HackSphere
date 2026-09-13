# HackSphere Platform Architecture & Engineering Blueprint

This document captures the architectural foundation and business rules defined in the **HackSphere Blueprint (Chapters 1–45)**.

---

## 1. System Vision & Core Value Proposition
HackSphere replaces the fragmented hackathon toolkit (Google Forms, Excel, WhatsApp, Google Drive, Manual Judging Sheets, Canva) with a unified, end-to-end hackathon operating system and developer ecosystem.

---

## 2. Multi-Role RBAC Model ("Ek Email = Ek Account")

A single user account can hold multiple roles simultaneously across different events and organizations:

```
                  Super Admin (Platform Owner)
                             │
            ┌────────────────┴────────────────┐
      Organizer A                       Organizer B
     (Organization A)                  (Organization B)
            │                                 │
     ┌──────┴──────┐                   ┌──────┴──────┐
Participants     Judges             Participants     Judges
     │                                 │
   Teams                             Teams
```

- **Super Admin:** Platform governance, organization verification, global health & moderation.
- **Organization Owner / Admin:** Workspace control, hackathon creation, stage progression, judge assignment, team freeze review.
- **Judge:** Assigned submissions review, multi-criteria rubric evaluation, constructive feedback.
- **Team Leader:** Team formation, invite link/code generation, accept/reject join requests, project versioned submissions.
- **Team Member:** Collaboration, file uploads, leaving team.

---

## 3. Hackathon Lifecycle & Automated State Machine

The platform status updates automatically based on timeline timestamps, not manual triggers:

```
DRAFT ──► PUBLISHED ──► REGISTRATION_OPEN ──► REGISTRATION_CLOSED ──► HACKATHON_LIVE ──► SUBMISSION_CLOSED ──► JUDGING ──► COMPLETED ──► ARCHIVED
```

- **Draft Mode:** Organizer can freely edit all fields; hidden from public discovery.
- **Preview Mode:** Organizer reviews the participant-facing hackathon page before publishing.
- **Publish Rules:** Mandatory fields (name, banner, timeline dates, rules, prizes) must be filled before the publish action is unlocked.

---

## 4. Key Architectural Policies

### A. Submission Locking & Network Latency Protection
- Submissions are evaluated against server request receipt time, not file upload completion time.
- If a participant clicks submit before the deadline, the submission intent is locked immediately while large uploads continue in background.
- Once submitted, double-clicks are prevented with disabled button states and loading prompts.

### B. Submission Versioning
- Participants can update their submissions (v1, v2, v3) until the deadline.
- History is preserved for debugging and dispute resolution. Judges evaluate the latest valid version.

### C. Team Freeze Policy
- At `REGISTRATION_CLOSED`, all teams freeze automatically (no member additions, removals, or leader changes).
- Any exception requires explicit Organizer approval with audit reason logging.

### D. Hybrid Judging & Outlier Protection
- Submissions are automatically suggested to judges according to domain expertise and workload balance.
- Organizers retain manual override ability with audit logs.
- Extreme evaluation score disparities (e.g., 98, 97 vs 42) trigger a `Review Required` flag for Head Judge review.

### E. Change Management (Post-Publish)
- **Safe Changes:** Banner, FAQs, contact details (allowed anytime).
- **Sensitive Changes:** Deadlines, team size, prize pool (requires participant notification).
- **Locked Changes:** Competition theme, fundamental eligibility rules once participants join.

### F. Verifiable QR-Code Certificates
- Automated generation of Winner, Participant, and Judge certificates.
- Each certificate features a unique `Certificate_ID` and QR code resolving to a public validity verification page (`/verify/{id}`).

---

## 5. Technology Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy 2.0.
- **Database:** PostgreSQL.
- **Auth:** JWT (Access/Refresh Tokens), bcrypt hashing, Google OAuth.
- **Storage:** Local media directory (development) / S3 or Cloudflare R2 (production). Database stores file URLs/references only.
