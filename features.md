# BRI HR Portal - MVP Feature Document

## 8 Essential Features Only

**Version:** 1.0 - Simplified MVP  
**Timeline:** 6-8 Weeks  
**Date:** January 27, 2026

---

## Product Vision

A streamlined HR consultancy platform connecting candidates with employers through skilled HR consultants who manually match, filter, and recommend talent.

---

## Core User Flows

```
┌─────────────┐
│  CANDIDATE  │  Signup → Build Profile → Get Notified → Apply to Jobs
└─────────────┘

┌─────────────┐
│  EMPLOYER   │  Signup → Post Jobs → Receive Shortlist → Review Candidates
└─────────────┘

┌─────────────┐
│    ADMIN    │  Filter Pool → Send Job Notifications → Create Shortlist
└─────────────┘
```

---

## Feature Breakdown

### Feature 1: User Authentication

**Priority:** P0 (Must Have)

**Description:**  
Simple email/password registration and login for three user types.

**User Stories:**

- As a user, I want to sign up with email and password
- As a user, I want to verify my email before accessing the platform
- As a user, I want to log in securely

**Acceptance Criteria:**

- ✓ Registration form with email, password, role selection
- ✓ Email verification link sent on signup
- ✓ User cannot login until email is verified
- ✓ Password must be 8+ characters
- ✓ Secure password storage (bcrypt hashing)

**Database:**

```
users
  - email (unique)
  - password (hashed)
  - role (candidate/employer/admin)
  - isEmailVerified (boolean)
  - createdAt
```

**API Endpoints:**

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/login`

---

### Feature 2: Candidate Profile & Skills

**Priority:** P0 (Must Have)

**Description:**  
Candidates create their profile with work experience and skill ratings.

**User Stories:**

- As a candidate, I want to add my basic information
- As a candidate, I want to list my skills and rate my proficiency
- As a candidate, I want to add my GitHub profile link

**Acceptance Criteria:**

- ✓ Profile form: firstName, lastName, phone, location, bio
- ✓ Years of experience field (number)
- ✓ Add multiple skills with search/autocomplete
- ✓ Self-rate each skill from 1-5 stars
- ✓ Add GitHub URL (optional)
- ✓ Profile completeness indicator (%)

**Database:**

```
candidates
  - userId (ref: users)
  - firstName, lastName
  - phone, location
  - bio
  - yearsOfExperience
  - githubUrl
  - profileCompleteness (calculated)

candidate_skills
  - candidateId
  - skillName
  - selfRating (1-5)
```

**API Endpoints:**

- `GET /api/candidates/profile`
- `PUT /api/candidates/profile`
- `POST /api/candidates/skills`
- `DELETE /api/candidates/skills/:skillId`

**UI Components:**

- Profile form (text inputs)
- Skills manager (add/remove with rating slider)
- Progress bar for profile completion

---

### Feature 3: Employer Job Posting

**Priority:** P0 (Must Have)

**Description:**  
Employers create job listings with skill requirements and experience needs.

**User Stories:**

- As an employer, I want to post a job with detailed requirements
- As an employer, I want to specify which skills are mandatory
- As an employer, I want to set minimum experience required

**Acceptance Criteria:**

- ✓ Job form: title, description, responsibilities
- ✓ Add required skills (search from skill database)
- ✓ Mark skills as mandatory or preferred
- ✓ Set minimum years of experience
- ✓ Set job type (full-time, contract, remote)
- ✓ Publish job (status: active)

**Database:**

```
employers
  - userId (ref: users)
  - companyName
  - companyType
  - description
  - website
  - location

jobs
  - employerId (ref: employers)
  - title
  - description
  - responsibilities (array)
  - experienceRequired (min, max)
  - jobType
  - workMode (remote/hybrid/onsite)
  - location
  - status (active/paused/closed)
  - postedAt

job_skills
  - jobId
  - skillName
  - isMandatory (boolean)
