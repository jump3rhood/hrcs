import api from '@/lib/axios';
import type { CandidateProfile, CandidateSkill } from '@/types';

export type CandidateProfileWithSkills = CandidateProfile & { skills: CandidateSkill[] };

export const candidateApi = {
  getProfile: () => api.get<CandidateProfileWithSkills>('/candidates/profile'),
  updateProfile: (data: Partial<CandidateProfile>) =>
    api.put<CandidateProfileWithSkills>('/candidates/profile', data),
  addSkill: (skillName: string, rating: number) =>
    api.post<CandidateSkill>('/candidates/skills', { skillName, rating }),
  deleteSkill: (skillId: string) => api.delete(`/candidates/skills/${skillId}`),
  getJobs: (params?: Record<string, string | number>) =>
    api.get('/candidates/jobs', { params }),
  getJob: (jobId: string) => api.get(`/candidates/jobs/${jobId}`),
  applyToJob: (jobId: string) => api.post(`/candidates/jobs/${jobId}/apply`),
  getApplications: () => api.get('/candidates/applications'),
  getNotifications: () => api.get('/candidates/notifications'),
  markNotificationRead: (id: string) =>
    api.patch(`/candidates/notifications/${id}/read`),
  getNotificationCount: () => api.get<{ unread: number }>('/candidates/notifications/count'),
};
