import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '@/api/candidates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Briefcase, Monitor, ChevronRight, Lightbulb, TrendingUp } from 'lucide-react';

interface JobWithScore {
  _id: string;
  title: string;
  description: string;
  jobType: string;
  workMode: string;
  location: string;
  experienceMin: number;
  experienceMax: number;
  skills: { skillName: string; required: boolean }[];
  employer: { companyName: string; industry: string };
  matchScore: number;
  hasApplied: boolean;
}

const TIPS = [
  { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { quote: 'Your skills are your currency. Keep investing in them.', author: 'BRI Careers' },
  { quote: 'Every application is a step closer to your next opportunity.', author: 'BRI Careers' },
  { quote: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { quote: 'Don\'t watch the clock; do what it does — keep going.', author: 'Sam Levenson' },
  { quote: 'Apply to roles where you meet 60–70% of the requirements. That\'s the sweet spot.', author: 'BRI Careers' },
  { quote: 'Tailor each application. Generic doesn\'t get interviews.', author: 'BRI Careers' },
  { quote: 'Your next employer is looking for you right now.', author: 'BRI Careers' },
];

export default function CandidateJobsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [appliedThisMonth, setAppliedThisMonth] = useState(0);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  const loadJobs = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (jobType && jobType !== 'all') params.jobType = jobType;
    if (workMode && workMode !== 'all') params.workMode = workMode;
    candidateApi.getJobs(params).then((r) =>
      setJobs((r.data as JobWithScore[]).filter((j) => !j.hasApplied))
    );
  }, [search, jobType, workMode]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    candidateApi.getProfile().then((r) => setFirstName(r.data.firstName)).catch(() => {});
  }, []);

  useEffect(() => {
    candidateApi.getApplications().then((r) => {
      const apps = r.data as { createdAt: string }[];
      const now = new Date();
      const count = apps.filter((a) => {
        const d = new Date(a.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }).length;
      setAppliedThisMonth(count);
    });
  }, []);

  const handleApply = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    try {
      await candidateApi.applyToJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setAppliedThisMonth((n) => n + 1);
      toast({ title: 'Applied successfully!', description: 'View it in My Applications.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to apply';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const tip = TIPS[tipIndex];

  return (
    <div className="space-y-4">
      {firstName && (
        <p className="text-muted-foreground text-sm">Hello, <span className="font-semibold text-foreground">{firstName}</span> 👋</p>
      )}
      <h1 className="text-2xl font-bold text-primary">Browse Jobs</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Job type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        <Select value={workMode} onValueChange={setWorkMode}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Work mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="onsite">Onsite</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* Jobs list */}
        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-muted-foreground">No jobs found.</p>}
          {jobs.map((job) => (
            <Card
              key={job._id}
              className="cursor-pointer hover:shadow-md hover:border-[hsl(214,80%,52%)]/40 transition-all duration-200 group"
              onClick={() => navigate(`/candidate/jobs/${job._id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg group-hover:text-[hsl(214,80%,52%)] transition-colors mb-0.5">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm font-medium text-foreground/80">{job.employer?.companyName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" /> {job.workMode}
                      </span>
                      <span>{job.experienceMin}–{job.experienceMax} yrs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{job.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[hsl(214,80%,52%)] transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1 flex-wrap min-w-0">
                    {job.skills?.slice(0, 5).map((s) => (
                      <Badge key={s.skillName} variant={s.required ? 'default' : 'outline'} className="text-xs">
                        {s.skillName}
                      </Badge>
                    ))}
                    {job.skills?.length > 5 && (
                      <Badge variant="outline" className="text-xs">+{job.skills.length - 5}</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => handleApply(e, job._id)}
                    className="shrink-0"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Applications this month */}
          <Card className="border-[hsl(214,80%,52%)]/20 bg-gradient-to-br from-[hsl(214,80%,52%)]/5 to-background">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-[hsl(214,80%,52%)]/10 p-2">
                  <TrendingUp className="h-4 w-4 text-[hsl(214,80%,52%)]" />
                </div>
                <p className="text-sm font-medium text-foreground">This Month</p>
              </div>
              <div className="text-4xl font-bold text-primary mb-1">{appliedThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {appliedThisMonth === 1 ? 'job applied to' : 'jobs applied to'}
              </p>
              {appliedThisMonth >= 5 && (
                <p className="text-xs text-[hsl(214,80%,52%)] font-medium mt-2">
                  Great momentum! Keep it up.
                </p>
              )}
              {appliedThisMonth === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Start applying — your next role could be one click away.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tip of the day */}
          <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-background dark:from-amber-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-foreground">Career Tip</p>
              </div>
              <blockquote className="text-sm text-foreground/80 leading-relaxed italic mb-2">
                "{tip.quote}"
              </blockquote>
              <p className="text-xs text-muted-foreground text-right">— {tip.author}</p>
            </CardContent>
          </Card>

          {/* Available jobs count */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-0.5">Available for you</p>
              <p className="text-2xl font-bold text-primary">{jobs.length}</p>
              <p className="text-xs text-muted-foreground">
                {jobs.length === 1 ? 'open role' : 'open roles'} matching your profile
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
