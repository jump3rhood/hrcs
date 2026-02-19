import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  getProfile,
  updateProfile,
  addSkill,
  deleteSkill,
  browseJobs,
  getJob,
  applyToJob,
  getApplications,
  getNotifications,
  markNotificationRead,
  getNotificationCount,
} from '../controllers/candidateController';

const router = Router();

// All candidate routes require auth + candidate role
router.use(authenticate, requireRole('candidate'));

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('yearsOfExperience').optional().isInt({ min: 0 }),
    body('githubUrl').optional().isURL(),
  ],
  validate,
  updateProfile
);

router.post(
  '/skills',
  [
    body('skillName').notEmpty().trim(),
    body('rating').isInt({ min: 1, max: 5 }),
  ],
  validate,
  addSkill
);

router.delete('/skills/:skillId', deleteSkill);

router.get('/jobs', browseJobs);
router.get('/jobs/:jobId', getJob);
router.post('/jobs/:jobId/apply', applyToJob);
router.get('/applications', getApplications);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/notifications/count', getNotificationCount);

export default router;