```

**API Endpoints:**

- `POST /api/employers/jobs`
- `GET /api/employers/jobs`
- `PUT /api/employers/jobs/:id`
- `PATCH /api/employers/jobs/:id/status`

**UI Components:**

- Multi-step job posting form
- Skill selector with mandatory toggle
- Experience range input
- Job preview before publish

---

### Feature 4: Candidate Job Browse & Apply

**Priority:** P0 (Must Have)

**Description:**  
Candidates view available jobs and submit applications.

**User Stories:**

- As a candidate, I want to see all available jobs
- As a candidate, I want to search and filter jobs
- As a candidate, I want to apply to jobs with one click
- As a candidate, I want to track my application status

**Acceptance Criteria:**

- ✓ List all active jobs
- ✓ Search by job title
- ✓ Filter by: job type, location, experience level
- ✓ Show match score (% of required skills candidate has)
- ✓ One-click apply (no cover letter needed for MVP)
- ✓ Cannot apply to same job twice
- ✓ View application status (Applied, Shortlisted, Rejected)

**Database:**

```
applications
  - candidateId (ref: candidates)
  - jobId (ref: jobs)
  - status (invited/applied/shortlisted/rejected)
  - matchScore (0-100)
  - appliedAt
  - invitedBy (ref: users - admin who sent notification)
  - createdAt
```

**API Endpoints:**

- `GET /api/candidates/jobs` (all jobs + match scores)
- `POST /api/candidates/jobs/:jobId/apply`
- `GET /api/candidates/applications` (my applications)

**UI Components:**

- Job list with cards
- Search bar and filter panel
- Match score badge (color-coded)
- Apply button (disabled if already applied)
- Application tracker page

**Match Score Calculation:**

```
Simple Formula:
- Count how many required skills candidate has
- Mandatory skills must be present (or score = 0)
- Score = (matched skills / total required skills) × 100

Example:
Job requires: React (M), Node.js (M), MongoDB
Candidate has: React, Node.js, MongoDB
Score = 75% (3 out of 4, has both mandatory)
```

---

### Feature 5: Admin Candidate Pool & Filtering

**Priority:** P0 (Must Have)

**Description:**  
HR Admin views all candidates and filters by skills and experience.

**User Stories:**

- As an admin, I want to see all registered candidates
- As an admin, I want to filter candidates by specific skills
- As an admin, I want to filter by years of experience
- As an admin, I want to sort candidates by experience or skill rating

**Acceptance Criteria:**

- ✓ Table view of all candidates
- ✓ Display: name, experience, top 3 skills, location
- ✓ Multi-select skill filter
- ✓ Experience range filter (min-max slider)
- ✓ Sort by: years of experience, average skill rating
- ✓ Pagination (20 candidates per page)
- ✓ Click candidate to view full profile

**Database:**

```
No new tables - queries existing candidates and candidate_skills
```

**API Endpoints:**

- `GET /api/admin/candidates?skills=React,Node&expMin=2&expMax=5&sort=experience&page=1`

**UI Components:**

- Candidate table with sortable columns
- Filter sidebar with:
  - Skill multi-select dropdown
  - Experience range slider
  - Clear filters button
- Candidate detail modal/page

**Filter Logic:**

```typescript
// Candidates must have ALL selected skills
// Experience must be within min-max range
// Sort by specified field

Example Query:
Skills: [React, Node.js]
Experience: 2-5 years
→ Returns candidates with React AND Node.js AND 2-5 years exp
```

---

### Feature 6: Admin Job Notifications to Candidates

**Priority:** P0 (Must Have)

**Description:**  
Admin sends job opportunities to selected candidates via in-app notifications.

**User Stories:**

- As an admin, I want to send job opportunities to specific candidates
- As a candidate, I want to see job notifications in my dashboard
- As a candidate, I want to view job details from the notification
- As an admin, I want to track which candidates have viewed/applied

**Acceptance Criteria:**

- ✓ Admin selects multiple candidates from filtered list
- ✓ Admin selects a job to send
- ✓ System creates notification for each candidate
- ✓ Candidates see notification count in navbar
- ✓ Notification includes: job title, company, match score
- ✓ Click notification → view job details → apply
- ✓ Notification marked as "read" when clicked
- ✓ Admin sees tracking: sent, viewed, applied

**Database:**

```
notifications
  - userId (ref: users)
  - type (job_invitation/application_update)
  - title
  - message
  - jobId (ref: jobs)
  - isRead (boolean)
  - createdAt

applications (auto-created when notification sent)
  - status = 'invited'
  - invitedBy = adminId
