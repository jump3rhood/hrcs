import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Employer from '../models/Employer';
import Job, { JobStatus } from '../models/Job';
import Shortlist from '../models/Shortlist';
import Application from '../models/Application';
import Candidate from '../models/Candidate';
import CandidateSkill from '../models/CandidateSkill';
import Notification from '../models/Notification';

// GET /api/employers/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  let employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    employer = await Employer.create({ user: req.userId });
  }
  res.json(employer);
};

// PUT /api/employers/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { companyName, industry, website, description } = req.body as {
    companyName?: string;
    industry?: string;
    website?: string;
    description?: string;
  };

  let employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    employer = await Employer.create({ user: req.userId });
  }

  if (companyName !== undefined) employer.companyName = companyName;
  if (industry !== undefined) employer.industry = industry;
  if (website !== undefined) employer.website = website;
  if (description !== undefined) employer.description = description;

  await employer.save();
  res.json(employer);
};

// GET /api/employers/jobs
export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    res.json([]);
    return;
  }
  const jobs = await Job.find({ employer: employer._id }).sort({ createdAt: -1 });
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicationCount };
    })
  );
  res.json(jobsWithCounts);
};

// POST /api/employers/jobs
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  let employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    employer = await Employer.create({ user: req.userId });
  }

  const job = await Job.create({ ...req.body, employer: employer._id, status: 'draft' });
  res.status(201).json(job);
};

// PUT /api/employers/jobs/:id
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    res.status(404).json({ message: 'Employer not found' });
    return;
  }

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: employer._id },
    req.body,
    { new: true }
  );

  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }
  res.json(job);
};

// PATCH /api/employers/jobs/:id/status
export const updateJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const employer = await Employer.findOne({ user: req.userId });
  if (!employer) {
    res.status(404).json({ message: 'Employer not found' });
    return;
  }

  const { status } = req.body as { status: JobStatus };
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: employer._id },
    { status },
    { new: true }
  );

  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }
  res.json(job);
};

// GET /api/employers/jobs/:jobId/shortlist
export const getShortlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const shortlist = await Shortlist.findOne({ jobId: req.params.jobId }).populate({
    path: 'candidates.applicationId',
    populate: [
      {
        path: 'candidate',
        populate: [
          { path: 'user', select: 'email' },
        ],
      },
    ],
  });

  if (!shortlist) {
    res.json(null);
    return;
  }

  const enriched = await Promise.all(
    shortlist.candidates.map(async (entry) => {
      const app = entry.applicationId as unknown as { candidate: { _id: string } };
      const skills = await CandidateSkill.find({ candidateId: app?.candidate?._id });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entryObj = (entry as any).toObject ? (entry as any).toObject() : entry;
      return { ...entryObj, skills };
    })
  );

  res.json({ ...shortlist.toObject(), candidates: enriched });
};

// PATCH /api/employers/applications/:id/status
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body as { status: string };
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!application) {
    res.status(404).json({ message: 'Application not found' });
    return;
  }
  res.json(application);
};

// GET /api/employers/jobs/:jobId/applicants
export const getJobApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
  const employer = await Employer.findOne({ user: req.userId });
  if (!employer) { res.status(404).json({ message: 'Employer not found' }); return; }

  const job = await Job.findOne({ _id: req.params.jobId, employer: employer._id });
  if (!job) { res.status(404).json({ message: 'Job not found' }); return; }

  const applications = await Application.find({ job: req.params.jobId })
    .populate({ path: 'candidate', populate: [{ path: 'user', select: 'email' }] })
    .sort({ matchScore: -1 });

  const result = await Promise.all(
    applications.map(async (app) => {
      const candidate = app.candidate as unknown as { _id: string };
      const skills = await CandidateSkill.find({ candidateId: candidate._id }).sort({ rating: -1 });
      return { ...app.toObject(), skills };
    })
  );

  res.json(result);
};

// GET /api/employers/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

// PATCH /api/employers/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  res.json(notification);
};

// GET /api/employers/notifications/count
export const getNotificationCount = async (req: AuthRequest, res: Response): Promise<void> => {
  const unread = await Notification.countDocuments({ user: req.userId, isRead: false });
  res.json({ unread });
};
