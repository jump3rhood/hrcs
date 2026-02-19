import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import type { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users, X, MapPin, Star, Briefcase, Mail, Phone, Github, User,
  ChevronRight, ArrowLeft, Building2, Clock, CheckCircle2, ListChecks,
  Send, ClipboardList,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobFull extends Job {
  employer?: { _id: string; companyName: string };
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

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (s === 'shortlisted' || s === 'interview_scheduled') return 'default';
  if (s === 'rejected') return 'destructive';
  if (s === 'invited') return 'outline';
  return 'secondary';
};

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobFull[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobFull | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Share state
  const [sharing, setSharing] = useState<Set<string>>(new Set());
  const [shared, setShared] = useState<Set<string>>(new Set());

  useEffect(() => {
    adminApi.getAllJobs()
      .then((r) => setJobs(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJob) { setApplicants([]); return; }
    setApplicantsLoading(true);
    setSelectedApplicant(null);
    adminApi.getJobApplications(selectedJob._id)
      .then((r) => setApplicants(r.data as Applicant[]))
      .catch(() => setApplicants([]))
      .finally(() => setApplicantsLoading(false));
  }, [selectedJob?._id]);

  const handleShare = async (candidateId: string) => {
    if (!selectedJob) return;
    setSharing((s) => new Set(s).add(candidateId));
    try {
      await adminApi.shareProfile(selectedJob._id, candidateId);
      setShared((s) => new Set(s).add(candidateId));
      toast({ title: 'Profile shared with employer' });
    } catch {
      toast({ title: 'Failed to share profile', variant: 'destructive' });
    } finally {
      setSharing((s) => { const n = new Set(s); n.delete(candidateId); return n; });
    }
  };

  return (
    <div
      className="flex border rounded-lg overflow-hidden"
      style={{ height: 'calc(100vh - 130px)', minHeight: '520px' }}
    >
      {/* ── Left panel: job list ── */}
      <div className={`flex flex-col border-r bg-muted/10 ${selectedJob ? 'hidden md:flex md:w-72 lg:w-80 shrink-0' : 'flex w-full md:w-72 lg:w-80 shrink-0'}`}>
        <div className="px-4 py-3.5 border-b shrink-0">
          <h1 className="text-base font-bold">All Jobs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{jobs.length} published jobs</p>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {jobs.length === 0 && (
            <p className="text-sm text-muted-foreground px-4 py-4">No published jobs yet.</p>
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
                    {(job.employer as { companyName?: string })?.companyName ?? 'Unknown'} · {job.jobType}
                  </p>
                </div>
                <Badge variant={job.status === 'published' ? 'default' : 'secondary'} className="text-xs h-4 shrink-0">
                  {job.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={`flex flex-col flex-1 min-w-0 ${!selectedJob ? 'hidden md:flex' : 'flex'}`}>
        {!selectedJob ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-base font-medium text-muted-foreground">Select a job to view details</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Click any job on the left to see its description and applicants</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Back button (mobile) */}
            <div className="md:hidden px-4 py-2 border-b shrink-0">
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedJob(null)}
              >
                <ArrowLeft className="h-4 w-4" /> Back to jobs
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Job detail ── */}
              <div className="px-6 py-5 space-y-4 border-b">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{selectedJob.title}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                      {(selectedJob.employer as { companyName?: string })?.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {(selectedJob.employer as { companyName?: string }).companyName}
                        </span>
                      )}
                      {selectedJob.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedJob.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {selectedJob.jobType} · {selectedJob.workMode}
                      </span>
                      {(selectedJob.experienceMin != null || selectedJob.experienceMax != null) && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {selectedJob.experienceMin}–{selectedJob.experienceMax} yrs exp
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={selectedJob.status === 'published' ? 'default' : 'secondary'} className="shrink-0">
                    {selectedJob.status}
                  </Badge>
                </div>

                {/* Skills */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Skills Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((s) => (
                        <Badge key={s.skillName} variant={s.required ? 'default' : 'outline'} className="text-xs">
                          {s.skillName}{s.required ? '' : ' (optional)'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedJob.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedJob.responsibilities && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Responsibilities</p>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{selectedJob.responsibilities}</p>
                  </div>
                )}

                {/* Admin actions */}
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                    <Link to={`/admin/jobs/${selectedJob._id}/shortlist`}>
                      <ListChecks className="h-3.5 w-3.5 mr-1.5" />Manage Shortlist
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                    <Link to={`/admin/jobs/${selectedJob._id}/notify`}>
                      <Send className="h-3.5 w-3.5 mr-1.5" />Send Notifications
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ── Applicants section ── */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">
                    {applicantsLoading ? 'Loading applicants…' : `${applicants.length} Applicant${applicants.length !== 1 ? 's' : ''}`}
                  </h3>
                </div>

                {!applicantsLoading && applicants.length === 0 && (
                  <p className="text-sm text-muted-foreground">No applications yet for this job.</p>
                )}

                <div className="space-y-2">
                  {applicants.map((app) => {
                    const c = app.candidate;
                    const isShared = shared.has(c._id);
                    const isSharing = sharing.has(c._id);

                    return (
                      <div key={app._id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                        <button
                          type="button"
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          onClick={() => setSelectedApplicant(app)}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary hover:underline truncate">
                              {c?.firstName} {c?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c?.location} · {c?.yearsOfExperience} yrs
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-auto pr-2">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              app.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                              app.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {app.matchScore}%
                            </span>
                            <Badge variant={statusVariant(app.status)} className="text-xs h-5">
                              {app.status.replace(/_/g, ' ')}
                            </Badge>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant={isShared ? 'default' : 'outline'}
                          className={`shrink-0 h-7 text-xs ${isShared ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' : ''}`}
                          disabled={isSharing || isShared}
                          onClick={() => handleShare(c._id)}
                        >
                          {isShared ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Shared</>
                          ) : isSharing ? 'Sharing…' : 'Share'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Candidate detail side panel ── */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 bg-black/40" onClick={() => setSelectedApplicant(null)} />
          <div className="w-full max-w-md bg-background border-l shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(selectedApplicant.status)}>
                  {selectedApplicant.status.replace(/_/g, ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Applied {new Date(selectedApplicant.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Separator />

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

              {/* Share action */}
              <div className="pt-2">
                <Button
                  className={`w-full ${shared.has(selectedApplicant.candidate._id) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  disabled={sharing.has(selectedApplicant.candidate._id) || shared.has(selectedApplicant.candidate._id)}
                  onClick={() => handleShare(selectedApplicant.candidate._id)}
                >
                  {shared.has(selectedApplicant.candidate._id) ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" />Profile Shared with Employer</>
                  ) : sharing.has(selectedApplicant.candidate._id) ? 'Sharing…' : 'Share Profile with Employer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
