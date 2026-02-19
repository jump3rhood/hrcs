import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Candidate from '../models/Candidate';
import CandidateSkill from '../models/CandidateSkill';
import Job from '../models/Job';
import Application from '../models/Application';
import Notification from '../models/Notification';
import Shortlist from '../models/Shortlist';

const PAGE_SIZE = 20;

// GET /api/admin/candidates
export const getCandidates = async (req: Request, res: Response): Promise<void> => {
  const { skills, expMin, expMax, sort, page } = req.query as Record<string, string>;
  const pageNum = Math.max(1, Number(page) || 1);

  // Build base query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidateFilter: Record<string, any> = {};
  if (expMin) candidateFilter.yearsOfExperience = { $gte: Number(expMin) };
  if (expMax) {
    candidateFilter.yearsOfExperience = {
      ...(candidateFilter.yearsOfExperience ?? {}),
      $lte: Number(expMax),
    };
  }

  let candidateIds: string[] | null = null;

  // Filter by skills (candidate must have ALL listed skills)
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      const skillDocs = await CandidateSkill.find({
        skillName: { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) },
      }).select('candidateId');

      // Group by candidateId and keep only those with all skills
      const skillCounts = new Map<string, number>();
      for (const d of skillDocs) {
        const key = String(d.candidateId);
        skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
      }
      candidateIds = [...skillCounts.entries()]
        .filter(([, count]) => count >= skillList.length)
        .map(([id]) => id);

      if (candidateIds.length === 0) {
        res.json({ candidates: [], total: 0, page: pageNum, pages: 0 });
        return;
      }
    }
  }

  if (candidateIds !== null) {
    candidateFilter._id = { $in: candidateIds };
  }

  const sortOptions: Record<string, 1 | -1> =
    sort === 'experience' ? { yearsOfExperience: -1 } : { createdAt: -1 };

  const total = await Candidate.countDocuments(candidateFilter);
  const candidates = await Candidate.find(candidateFilter)
    .sort(sortOptions)
    .skip((pageNum - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .populate('user', 'email');

  // Attach top 3 skills for each candidate
  const candidateData = await Promise.all(
    candidates.map(async (c) => {
      const skills = await CandidateSkill.find({ candidateId: c._id }).sort({ rating: -1 }).limit(3);
      return { ...c.toObject(), topSkills: skills };
    })
  );

  res.json({ candidates: candidateData, total, page: pageNum, pages: Math.ceil(total / PAGE_SIZE) });
};

// GET /api/admin/jobs/:jobId/applications
export const getJobApplications = async (req: Request, res: Response): Promise<void> => {
  const applications = await Application.find({ job: req.params.jobId })
    .populate({
      path: 'candidate',
      populate: { path: 'user', select: 'email' },
    })
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

// POST /api/admin/send-job-notifications
export const sendJobNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobId, candidateIds } = req.body as { jobId: string; candidateIds: string[] };

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }

  const notifications = await Promise.all(
    candidateIds.map(async (candidateId) => {
      const candidate = await Candidate.findById(candidateId).populate('user');
      if (!candidate) return null;
      const candidateUser = candidate.user as unknown as { _id: string };

      // Compute match score
      const skills = await CandidateSkill.find({ candidateId });
      const required = job.skills.filter((s) => s.required);
      const candidateSet = new Set(skills.map((s) => s.skillName.toLowerCase()));
      const matchScore = required.length
        ? Math.round(required.filter((s) => candidateSet.has(s.skillName.toLowerCase())).length / required.length * 100)
        : 100;

      const notification = await Notification.create({
        user: candidateUser._id,
        type: 'job_invitation',
        title: `New job opportunity: ${job.title}`,
        message: `You've been matched to a new job opportunity.`,
        jobId: job._id,
        matchScore,
      });

      // Create invited application if not already applied
      await Application.findOneAndUpdate(
        { candidate: candidateId, job: jobId },
        { $setOnInsert: { status: 'invited', matchScore } },
        { upsert: true }
      );

      return notification;
    })
  );

  res.json({ sent: notifications.filter(Boolean).length });
};

// GET /api/admin/job-invitations/:jobId/stats
export const getInvitationStats = async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params.jobId;
  const sent = await Application.countDocuments({ job: jobId, status: { $in: ['invited', 'applied', 'shortlisted'] } });
  const applied = await Application.countDocuments({ job: jobId, status: 'applied' });
  const viewed = await Notification.countDocuments({ jobId, isRead: true });
  res.json({ sent, viewed, applied });
};