```

**API Endpoints:**

- `POST /api/admin/send-job-notifications`
  - Body: { jobId, candidateIds[] }
- `GET /api/candidates/notifications`
- `PATCH /api/candidates/notifications/:id/read`
- `GET /api/admin/job-invitations/:jobId/stats`

**UI Components:**

- Admin: Candidate selection checkboxes + "Send Job" button
- Candidate: Notification bell icon with unread count
- Candidate: Notification dropdown/page with job cards
- Admin: Invitation tracking dashboard

**Notification Flow:**

```
1. Admin filters candidates → selects 5 candidates
2. Admin clicks "Send Job Notification"
3. System creates:
   - 5 notifications (job_invitation type)
   - 5 application records (status: invited)
4. Candidates see notification bell (5 unread)
5. Candidate clicks → sees job → clicks "Apply"
6. Application status: invited → applied
7. Admin sees: 5 invited, 3 viewed, 2 applied
```

---

### Feature 7: Admin Create Shortlist

**Priority:** P0 (Must Have)

**Description:**  
Admin selects top candidates for a job and creates a final shortlist.

**User Stories:**

- As an admin, I want to select the best candidates who applied
- As an admin, I want to add notes about each candidate
- As an admin, I want to send the shortlist to the employer

**Acceptance Criteria:**

- ✓ View all candidates who applied to a specific job
- ✓ Select 3-5 top candidates
- ✓ Add notes/comments for each candidate
- ✓ Rank candidates (drag-and-drop ordering)
- ✓ Create shortlist (saves to database)
- ✓ Employer receives notification about new shortlist

**Database:**

```
shortlists
  - jobId (ref: jobs)
  - createdBy (ref: users - admin)
  - candidates (array of objects)
    - candidateId
    - applicationId
    - matchScore
    - notes
    - ranking
  - status (draft/sent)
  - sentAt
  - createdAt

applications (update status)
  - status → 'shortlisted' for selected candidates
  - status → 'not_selected' for others
```

**API Endpoints:**

- `GET /api/admin/jobs/:jobId/applications` (all who applied)
- `POST /api/admin/shortlists`
  - Body: { jobId, candidates: [{ candidateId, notes, ranking }] }
- `GET /api/admin/shortlists/:jobId`

**UI Components:**

- Application list for a job
- Candidate selection checkboxes
- Notes textarea for each candidate
- Drag-and-drop ranking interface
- "Create Shortlist" button

**Workflow:**

```
1. Admin views Job X → sees 20 applications
2. Admin reviews profiles and match scores
3. Admin selects top 5 candidates
4. Admin adds notes: "Strong React skills, good culture fit"
5. Admin ranks them: 1-5
6. Admin clicks "Create Shortlist"
7. System:
   - Creates shortlist record
   - Updates application status → shortlisted
   - Creates notification for employer
```

---

### Feature 8: Employer View Shortlist

**Priority:** P0 (Must Have)

**Description:**  
Employer reviews the admin-curated list of recommended candidates.

**User Stories:**

- As an employer, I want to see shortlisted candidates for my job
- As an employer, I want to view full candidate profiles
- As an employer, I want to see admin notes and rankings
- As an employer, I want to download candidate contact information

**Acceptance Criteria:**

- ✓ Notification when shortlist is ready
- ✓ View shortlist with candidate cards
- ✓ See: name, experience, skills, match score
- ✓ See admin notes and ranking
- ✓ Click to view full candidate profile
- ✓ See contact information (email, phone)
- ✓ Mark candidates as "Interview Scheduled" or "Rejected"

**Database:**

```
No new tables - reads from shortlists
```

**API Endpoints:**

- `GET /api/employers/jobs/:jobId/shortlist`
- `PATCH /api/employers/applications/:id/status`
  - Body: { status: 'interview_scheduled' | 'rejected' }

**UI Components:**

- Shortlist page with ranked candidate cards
- Candidate profile modal/page
- Admin notes section (read-only)
- Action buttons: "Schedule Interview" / "Reject"
- Contact info display (email, phone)

**Display:**

```
Job: Senior React Developer
Shortlist created by: Admin Name
Date: Jan 27, 2026

Rank 1: John Doe
  - 5 years experience | 92% match
  - Skills: React ⭐⭐⭐⭐⭐, Node.js ⭐⭐⭐⭐, AWS ⭐⭐⭐
  - Admin Note: "Excellent portfolio, strong communication"
  - Contact: john@email.com | +1-555-0123
  - [View Full Profile] [Schedule Interview]

Rank 2: Jane Smith
  - 3 years experience | 88% match
  ...
```

---

## Simplified Data Model

### Core Tables (5 Only)

```
users
├── candidates (1-to-1)
│   └── candidate_skills (1-to-many)
├── employers (1-to-1)
│   └── jobs (1-to-many)
│       └── job_skills (1-to-many)
└── admins (1-to-1)

