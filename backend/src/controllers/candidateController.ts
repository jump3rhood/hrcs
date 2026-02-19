import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Candidate from '../models/Candidate';
import CandidateSkill from '../models/CandidateSkill';
import Job from '../models/Job';
import Application from '../models/Application';
import Notification from '../models/Notification';

// GET /api/candidates/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  let candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    // Auto-create empty profile on first access
    candidate = await Candidate.create({ user: req.userId });
  }
  const skills = await CandidateSkill.find({ candidateId: candidate._id });
  res.json({ ...candidate.toObject(), skills });
};

// PUT /api/candidates/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone, location, bio, yearsOfExperience, githubUrl } =
    req.body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      location?: string;
      bio?: string;
      yearsOfExperience?: number;
      githubUrl?: string;
    };

  let candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    candidate = await Candidate.create({ user: req.userId });
  }

  if (firstName !== undefined) candidate.firstName = firstName;
  if (lastName !== undefined) candidate.lastName = lastName;
  if (phone !== undefined) candidate.phone = phone;
  if (location !== undefined) candidate.location = location;
  if (bio !== undefined) candidate.bio = bio;
  if (yearsOfExperience !== undefined) candidate.yearsOfExperience = yearsOfExperience;
  if (githubUrl !== undefined) candidate.githubUrl = githubUrl;

  await candidate.save();

  const skills = await CandidateSkill.find({ candidateId: candidate._id });
  res.json({ ...candidate.toObject(), skills });
};

// POST /api/candidates/skills
export const addSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  const { skillName, rating } = req.body as { skillName: string; rating: number };

  let candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    candidate = await Candidate.create({ user: req.userId });
  }

  const skill = await CandidateSkill.findOneAndUpdate(
    { candidateId: candidate._id, skillName },
    { rating },
    { upsert: true, new: true }
  );

  res.status(201).json(skill);
};

// DELETE /api/candidates/skills/:skillId
export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  const candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  await CandidateSkill.findOneAndDelete({
    _id: req.params.skillId,
    candidateId: candidate._id,
  });

  res.json({ message: 'Skill removed' });
};

// Helper: compute match score (% of required job skills candidate has)
function calcMatchScore(
  candidateSkills: { skillName: string }[],
  jobSkills: { skillName: string; required: boolean }[]
): number {
  const required = jobSkills.filter((s) => s.required);
  if (required.length === 0) return 100;
  const candidateSet = new Set(candidateSkills.map((s) => s.skillName.toLowerCase()));
  const matched = required.filter((s) => candidateSet.has(s.skillName.toLowerCase()));
  return Math.round((matched.length / required.length) * 100);
}

// GET /api/candidates/jobs
export const browseJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobType, workMode, expMin, expMax, search } = req.query as Record<string, string>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { status: 'published' };
  if (jobType) filter.jobType = jobType;
  if (workMode) filter.workMode = workMode;
  if (expMin || expMax) {
    filter.experienceMin = {};
    if (expMin) filter.experienceMin.$gte = Number(expMin);
    if (expMax) filter.experienceMax = { $lte: Number(expMax) };
  }
  if (search) filter.title = { $regex: search, $options: 'i' };

  const jobs = await Job.find(filter).populate('employer', 'companyName industry').sort({ createdAt: -1 });

  const candidate = await Candidate.findOne({ user: req.userId });
  const candidateSkills = candidate ? await CandidateSkill.find({ candidateId: candidate._id }) : [];
  const appliedJobs = candidate
    ? new Set((await Application.find({ candidate: candidate._id }).select('job')).map((a) => String(a.job)))
    : new Set<string>();

  const jobsWithScore = jobs.map((job) => ({
    ...job.toObject(),
    matchScore: calcMatchScore(candidateSkills, job.skills),
    hasApplied: appliedJobs.has(String(job._id)),
  }));

  res.json(jobsWithScore);
};

// GET /api/candidates/jobs/:jobId
export const getJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await Job.findOne({ _id: req.params.jobId, status: 'published' }).populate(
    'employer',
    'companyName industry website description'
  );
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }

  const candidate = await Candidate.findOne({ user: req.userId });
  const candidateSkills = candidate ? await CandidateSkill.find({ candidateId: candidate._id }) : [];
  const hasApplied = candidate
    ? !!(await Application.findOne({ candidate: candidate._id, job: job._id }))
    : false;

  res.json({
    ...job.toObject(),
    matchScore: calcMatchScore(candidateSkills, job.skills),
    hasApplied,
  });
};

// POST /api/candidates/jobs/:jobId/apply
export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  let candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    candidate = await Candidate.create({ user: req.userId });
  }

  const job = await Job.findById(req.params.jobId);
  if (!job || job.status !== 'published') {
    res.status(404).json({ message: 'Job not found or not open' });
    return;
  }

  const existing = await Application.findOne({ candidate: candidate._id, job: job._id });
  if (existing) {
    res.status(409).json({ message: 'Already applied to this job' });
    return;
  }

  const skills = await CandidateSkill.find({ candidateId: candidate._id });
  const matchScore = calcMatchScore(skills, job.skills);

  const application = await Application.create({
    candidate: candidate._id,
    job: job._id,
    matchScore,
  });

  res.status(201).json(application);
};

// GET /api/candidates/applications
export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const candidate = await Candidate.findOne({ user: req.userId });
  if (!candidate) {
    res.json([]);
    return;
  }
  const applications = await Application.find({ candidate: candidate._id })
    .populate('job', 'title location jobType workMode experienceMin experienceMax employer')
    .populate({ path: 'job', populate: { path: 'employer', select: 'companyName' } })
    .sort({ createdAt: -1 });
  res.json(applications);
};

// GET /api/candidates/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

// PATCH /api/candidates/notifications/:id/read
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

// GET /api/candidates/notifications/count
export const getNotificationCount = async (req: AuthRequest, res: Response): Promise<void> => {
  const unread = await Notification.countDocuments({ user: req.userId, isRead: false });
  res.json({ unread });
};
