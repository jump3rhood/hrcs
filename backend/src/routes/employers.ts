import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  getProfile,
  updateProfile,
  getJobs,
  createJob,
  updateJob,
  updateJobStatus,
  getShortlist,
  getJobApplicants,
  updateApplicationStatus,
  getNotifications,
  markNotificationRead,
  getNotificationCount,
} from '../controllers/employerController';

const router = Router();

router.use(authenticate, requireRole('employer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/jobs', getJobs);
router.post(
  '/jobs',
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('workMode').isIn(['onsite', 'remote', 'hybrid']),
  ],
  validate,
  createJob
);
router.put('/jobs/:id', updateJob);
router.patch(
  '/jobs/:id/status',
  [body('status').isIn(['draft', 'published', 'paused', 'closed'])],
  validate,
  updateJobStatus
);

router.get('/jobs/:jobId/shortlist', getShortlist);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.patch('/applications/:id/status', updateApplicationStatus);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/notifications/count', getNotificationCount);

export default router;
