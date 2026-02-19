export type Role = 'candidate' | 'employer' | 'admin';

export interface User {
  _id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface CandidateProfile {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  yearsOfExperience: number;
  githubUrl?: string;
}

export interface CandidateSkill {
  _id: string;
  candidateId: string;
  skillName: string;
  rating: number;
}

export interface EmployerProfile {
  _id: string;
  user: string;
  companyName: string;
  industry: string;
  website?: string;
  description?: string;
}

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export interface JobSkill {
  skillName: string;
  required: boolean;
}

export interface Job {
  _id: string;
  employer: string | EmployerProfile;
  title: string;
  description: string;
  responsibilities: string;
  jobType: JobType;
  workMode: WorkMode;
  location: string;
  experienceMin: number;
  experienceMax: number;
  skills: JobSkill[];
  status: JobStatus;
  createdAt: string;
}

export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected' | 'invited' | 'interview_scheduled';

export interface Application {
  _id: string;
  candidate: string | CandidateProfile;
  job: string | Job;
  status: ApplicationStatus;
  matchScore: number;
  adminNotes?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  jobId?: string;
  matchScore?: number;
  isRead: boolean;
  createdAt: string;
}

export interface ShortlistEntry {
  applicationId: string | Application;
  rank: number;
  notes: string;
}

export interface Shortlist {
  _id: string;
  jobId: string | Job;
  adminId: string;
  candidates: ShortlistEntry[];
  createdAt: string;
}
