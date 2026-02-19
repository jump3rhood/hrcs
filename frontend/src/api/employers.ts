import api from '@/lib/axios';
import type { EmployerProfile, Job, JobStatus } from '@/types';

export interface JobPayload {
  title: string;
  description: string;
  responsibilities?: string;
  jobType: string;
  workMode: string;
  location?: string;
  experienceMin?: number;
  experienceMax?: number;
  skills?: { skillName: string; required: boolean }[];
}

export const employerApi = {
  getProfile: () => api.get<EmployerProfile>('/employers/profile'),
  updateProfile: (data: Partial<EmployerProfile>) =>
    api.put<EmployerProfile>('/employers/profile', data),
  getJobs: () => api.get<Job[]>('/employers/jobs'),
  createJob: (data: JobPayload) => api.post<Job>('/employers/jobs', data),
  updateJob: (id: string, data: JobPayload) => api.put<Job>(`/employers/jobs/${id}`, data),
  updateJobStatus: (id: string, status: JobStatus) =>
    api.patch<Job>(`/employers/jobs/${id}/status`, { status }),
  getShortlist: (jobId: string) => api.get(`/employers/jobs/${jobId}/shortlist`),
  getJobApplicants: (jobId: string) => api.get(`/employers/jobs/${jobId}/applicants`),
  updateApplicationStatus: (applicationId: string, status: string) =>
    api.patch(`/employers/applications/${applicationId}/status`, { status }),
  getNotifications: () => api.get('/employers/notifications'),
  markNotificationRead: (id: string) => api.patch(`/employers/notifications/${id}/read`),
  getNotificationCount: () => api.get<{ unread: number }>('/employers/notifications/count'),
};
