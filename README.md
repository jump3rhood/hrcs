# BRI HR Consultancy Portal

A full-stack, three-sided marketplace platform connecting **candidates**, **employers**, and **HR consultants (admins)** through a streamlined recruitment workflow.

---

## Overview

The BRI HR Portal enables HR consultants to act as intelligent intermediaries — filtering and matching candidates to job openings, then delivering curated shortlists to employers. Candidates manage their skills and track applications; employers post jobs and review shortlisted talent.

### Core Workflow

```
Candidate  →  Build Profile & Skills
Employer   →  Post Job with Requirements
Admin      →  Filter Candidates → Send Notifications → Create Shortlist
Employer   →  Review Shortlist → Schedule Interviews
```

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Recoil | Global state management |
| Tailwind CSS + Shadcn/ui | Styling & component library |
| React Hook Form + Zod | Forms & validation |
| Axios | HTTP client |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js 20 + Express.js | Server runtime & framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication & password hashing |
| express-validator | Request validation |
| Nodemailer / SendGrid | Email delivery |
| Helmet + CORS + rate-limit | Security middleware |

---

## Project Structure

```
hrcs/
├── backend/
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/    # Route handler logic
│       │   ├── adminController.ts
│       │   ├── authController.ts
│       │   ├── candidateController.ts
│       │   └── employerController.ts
│       ├── middleware/     # Auth, roles, validation
│       ├── models/         # Mongoose schemas
│       │   ├── User.ts
│       │   ├── Candidate.ts
│       │   ├── CandidateSkill.ts
│       │   ├── Employer.ts
│       │   ├── Job.ts
│       │   ├── Application.ts
│       │   ├── Shortlist.ts
│       │   └── Notification.ts
│       ├── routes/         # Express routers
│       ├── utils/          # Email helpers
│       ├── seed.ts         # Dev data seeder
│       ├── seedAdmin.ts    # Admin account seeder
│       └── index.ts        # App entry point
└── frontend/
    └── src/
        ├── api/            # Axios API functions
        ├── components/     # Shared UI components
        │   └── ui/         # Shadcn/ui primitives
        ├── hooks/          # Custom React hooks
        ├── pages/
        │   ├── admin/      # Admin (HR Consultant) pages
        │   ├── candidate/  # Candidate pages
        │   └── employer/   # Employer pages
        ├── recoil/         # Recoil atoms (auth state)
        ├── types/          # Shared TypeScript types
        └── App.tsx         # Route definitions
```

---

## Features

### Authentication (All Roles)
- Email/password registration with role selection (`candidate`, `employer`, `admin`)
- Email verification before account activation
- JWT-based login with role-based access control (RBAC)
- Protected routes per role

### Candidate
- Build and update profile (name, location, bio, years of experience, GitHub link)
- Add skills with self-ratings (1–5 scale)
- Browse active job listings with skill match scores
- View job details and apply with one click (duplicate prevention)
- Track application statuses (`invited`, `applied`, `shortlisted`, `rejected`)
- Receive in-app job notifications from admins

### Employer
- Complete company profile (name, type, website, location, description)
- Create and manage job postings (title, description, responsibilities, type, work mode)
- Specify required skills with mandatory/preferred flags and minimum experience
- Edit, pause, or close job listings
- View admin-created shortlists of pre-screened candidates
- Update candidate interview status (`interview_scheduled`, `rejected`)
- Receive in-app notifications when a shortlist is ready

### Admin (HR Consultant)
- Separate admin login page
- View the full candidate pool with filterable/sortable table
  - Filter by skills (multi-select), experience range
  - Sort by experience or average skill rating
- Select candidates and send job notifications in bulk
- View all applicants per job with match scores
- Create ranked shortlists with per-candidate notes
- Track notification stats (invited, viewed, applied)

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT |
| GET | `/verify-email` | Verify email via token |

### Candidates — `/api/candidates`
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | Get or update candidate profile |
| GET/POST/DELETE | `/skills` | Manage candidate skills |
| GET | `/jobs` | Browse jobs with match scores |
| GET | `/jobs/:jobId` | Get job details |
| POST | `/jobs/:jobId/apply` | Apply to a job |
| GET | `/applications` | List my applications |
| GET | `/notifications` | List my notifications |
| PATCH | `/notifications/:id/read` | Mark notification as read |

### Employers — `/api/employers`
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | Get or update employer profile |
| GET/POST | `/jobs` | List or create jobs |
| GET/PUT | `/jobs/:id` | Get or update a job |
| PATCH | `/jobs/:id/status` | Change job status |
| GET | `/jobs/:jobId/shortlist` | View shortlist for a job |
| PATCH | `/applications/:id/status` | Update interview status |
| GET | `/notifications` | List employer notifications |

### Admin — `/api/admin`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/candidates` | Get filtered/sorted candidate pool |
| GET | `/candidates/:id` | Get full candidate profile |
| GET | `/jobs` | List all jobs |
| GET | `/jobs/:jobId/applications` | Get applicants for a job |
| POST | `/send-job-notifications` | Send job invites to candidates |
| POST | `/shortlists` | Create a shortlist |
| GET | `/shortlists/:jobId` | Get shortlist for a job |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- A SendGrid API key (or SMTP credentials for Nodemailer)

### Environment Variables

**Backend** — create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bri-hr
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SENDGRID_API_KEY=your-sendgrid-key
SENDER_EMAIL=noreply@brihr.com
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=BRI HR Portal
```

### Installation & Development

```bash
# Install all dependencies (root, frontend, backend)
npm install

# Run frontend and backend concurrently
npm run dev
```

Or run each separately:

```bash
# Backend (http://localhost:5000)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### Seed Data

```bash
# Seed sample candidates, employers, and jobs
cd backend && npx ts-node src/seed.ts

# Create an admin account
cd backend && npx ts-node src/seedAdmin.ts
```

---

## Data Models

```
User ──────────── Candidate ─── CandidateSkill[]
     │
     ├─────────── Employer  ─── Job[] ─── (job skills embedded)
     │
     └─────────── Admin

Application  (Candidate ↔ Job, tracks status & match score)
Notification (User ← job invitations & status updates)
Shortlist    (Job ← ranked Candidate[] with admin notes)
```

---

## Roadmap (Phase 2)

- AI-powered skill extraction from GitHub repositories
- Automated skill rating adjustment based on project analysis
- Assessment / coding challenge engine
- Advanced analytics dashboard
- In-app messaging between roles
- Resume upload and parsing
- Interview scheduling integration
- Mobile application

---

## Documentation

- [`brd-job-portal.md`](brd-job-portal.md) — Full Business Requirements Document
- [`features.md`](features.md) — MVP feature breakdown with acceptance criteria
- [`tech-specs.md`](tech-specs.md) — Technology stack details and environment setup