// POST /api/admin/shortlists
export const createShortlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobId, candidates } = req.body as {
    jobId: string;
    candidates: { applicationId: string; rank: number; notes: string }[];
  };

  // Update application statuses to 'shortlisted'
  await Promise.all(
    candidates.map(({ applicationId }) =>
      Application.findByIdAndUpdate(applicationId, { status: 'shortlisted' })
    )
  );

  const shortlist = await Shortlist.findOneAndUpdate(
    { jobId },
    { jobId, adminId: req.userId, candidates },
    { upsert: true, new: true }
  );

  // Notify employer (find employer from job)
  const job = await Job.findById(jobId).populate('employer');
  if (job) {
    const employer = job.employer as unknown as { user: string };
    await Notification.create({
      user: employer.user,
      type: 'shortlist_ready',
      title: `Shortlist ready for: ${job.title}`,
      message: `${candidates.length} candidate(s) have been shortlisted for your job posting.`,
      jobId: job._id,
    });
  }

  res.status(201).json(shortlist);
};

// GET /api/admin/candidates/:id
export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  const candidate = await Candidate.findById(req.params.id).populate('user', 'email');
  if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
  const skills = await CandidateSkill.find({ candidateId: candidate._id }).sort({ rating: -1 });
  res.json({ ...candidate.toObject(), skills });
};

// GET /api/admin/jobs/:jobId/matched-candidates
export const getMatchedCandidates = async (req: Request, res: Response): Promise<void> => {
  const job = await Job.findById(req.params.jobId);
  if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
  if (job.skills.length === 0) { res.json([]); return; }

  const allSkillNames = job.skills.map((s) => s.skillName.toLowerCase());
  const requiredSkillNames = job.skills.filter((s) => s.required).map((s) => s.skillName.toLowerCase());

  const matchingSkillDocs = await CandidateSkill.find({
    skillName: { $in: allSkillNames.map((s) => new RegExp(`^${s}$`, 'i')) },
  }).select('candidateId skillName');

  const candidateSkillsMap = new Map<string, string[]>();
  for (const doc of matchingSkillDocs) {
    const key = String(doc.candidateId);
    if (!candidateSkillsMap.has(key)) candidateSkillsMap.set(key, []);
    candidateSkillsMap.get(key)!.push(doc.skillName.toLowerCase());
  }

  if (candidateSkillsMap.size === 0) { res.json([]); return; }

  const applications = await Application.find({ job: req.params.jobId }).select('candidate status matchScore');
  const appliedMap = new Map(applications.map((a) => [String(a.candidate), a]));

  const candidateIds = [...candidateSkillsMap.keys()];
  const candidates = await Candidate.find({ _id: { $in: candidateIds } }).populate('user', 'email');

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const cId = String(candidate._id);
      const matchedSkills = candidateSkillsMap.get(cId) ?? [];
      const matchScore = requiredSkillNames.length > 0
        ? Math.round(requiredSkillNames.filter((s) => matchedSkills.includes(s)).length / requiredSkillNames.length * 100)
        : 100;
      const app = appliedMap.get(cId);
      const skills = await CandidateSkill.find({ candidateId: candidate._id }).sort({ rating: -1 });
      return {
        candidate: { ...candidate.toObject() },
        skills,
        matchScore,
        applied: !!app,
        applicationStatus: app?.status ?? null,
        applicationId: app ? String(app._id) : null,
      };
    })
  );

  res.json(results.sort((a, b) => b.matchScore - a.matchScore));
};

// GET /api/admin/shortlists/:jobId
export const getShortlist = async (req: Request, res: Response): Promise<void> => {
  const shortlist = await Shortlist.findOne({ jobId: req.params.jobId }).populate({
    path: 'candidates.applicationId',
    populate: { path: 'candidate', populate: { path: 'user', select: 'email' } },
  });
  res.json(shortlist);
};

// POST /api/admin/share-profile
export const shareProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobId, candidateId } = req.body as { jobId: string; candidateId: string };

  const job = await Job.findById(jobId).populate('employer');
  if (!job) { res.status(404).json({ message: 'Job not found' }); return; }

  const employer = job.employer as unknown as { user: string; companyName: string };

  const candidate = await Candidate.findById(candidateId).populate('user');
  if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
  const candidateUser = candidate.user as unknown as { _id: string };

  // Notify candidate
  await Notification.create({
    user: candidateUser._id,
    type: 'profile_shared',
    title: `Your profile was shared with ${employer.companyName}`,
    message: `An admin has shared your profile with ${employer.companyName} for the role: ${job.title}.`,
    jobId: job._id,
  });

  // Notify employer
  await Notification.create({
    user: employer.user,
    type: 'profile_shared',
    title: `Candidate recommended for: ${job.title}`,
    message: `A candidate profile (${candidate.firstName} ${candidate.lastName}) has been shared with you for the role: ${job.title}.`,
    jobId: job._id,
    candidateId: candidate._id,
  });

  res.json({ message: 'Profile shared successfully' });
};
