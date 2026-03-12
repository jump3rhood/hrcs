import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import Job from '../models/Job';
import {
  getCandidates,
  getCandidateById,
  getCandidateApplications,
  getJobApplications,
  getMatchedCandidates,
  sendJobNotifications,
  getInvitationStats,
  createShortlist,
  getShortlist,
  shareProfile,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/candidates', getCandidates);
router.get('/candidates/:id/applications', getCandidateApplications);
router.get('/candidates/:id', getCandidateById);
router.get('/all-jobs', async (_req, res) => {
  const jobs = await Job.find({ status: 'published' }).populate('employer', 'companyName').sort({ createdAt: -1 });
  res.json(jobs);
});
router.get('/jobs/:jobId/applications', getJobApplications);
router.get('/jobs/:jobId/matched-candidates', getMatchedCandidates);

router.post(
  '/send-job-notifications',
  [body('jobId').notEmpty(), body('candidateIds').isArray({ min: 1 })],
  validate,
  sendJobNotifications
);
router.get('/job-invitations/:jobId/stats', getInvitationStats);

router.post(
  '/shortlists',
  [body('jobId').notEmpty(), body('candidates').isArray({ min: 1, max: 5 })],
  validate,
  createShortlist
);
router.get('/shortlists/:jobId', getShortlist);

router.post(
  '/share-profile',
  [body('jobId').notEmpty(), body('candidateId').notEmpty()],
  validate,
  shareProfile
);

export default router;