Cross-cutting:
- applications (many-to-many: candidates ↔ jobs)
- notifications (1-to-many from users)
- shortlists (per job, references candidates)
```

### Relationships

```
User → Candidate → Skills
User → Employer → Jobs → Required Skills
User → Notifications

Candidate + Job → Application
Job + Applications → Shortlist
```

---

## Technology Stack (Minimal)

### Frontend

- **Framework:** React 18 + TypeScript + Vite
- **Routing:** React Router v6
- **UI:** Tailwind CSS + Shadcn/ui components
- **Forms:** React Hook Form + Zod
- **State:** Zustand (lightweight)
- **API:** Axios

### Backend

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** Express Validator
- **Email:** Nodemailer or SendGrid

### Infrastructure

- **Database:** MongoDB Atlas (cloud)
- **Hosting:** Vercel (frontend) + Render/Railway (backend)
- **Email:** SendGrid free tier (100 emails/day)

---

## MVP Success Criteria

After 6-8 weeks, the platform should enable:

✅ Candidates can register, build profiles, and apply to jobs  
✅ Employers can post jobs and receive shortlisted candidates  
✅ Admins can filter candidates and match them to jobs  
✅ Complete workflow: Job Post → Candidate Apply → Admin Shortlist → Employer Review

**Metrics to Track:**

- User registrations (target: 50 candidates, 10 employers)
- Jobs posted (target: 20 active jobs)
- Applications submitted (target: 100)
- Shortlists created (target: 10)
- Time from job post to shortlist (target: < 48 hours)

---

## What We Cut (Phase 2)

These features are **NOT** in MVP but can be added later:

❌ AI skill extraction from GitHub repositories  
❌ Automated skill rating adjustments  
❌ Assessment/testing system  
❌ In-app chat/messaging  
❌ Analytics dashboards  
❌ Resume upload and parsing  
❌ Advanced matching algorithms  
❌ Email notifications (only in-app for MVP)  
❌ Candidate recommendations (manual only)  
❌ Interview scheduling tool  
❌ Feedback and ratings

---

## Development Timeline

### Week 1-2: Foundation

- [ ] Setup project structure
- [ ] User authentication system
- [ ] Database schema setup
- [ ] Basic UI layouts

### Week 3: Candidate Module

- [ ] Profile creation
- [ ] Skills management
- [ ] Job browsing

### Week 4: Employer Module

- [ ] Company profile
- [ ] Job posting
- [ ] Job management

### Week 5: Application System

- [ ] Application submission
- [ ] Application tracking
- [ ] Match score calculation

### Week 6: Admin Module

- [ ] Candidate filtering
- [ ] Notification system
- [ ] Shortlist creation

### Week 7: Employer Shortlist

- [ ] Shortlist viewing
- [ ] Candidate profile access
- [ ] Contact information

### Week 8: Testing & Launch

- [ ] Bug fixes
- [ ] Performance optimization
- [ ] User testing
- [ ] Deployment

---

## Key Simplifications from Full Spec

| Original                           | Simplified                         |
| ---------------------------------- | ---------------------------------- |
| Email notifications for everything | Only for registration verification |
| Complex assessment system          | Manual shortlisting only           |
| AI-powered skill matching          | Simple percentage matching         |
| Advanced analytics                 | Basic status tracking              |
| Multi-step application             | One-click apply                    |
| Portfolio analysis                 | Just store GitHub link             |
| Chat system                        | No communication (out of scope)    |
| 9 database tables                  | 5 core tables                      |

---

## Risk Mitigation

**Risk:** Admins spend too much time filtering  
**Mitigation:** Good filter UX, match score automation

**Risk:** Candidates don't complete profiles  
**Mitigation:** Profile completeness indicator, required fields

**Risk:** Employers don't post enough jobs  
**Mitigation:** Simple job posting flow, templates

**Risk:** Poor candidate-job matches  
**Mitigation:** Clear skill requirements, match score visibility

---

## Next Steps

1. **Review & Approve** this simplified scope
2. **Setup Development Environment**
3. **Create Low-Fidelity Wireframes** for 8 core screens
4. **Begin Week 1 Development** (Auth + Database)
5. **Weekly Progress Reviews**

---

**Document End**

_Focus on these 8 features. Nothing else. Ship fast, iterate later._
