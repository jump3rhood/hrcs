import api from '@/lib/axios';

export const adminApi = {
  getCandidates: (params?: Record<string, string | number>) =>
    api.get('/admin/candidates', { params }),
  getAllJobs: () => api.get('/admin/all-jobs'),
  getCandidateById: (id: string) =>
    api.get(`/admin/candidates/${id}`),
  getJobApplications: (jobId: string) =>
    api.get(`/admin/jobs/${jobId}/applications`),
  getMatchedCandidates: (jobId: string) =>
    api.get(`/admin/jobs/${jobId}/matched-candidates`),
  sendJobNotifications: (jobId: string, candidateIds: string[]) =>
    api.post('/admin/send-job-notifications', { jobId, candidateIds }),
  getInvitationStats: (jobId: string) =>
    api.get(`/admin/job-invitations/${jobId}/stats`),
  createShortlist: (jobId: string, candidates: { applicationId: string; rank: number; notes: string }[]) =>
    api.post('/admin/shortlists', { jobId, candidates }),
  getShortlist: (jobId: string) => api.get(`/admin/shortlists/${jobId}`),
  shareProfile: (jobId: string, candidateId: string) =>
    api.post('/admin/share-profile', { jobId, candidateId }),
};
