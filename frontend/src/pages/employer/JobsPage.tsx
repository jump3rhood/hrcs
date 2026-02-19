import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employerApi } from '@/api/employers';
import type { Job, JobStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Users, X, MapPin, Star, Briefcase, Mail, Phone, Github, User, ChevronRight, ArrowLeft } from 'lucide-react';

interface JobWithCount extends Job {
  applicationCount?: number;
}

interface Applicant {
  _id: string;
  status: string;
  matchScore: number;
  createdAt: string;
  skills: { skillName: string; rating: number }[];
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    location: string;
    yearsOfExperience: number;
    phone?: string;
    bio?: string;
    githubUrl?: string;
    user: { email: string };
  };
}

const statusColors: Record<JobStatus, string> = {
  draft: 'secondary',
  published: 'default',
  paused: 'outline',
  closed: 'destructive',
};

export default function EmployerJobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobWithCount[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithCount | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    employerApi.getJobs().then((r) => setJobs(r.data as JobWithCount[]));
  }, []);

  // Load applicants when a job is selected
  useEffect(() => {
    if (!selectedJob) { setApplicants([]); return; }
    setApplicantsLoading(true);
    setSelectedApplicant(null);
    employerApi.getJobApplicants(selectedJob._id)
      .then((r) => setApplicants(r.data as Applicant[]))
      .catch(() => setApplicants([]))
      .finally(() => setApplicantsLoading(false));
  }, [selectedJob?._id]);

  const handleStatusChange = async (job: JobWithCount, status: JobStatus) => {
    const res = await employerApi.updateJobStatus(job._id, status);
    const updated = { ...(res.data as JobWithCount), applicationCount: job.applicationCount };
    setJobs((prev) => prev.map((j) => j._id === job._id ? updated : j));
    if (selectedJob?._id === job._id) setSelectedJob(updated);
    toast({ title: `Job ${status}` });
  };

  const handleStatusUpdate = async (applicantId: string, status: string) => {
    try {
      await employerApi.updateApplicationStatus(applicantId, status);
      setApplicants((prev) => prev.map((a) => a._id === applicantId ? { ...a, status } : a));
      if (selectedApplicant?._id === applicantId) setSelectedApplicant((prev) => prev ? { ...prev, status } : prev);
      toast({ title: `Candidate marked as ${status.replace(/_/g, ' ')}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <div className="flex border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 130px)', minHeight: '520px' }}>
      {/* ── Left panel: job list ── */}
      <div className={`flex flex-col border-r bg-muted/10 ${selectedJob ? 'hidden md:flex md:w-72 lg:w-80 shrink-0' : 'flex w-full md:w-72 lg:w-80 shrink-0'}`}>
        {/* Header */}
        <div className="px-4 py-4 border-b flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold">My Jobs</h1>
          <Button size="sm" asChild>
            <Link to="/employer/jobs/new"><PlusCircle className="h-4 w-4 mr-1.5" />Post Job</Link>
          </Button>
        </div>

        {/* Job list */}
        <div className="flex-1 overflow-y-auto py-2">
          {jobs.length === 0 && (
            <p className="text-sm text-muted-foreground px-4 py-4">No jobs posted yet.</p>
          )}
          {jobs.map((job) => (
            <button
              key={job._id}
              type="button"
              onClick={() => setSelectedJob(job)}
              className={`w-full text-left px-4 py-3 border-b transition-colors ${
                selectedJob?._id === job._id
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-muted/40 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-snug truncate ${selectedJob?._id === job._id ? 'text-primary' : ''}`}>
                    {job.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {job.jobType} · {job.workMode}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant={statusColors[job.status] as 'default' | 'secondary' | 'outline' | 'destructive'}
                    className="text-xs h-4"
                  >
                    {job.status}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {job.applicationCount ?? 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right panel: applicants or placeholder ── */}
      <div className={`flex flex-col flex-1 min-w-0 ${!selectedJob ? 'hidden md:flex' : 'flex'}`}>
        {!selectedJob ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-base font-medium text-muted-foreground">Select a job to view applicants</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Click any job on the left to see who has applied</p>
          </div>
        ) : (
          <>
            {/* Detail header */}
            <div className="px-5 py-4 border-b shrink-0 bg-background">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="md:hidden text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedJob(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="font-semibold text-base leading-tight">{selectedJob.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedJob.jobType} · {selectedJob.workMode} · {selectedJob.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={selectedJob.status} onValueChange={(v) => handleStatusChange(selectedJob, v as JobStatus)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link to={`/employer/jobs/${selectedJob._id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <Link to={`/employer/jobs/${selectedJob._id}/shortlist`}>Shortlist</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Applicant count bar */}
            <div className="px-5 py-2.5 bg-muted/20 border-b text-sm text-muted-foreground flex items-center gap-2 shrink-0">
              <Users className="h-4 w-4" />
              <span>
                {applicantsLoading ? 'Loading…' : `${applicants.length} applicant${applicants.length !== 1 ? 's' : ''}`}
              </span>
              <span className="text-xs">· click a candidate to view their profile</span>
            </div>

            {/* Applicant list */}
            <div className="flex-1 overflow-y-auto">
              {applicantsLoading ? (
                <p className="text-sm text-muted-foreground px-5 py-6">Loading applicants…</p>
              ) : applicants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No applications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Applications will appear here once candidates apply</p>
                </div>
              ) : (
                <div className="divide-y">
                  {applicants.map((app) => (
                    <button
                      key={app._id}
                      type="button"
                      onClick={() => setSelectedApplicant(app)}
                      className={`w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center gap-3 ${
                        selectedApplicant?._id === app._id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {app.candidate?.location} · {app.candidate?.yearsOfExperience} yrs exp
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          app.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                          app.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.matchScore}%
                        </span>
                        <Badge
                          variant={app.status === 'shortlisted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="text-xs h-5"
                        >
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Candidate detail side panel (fixed overlay) ── */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedApplicant(null)} />
          <div className="w-full max-w-md bg-background border-l shadow-2xl flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-base leading-tight">
                    {selectedApplicant.candidate.firstName} {selectedApplicant.candidate.lastName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedApplicant.candidate.yearsOfExperience} yrs exp · {selectedApplicant.matchScore}% match
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedApplicant(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Status + actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedApplicant.status === 'shortlisted' ? 'default' : selectedApplicant.status === 'rejected' ? 'destructive' : 'secondary'}
                  >
                    {selectedApplicant.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Applied {new Date(selectedApplicant.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedApplicant._id, 'interview_scheduled')}
                    disabled={selectedApplicant.status === 'interview_scheduled'}
                    className="h-8 text-xs"
                  >
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(selectedApplicant._id, 'rejected')}
                    disabled={selectedApplicant.status === 'rejected'}
                    className="h-8 text-xs"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Contact */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{selectedApplicant.candidate.user?.email}</span>
                  </div>
                  {selectedApplicant.candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedApplicant.candidate.phone}</span>
                    </div>
                  )}
                  {selectedApplicant.candidate.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{selectedApplicant.candidate.location}</span>
                    </div>
                  )}
                  {selectedApplicant.candidate.githubUrl && (
                    <div className="flex items-center gap-2">
                      <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a
                        href={selectedApplicant.candidate.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {selectedApplicant.candidate.githubUrl}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{selectedApplicant.candidate.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </section>

              {/* Bio */}
              {selectedApplicant.candidate.bio && (
                <section className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedApplicant.candidate.bio}</p>
                </section>
              )}

              {/* Skills */}
              {selectedApplicant.skills?.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills ({selectedApplicant.skills.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedApplicant.skills.map((s) => (
                      <div key={s.skillName} className="flex items-center justify-between py-1 border-b border-muted last:border-0">
                        <span className="text-sm font-medium">{s.skillName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
