# Project Requirements Document (PRD)
## BRI HR Consultancy Portal & Job Matching Platform

**Version:** 1.0  
**Date:** January 27, 2026  
**Status:** Draft  
**Document Owner:** BRI HR Consultancy

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Project Team | Initial draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Stakeholders](#3-stakeholders)
4. [User Roles & Personas](#4-user-roles--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [User Stories](#7-user-stories)
8. [System Features](#8-system-features)
9. [Technical Specifications](#9-technical-specifications)
10. [Success Metrics](#10-success-metrics)
11. [Assumptions & Constraints](#11-assumptions--constraints)
12. [Risks & Mitigation](#12-risks--mitigation)
13. [Project Timeline](#13-project-timeline)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Purpose
The BRI HR Consultancy Portal is a three-sided marketplace platform designed to streamline the recruitment process by connecting candidates with employers through AI-powered matching and HR consultant intermediation.

### 1.2 Problem Statement
Traditional recruitment processes are inefficient, with mismatched candidates, lengthy screening processes, and poor candidate-job fit. There is a need for an intelligent platform that automates candidate screening while maintaining human oversight through HR consultants.

### 1.3 Solution
A web-based platform that enables:
- Candidates to showcase skills and receive matched job opportunities
- Employers to post jobs and receive pre-screened candidates
- HR Consultants to efficiently manage candidate-job matching with AI assistance

### 1.4 Key Objectives
- Reduce time-to-hire by 50%
- Improve candidate-job match quality through AI-driven skill analysis
- Create a centralized candidate pool accessible to HR consultants
- Automate initial candidate screening and assessment

---

## 2. Project Overview

### 2.1 Project Scope

#### In Scope (MVP - Phase 1)
- User registration and authentication for all three roles
- Profile management for Candidates and Employers
- Job posting and management
- Manual candidate filtering and shortlisting
- Basic skill matching
- Application tracking system
- Email notifications
- Admin dashboard for HR consultants

#### Future Enhancements (Phase 2+)
- AI-based skill extraction from GitHub repositories
- Automated skill rating adjustment based on project analysis
- Advanced assessment engine with coding challenges
- Real-time chat/messaging between roles
- Analytics and reporting dashboards
- Integration with third-party job boards
- Mobile application
- Video interview scheduling

#### Out of Scope
- Payroll and onboarding management
- Background verification services
- Training and development modules
- Applicant Tracking System (ATS) integrations in Phase 1

### 2.2 Target Audience
- **Primary:** HR consultancies and recruitment firms
- **Secondary:** Small to medium enterprises (SMEs) seeking talent
- **Tertiary:** Job seekers across technology and business domains

---

## 3. Stakeholders

| Stakeholder | Role | Responsibility |
|-------------|------|----------------|
| Project Sponsor | Business Owner | Funding, strategic direction |
| Product Manager | Product Lead | Requirements, prioritization, roadmap |
| Development Team | Engineering | Build and deployment |
| QA Team | Quality Assurance | Testing and validation |
| UX/UI Designer | Design Lead | User experience and interface design |
| HR Consultants | End Users | Platform usage and feedback |
| Legal/Compliance | Advisor | Data privacy and regulatory compliance |

---

## 4. User Roles & Personas

### 4.1 Candidate (Job Seeker)
**Description:** Individuals seeking employment opportunities  
**Goals:**
- Find relevant job opportunities matching their skills
- Showcase portfolio and skills effectively
- Receive timely updates on application status

**Pain Points:**
- Applying to jobs that don't match their skills
- Not knowing what skills employers are looking for
- Lengthy application processes

### 4.2 Employer (Company/Recruiter)
**Description:** Organizations looking to hire talent  
**Goals:**
- Post job openings efficiently
- Receive qualified candidates quickly
- Reduce time spent on initial screening

**Pain Points:**
- Receiving hundreds of unqualified applications
- Difficulty in defining required skills accurately
- Lengthy hiring process

### 4.3 Admin (HR Consultant)
**Description:** HR professionals managing the recruitment process  
**Goals:**
- Efficiently match candidates to jobs
- Manage large candidate pools
- Track placement success rates

**Pain Points:**
- Manual candidate screening is time-consuming
- Difficulty in sorting candidates objectively
- Managing multiple job posts simultaneously

---

## 5. Functional Requirements

### 5.1 Authentication & User Management

| ID | Requirement | Priority | Role |
|----|-------------|----------|------|
| FR-001 | System shall support email-based registration | Must Have | All |
| FR-002 | System shall send verification emails upon registration | Must Have | All |
| FR-003 | System shall enforce email verification before account activation | Must Have | All |
| FR-004 | System shall support secure login with encrypted passwords | Must Have | All |
| FR-005 | System shall provide password reset functionality | Must Have | All |
| FR-006 | System shall support role-based access control (RBAC) | Must Have | All |

### 5.2 Candidate Features

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-101 | Candidate shall complete bio-data profile | Must Have | Name, contact, location, education |
| FR-102 | Candidate shall submit years of experience | Must Have | Total professional experience |
| FR-103 | Candidate shall add multiple skills | Must Have | Technology, tools, soft skills |
| FR-104 | Candidate shall self-rate skills (1-5 scale) | Must Have | Proficiency rating |
| FR-105 | Candidate shall submit portfolio via GitHub links | Must Have | Project repositories |
| FR-106 | System shall display AI-adjusted skill ratings | Should Have | Future enhancement |
| FR-107 | System shall extract skills from GitHub projects | Should Have | AI-powered analysis |
| FR-108 | Candidate shall view job recommendations | Must Have | Dashboard view |
| FR-109 | Candidate shall search available jobs | Must Have | Search and filter |
| FR-110 | Candidate shall apply to jobs sent by Admin | Must Have | Application submission |
| FR-111 | Candidate shall track application status | Must Have | Status tracking |
| FR-112 | Candidate shall complete assessments | Should Have | Skill validation |

### 5.3 Employer Features

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-201 | Employer shall complete company profile | Must Have | Company details, type, description |
| FR-202 | Employer shall create and post jobs | Must Have | Job creation workflow |
| FR-203 | Employer shall submit job descriptions | Must Have | Detailed JD with responsibilities |
| FR-204 | System shall suggest skills based on JD | Should Have | AI-powered skill extraction |
| FR-205 | Employer shall define required experience | Must Have | Years of experience needed |
| FR-206 | Employer shall specify required skills | Must Have | Technical and soft skills |
| FR-207 | Employer shall mark mandatory vs. preferred skills | Must Have | Skill prioritization |
| FR-208 | Employer shall receive shortlisted candidates | Must Have | Admin-curated list |
| FR-209 | Employer shall review candidate profiles | Must Have | Full profile access |
| FR-210 | Employer shall manage active job posts | Must Have | Edit, close, repost |

### 5.4 Admin (HR Consultant) Features

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-301 | Admin shall access complete candidate pool | Must Have | All registered candidates |
| FR-302 | Admin shall receive alerts for new job posts | Must Have | Real-time notifications |
| FR-303 | Admin shall filter candidates by skills | Must Have | Multi-select skill filter |
| FR-304 | Admin shall filter candidates by experience | Must Have | Min-max experience range |
| FR-305 | Admin shall filter candidates by skill rating | Should Have | Rating threshold |
| FR-306 | Admin shall sort candidates by experience | Must Have | Ascending/descending |
| FR-307 | Admin shall sort candidates by skill rating | Must Have | Highest to lowest |
| FR-308 | Admin shall sort candidates by match percentage | Should Have | Job-candidate fit score |
| FR-309 | Admin shall select and shortlist candidates | Must Have | Multi-select capability |
| FR-310 | Admin shall send job links to candidates | Must Have | Bulk email with job link |
| FR-311 | Admin shall track candidate responses | Must Have | Applied/rejected status |
| FR-312 | Admin shall create and send assessments | Should Have | Skill-based tests |
| FR-313 | Admin shall evaluate assessment results | Should Have | Scoring and review |
| FR-314 | Admin shall create final shortlist | Must Have | Top candidates selection |
| FR-315 | Admin shall send shortlist to employers | Must Have | Candidate recommendations |

### 5.5 Job Management

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-401 | System shall store job posts with metadata | Must Have | Title, description, requirements |
| FR-402 | System shall track job post status | Must Have | Active, filled, closed |
| FR-403 | System shall link jobs to applications | Must Have | Relationship tracking |
| FR-404 | System shall support job search | Must Have | Keyword and filter search |
| FR-405 | System shall display job post date | Must Have | Posting timestamp |

### 5.6 Application Management

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-501 | System shall record application submissions | Must Have | Timestamp and metadata |
| FR-502 | System shall track application status | Must Have | Applied, shortlisted, rejected |
| FR-503 | System shall prevent duplicate applications | Must Have | One application per job |
| FR-504 | System shall link applications to assessments | Should Have | Assessment tracking |

### 5.7 Notifications

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-601 | System shall send email verification | Must Have | Upon registration |
| FR-602 | System shall notify Admin of new job posts | Must Have | Real-time alert |
| FR-603 | System shall notify Candidate of job invitations | Must Have | Email notification |
| FR-604 | System shall notify Employer of shortlist | Must Have | Email with candidate list |
| FR-605 | System shall send application status updates | Should Have | Status change notifications |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | < 3 seconds |
| NFR-002 | API response time | < 500ms for 95% of requests |
| NFR-003 | Database query optimization | < 100ms for standard queries |
| NFR-004 | Concurrent user support | 1,000+ simultaneous users |

### 6.2 Security

| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-101 | Password encryption | bcrypt with salt |
| NFR-102 | Data transmission | HTTPS/TLS 1.3 |
| NFR-103 | Data storage encryption | AES-256 |
| NFR-104 | Session management | JWT with expiration |
| NFR-105 | SQL injection prevention | Parameterized queries |
| NFR-106 | XSS protection | Input sanitization |
| NFR-107 | CSRF protection | Token-based validation |

### 6.3 Scalability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-201 | Horizontal scaling | Cloud-based auto-scaling |
| NFR-202 | Database sharding | Support for distributed data |
| NFR-203 | CDN integration | Static asset delivery |
| NFR-204 | Caching strategy | Redis for session and data caching |

### 6.4 Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-301 | System uptime | 99.5% availability |
| NFR-302 | Backup frequency | Daily automated backups |
| NFR-303 | Disaster recovery | < 4 hours RTO |
| NFR-304 | Data retention | 7 years minimum |

### 6.5 Usability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-401 | Responsive design | Mobile, tablet, desktop support |
| NFR-402 | Browser compatibility | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-403 | Accessibility | WCAG 2.1 Level AA compliance |
| NFR-404 | User onboarding | Guided tour for first-time users |

### 6.6 Compliance

| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-501 | Data privacy | GDPR compliant |
| NFR-502 | Data protection | ISO 27001 guidelines |
| NFR-503 | Audit logging | All user actions logged |
| NFR-504 | Right to erasure | Account deletion capability |

---

## 7. User Stories

### 7.1 Candidate Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-001 | As a Candidate, I want to register with my email so that I can create a profile | - Email validation sent<br>- Account created upon verification<br>- Login successful | Must Have |
| US-002 | As a Candidate, I want to add my skills and rate them so that employers know my expertise | - Multiple skills can be added<br>- Rating scale 1-5 displayed<br>- Skills saved to profile | Must Have |
| US-003 | As a Candidate, I want to link my GitHub profile so that I can showcase my projects | - GitHub URL validated<br>- Link stored in profile<br>- Future: Skills extracted | Must Have |
| US-004 | As a Candidate, I want to see jobs that match my skills so that I apply to relevant positions | - Job recommendations displayed<br>- Match percentage shown<br>- Apply button available | Must Have |
| US-005 | As a Candidate, I want to track my application status so that I know where I stand | - Status visible in dashboard<br>- Notifications on status change<br>- Timeline view of progress | Should Have |

### 7.2 Employer Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-101 | As an Employer, I want to post a job with requirements so that I can receive qualified candidates | - Job form with all fields<br>- JD upload capability<br>- Skills auto-suggested | Must Have |
| US-102 | As an Employer, I want to mark skills as mandatory so that candidates meet minimum requirements | - Checkbox for mandatory skills<br>- Filtering based on mandatory skills<br>- Visual distinction in UI | Must Have |
| US-103 | As an Employer, I want to receive shortlisted candidates so that I can focus on interviewing | - List of pre-screened candidates<br>- Detailed profiles accessible<br>- Match scores displayed | Must Have |
| US-104 | As an Employer, I want to manage my job posts so that I can keep them updated | - Edit job details<br>- Close/reopen jobs<br>- View application count | Must Have |

### 7.3 Admin Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-201 | As an Admin, I want to filter candidates by skills and experience so that I can find the best matches | - Multi-select skill filter<br>- Experience range slider<br>- Results update in real-time | Must Have |
| US-202 | As an Admin, I want to sort candidates by different criteria so that I can prioritize them | - Sort by experience, rating, match %<br>- Ascending/descending toggle<br>- Sorted list persists | Must Have |
| US-203 | As an Admin, I want to send job invitations to selected candidates so that they can apply | - Bulk selection capability<br>- Email template customization<br>- Delivery confirmation | Must Have |
| US-204 | As an Admin, I want to track candidate responses so that I know who is interested | - Applied/rejected status<br>- Response rate metrics<br>- Follow-up reminders | Must Have |
| US-205 | As an Admin, I want to send assessments to candidates so that I can validate their skills | - Assessment creation interface<br>- Automated sending<br>- Results dashboard | Should Have |

---

## 8. System Features

### 8.1 Feature Matrix (MoSCoW Prioritization)

| Feature | Must Have | Should Have | Could Have | Won't Have (MVP) |
|---------|-----------|-------------|------------|------------------|
| User Registration & Auth | ✓ | | | |
| Email Verification | ✓ | | | |
| Candidate Profile Management | ✓ | | | |
| Employer Profile Management | ✓ | | | |
| Job Posting | ✓ | | | |
| Manual Skill Entry | ✓ | | | |
| Skill Self-Rating | ✓ | | | |
| GitHub Link Storage | ✓ | | | |
| AI Skill Extraction | | ✓ | | |
| AI Rating Adjustment | | ✓ | | |
| Job Search | ✓ | | | |
| Candidate Filtering | ✓ | | | |
| Candidate Sorting | ✓ | | | |
| Job Invitation System | ✓ | | | |
| Application Tracking | ✓ | | | |
| Assessment Engine | | ✓ | | |
| Email Notifications | ✓ | | | |
| In-app Messaging | | | ✓ | |
| Analytics Dashboard | | | ✓ | |
| Video Interview | | | | ✓ |
| Background Verification | | | | ✓ |
| Mobile App | | | | ✓ |

### 8.2 Feature Descriptions

#### 8.2.1 Intelligent Job Matching (Future)
- **Description:** AI-powered algorithm that calculates match percentage between candidate skills and job requirements
- **Components:**
  - Skill similarity scoring
  - Experience weighting
  - Mandatory skill enforcement
  - Match percentage calculation (0-100%)
- **Priority:** Should Have (Phase 2)

#### 8.2.2 Assessment Engine (Future)
- **Description:** Create and administer skill assessments to validate candidate capabilities
- **Components:**
  - Question bank management
  - Multiple question types (MCQ, coding, descriptive)
  - Automated scoring
  - Time limits
  - Proctoring capabilities
- **Priority:** Should Have (Phase 2)

#### 8.2.3 GitHub Skills Extraction (Future)
- **Description:** Analyze GitHub repositories to extract technologies and tools used
- **Components:**
  - Repository crawling
  - Language detection
  - Framework identification
  - Project complexity scoring
- **Priority:** Should Have (Phase 2)

---

## 9. Technical Specifications

### 9.1 Technology Stack (Recommended)

#### Frontend
- **Framework:** React.js 18+ or Next.js 14+
- **State Management:** Redux Toolkit or Zustand
- **UI Library:** Material-UI or Tailwind CSS + Shadcn/ui
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios or Fetch API

#### Backend
- **Runtime:** Node.js 20+ (LTS)
- **Framework:** Express.js or NestJS
- **Language:** TypeScript
- **API Design:** RESTful API or GraphQL

#### Database
- **Primary Database:** PostgreSQL 15+
- **Schema Design:** Relational with proper indexing
- **ORM:** Prisma or TypeORM
- **Caching:** Redis 7+

#### Authentication
- **Strategy:** JWT (JSON Web Tokens)
- **Library:** Passport.js or Auth0
- **Password Hashing:** bcrypt

#### File Storage
- **Service:** AWS S3 or Cloudinary
- **Use Cases:** Profile pictures, resumes, portfolios

#### Email Service
- **Provider:** SendGrid, AWS SES, or Mailgun
- **Templates:** Handlebars or React Email

#### AI/ML (Future)
- **Platform:** OpenAI API or Hugging Face
- **Use Cases:** Skill extraction, JD parsing, match scoring

#### Hosting & DevOps
- **Platform:** AWS, Google Cloud, or Azure
- **Containerization:** Docker
- **Orchestration:** Kubernetes (optional)
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Sentry, New Relic, or DataDog

### 9.2 Database Schema (High-Level)

#### Core Tables
1. **users** - All user accounts (with role field)
2. **candidates** - Candidate-specific profile data
3. **employers** - Employer/company profile data
4. **admins** - HR consultant profile data
5. **skills** - Master skill list
6. **candidate_skills** - Candidate skill associations with ratings
7. **job_posts** - Job listings
8. **job_skills** - Required skills for jobs
9. **applications** - Job applications
10. **assessments** - Assessment definitions
11. **assessment_results** - Candidate assessment scores
12. **shortlists** - Admin-created candidate shortlists
13. **notifications** - System notifications

### 9.3 API Endpoints (Sample)

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset

#### Candidates
- `GET /api/candidates/profile` - Get candidate profile
- `PUT /api/candidates/profile` - Update profile
- `POST /api/candidates/skills` - Add skills
- `GET /api/candidates/jobs` - Get recommended jobs
- `POST /api/candidates/apply/:jobId` - Apply to job

#### Employers
- `POST /api/employers/jobs` - Create job post
- `GET /api/employers/jobs` - Get all jobs
- `PUT /api/employers/jobs/:id` - Update job
- `GET /api/employers/shortlist/:jobId` - Get shortlisted candidates

#### Admin
- `GET /api/admin/candidates` - Get candidate pool (with filters)
- `GET /api/admin/jobs` - Get all job posts
- `POST /api/admin/shortlist` - Create shortlist
- `POST /api/admin/invite` - Send job invitations
- `POST /api/admin/assessment` - Create assessment

---
## 11. Assumptions & Constraints

### 11.1 Assumptions
1. Users have access to email for verification
2. Candidates have basic technical skills to use the platform
3. Employers can articulate job requirements clearly
4. HR consultants have domain expertise in recruitment
5. GitHub API access is available for future features
6. Third-party AI services are accessible and affordable
