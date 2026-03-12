import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Github, Briefcase, Star, User, Building2, Clock } from 'lucide-react';

interface Skill { skillName: string; rating: number }

interface CandidateDetail {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  yearsOfExperience?: number;
  githubUrl?: string;
  user: { email: string };
  skills: Skill[];
}

interface JobEmployer { companyName: string }
interface JobInfo {
  _id: string;
  title: string;
  jobType: string;
  workMode: string;
  location: string;
  employer: JobEmployer;
}

interface ApplicationRow {
  _id: string;
  status: string;
  matchScore: number;
  createdAt: string;
  job: JobInfo;
}

type StatusFilter = 'all' | 'applied' | 'shortlisted' | 'rejected' | 'invited' | 'interview_scheduled';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'invited', label: 'Invited' },
  { key: 'interview_scheduled', label: 'Interview' },
];

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (s === 'shortlisted' || s === 'interview_scheduled') return 'default';
  if (s === 'rejected') return 'destructive';
  if (s === 'invited') return 'outline';
  return 'secondary';
};

export default function AdminCandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!candidateId) return;
    // Fetch profile and applications in parallel; treat applications as optional
    // so the page still loads even if the backend hasn't restarted yet.
    adminApi.getCandidateById(candidateId)
      .then(async (candidateRes) => {
        setCandidate(candidateRes.data as CandidateDetail);
        try {
          const appsRes = await adminApi.getCandidateApplications(candidateId);
          setApplications(appsRes.data as ApplicationRow[]);
        } catch {
          // applications endpoint unavailable — page still renders with profile
          setApplications([]);
        }
      })
      .catch(() => {
        setCandidate(null);
      })
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/admin/candidates" className="text-sm text-primary underline mt-2 inline-block">
          Back to candidates
        </Link>
      </div>
    );
  }

  const filteredApps = applications.filter((a) =>
    statusFilter === 'all' ? true : a.status === statusFilter
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/admin/candidates"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to candidates
      </Link>

      {/* 2-col grid: collapses to 1-col on small screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column: candidate profile ── */}
        <div className="space-y-4">
          {/* Profile header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold leading-tight">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  {candidate.yearsOfExperience != null && (
                    <p className="text-sm text-muted-foreground">
                      {candidate.yearsOfExperience} years experience
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 text-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Contact
                </h2>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{candidate.user?.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {candidate.githubUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>{candidate.yearsOfExperience ?? '—'} years experience</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {candidate.bio && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bio</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{candidate.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Skills ({candidate.skills.length})
                </h2>
                <div className="space-y-2">
                  {candidate.skills.map((s) => (
                    <div
                      key={s.skillName}
                      className="flex items-center justify-between py-1.5 border-b border-muted last:border-0"
                    >
                      <span className="text-sm font-medium">{s.skillName}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right column: job applications ── */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold mb-4">
                Applications
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({applications.length} total)
                </span>
              </h2>

              {/* Status filter chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {STATUS_FILTERS.map((f) => {
                  const count = f.key === 'all'
                    ? applications.length
                    : applications.filter((a) => a.status === f.key).length;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        statusFilter === f.key
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {f.label}
                      {count > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                          statusFilter === f.key ? 'bg-white/20' : 'bg-muted'
                        }`}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Application list */}
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications found for this candidate.</p>
              ) : filteredApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications with this status.</p>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map((app) => {
                    const job = app.job as JobInfo;
                    const appliedDate = new Date(app.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    return (
                      <div key={app._id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm leading-snug truncate">{job?.title ?? 'Unknown Job'}</p>
                            {job?.employer?.companyName && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Building2 className="h-3 w-3 shrink-0" />
                                {job.employer.companyName}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              app.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                              app.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {app.matchScore}%
                            </span>
                            <Badge variant={statusVariant(app.status)} className="text-xs capitalize">
                              {app.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          {job?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{job.location}
                            </span>
                          )}
                          {job?.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />{job.jobType}
                            </span>
                          )}
                          {job?.workMode && (
                            <span>{job.workMode}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{appliedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
