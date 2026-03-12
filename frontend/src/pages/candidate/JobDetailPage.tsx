import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Briefcase, Monitor, Clock, Building2, Globe, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface JobDetail {
  _id: string;
  title: string;
  description: string;
  responsibilities: string;
  jobType: string;
  workMode: string;
  location: string;
  experienceMin: number;
  experienceMax: number;
  skills: { skillName: string; required: boolean }[];
  employer: { companyName: string; industry: string; website?: string; description?: string };
  matchScore: number;
  hasApplied: boolean;
  createdAt: string;
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([
      candidateApi.getJob(jobId),
      candidateApi.getProfile(),
    ])
      .then(([jobRes, profileRes]) => {
        setJob(jobRes.data as JobDetail);
        const profile = profileRes.data as { skills?: { skillName: string }[] };
        setCandidateSkills(profile.skills?.map((s) => s.skillName.toLowerCase()) ?? []);
      })
      .catch(() => toast({ title: 'Error', description: 'Failed to load job', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [jobId, toast]);

  const handleApply = async () => {
    if (!job) return;
    try {
      await candidateApi.applyToJob(job._id);
      setJob((prev) => prev ? { ...prev, hasApplied: true } : prev);
      toast({ title: 'Applied successfully!' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to apply';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Job not found.</p>
        <Link to="/candidate/jobs" className="text-sm text-[hsl(214,80%,52%)] underline mt-2 inline-block">
          Back to jobs
        </Link>
      </div>
    );
  }

  const postedDate = new Date(job.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/candidate/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Header card */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-[hsl(217,71%,25%)] to-[hsl(214,80%,40%)] text-white">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">{job.employer.companyName}</p>
                  <p className="text-xs text-blue-300">{job.employer.industry}</p>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{job.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {job.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" /> {job.workMode}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {job.experienceMin}–{job.experienceMax} yrs
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-end shrink-0">
              <div className="text-center sm:text-right">
                <div className="text-4xl font-bold">{job.matchScore}%</div>
                <div className="text-xs text-blue-200">match score</div>
              </div>
              <Button
                size="lg"
                disabled={job.hasApplied}
                onClick={handleApply}
                className={job.hasApplied
                  ? 'bg-white/20 text-white cursor-not-allowed'
                  : 'bg-white text-[hsl(217,71%,25%)] hover:bg-blue-50'}
              >
                {job.hasApplied ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Applied</span>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-primary mb-3">Job Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-primary mb-3">Responsibilities</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
              </CardContent>
            </Card>
          )}

          {/* Skill Gap Analysis */}
          {(() => {
            const requiredSkills = job.skills.filter((s) => s.required);
            if (requiredSkills.length === 0) return null;
            const matchedSkills = requiredSkills.filter((s) =>
              candidateSkills.includes(s.skillName.toLowerCase())
            );
            const missingSkills = requiredSkills.filter((s) =>
              !candidateSkills.includes(s.skillName.toLowerCase())
            );
            return (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-primary">Skill Match Breakdown</h2>
                    <span className="ml-auto text-sm font-semibold text-primary">
                      {matchedSkills.length}/{requiredSkills.length} required skills
                    </span>
                  </div>

                  {matchedSkills.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
                        Skills You Have ({matchedSkills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.map((s) => (
                          <span
                            key={s.skillName}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700 border border-green-200"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {s.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">
                        Skills to Improve Your Match ({missingSkills.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.map((s) => (
                          <span
                            key={s.skillName}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-600 border border-red-200"
                          >
                            <XCircle className="h-3 w-3" />
                            {s.skillName}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Add these skills to your profile to increase your match score.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-primary mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.filter((s) => s.required).map((s) => (
                  <Badge key={s.skillName} className="text-xs">
                    {s.skillName}
                  </Badge>
                ))}
              </div>
              {job.skills.some((s) => !s.required) && (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-2">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.filter((s) => !s.required).map((s) => (
                      <Badge key={s.skillName} variant="outline" className="text-xs">
                        {s.skillName}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Company info */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-primary mb-3">About {job.employer.companyName}</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Industry:</span> {job.employer.industry}</p>
                {job.employer.website && (
                  <p className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[hsl(214,80%,52%)] underline hover:text-primary"
                    >
                      {job.employer.website.replace(/^https?:\/\//, '')}
                    </a>
                  </p>
                )}
                {job.employer.description && (
                  <p className="leading-relaxed mt-2">{job.employer.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Posted date */}
          <p className="text-xs text-muted-foreground text-center">Posted on {postedDate}</p>
        </div>
      </div>
    </div>
  );
}
