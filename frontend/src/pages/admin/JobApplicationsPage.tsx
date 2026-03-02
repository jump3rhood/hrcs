import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ArrowLeft, UserCheck, Send, Users } from 'lucide-react';

interface Skill { skillName: string; rating: number }
interface JobSkill { skillName: string; required: boolean }

interface ApplicationRow {
  _id: string;
  matchScore: number;
  status: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    location: string;
    yearsOfExperience: number;
    user: { email: string };
  };
  skills: Skill[];
  job?: { skills: JobSkill[] };
}

interface PoolCandidate {
  _id: string;
  firstName: string;
  lastName: string;
  location: string;
  yearsOfExperience: number;
  user: { email: string };
  topSkills: { skillName: string; rating: number }[];
  matchScore: number;
}

export default function AdminJobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobSkills, setJobSkills] = useState<JobSkill[]>([]);
  const [sharing, setSharing] = useState<Set<string>>(new Set());
  const [shared, setShared] = useState<Set<string>>(new Set());

  const [poolCandidates, setPoolCandidates] = useState<PoolCandidate[]>([]);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const [minMatch, setMinMatch] = useState(0);
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId) return;

    const load = async () => {
      try {
        // Run applications + job list + candidate pool in parallel
        const [appsRes, jobsRes, poolRes] = await Promise.all([
          adminApi.getJobApplications(jobId),
          adminApi.getAllJobs(),
          adminApi.getCandidates({ page: 1 }),
        ]);

        // ── Applications ──
        const apps = appsRes.data as ApplicationRow[];
        setApplications(apps);

        // ── Job info ──
        const jobs = jobsRes.data as { _id: string; title: string; skills: JobSkill[] }[];
        const foundJob = jobs.find((j) => j._id === jobId);
        if (foundJob) {
          setJobTitle(foundJob.title);
          setJobSkills(foundJob.skills);
        } else if (apps.length > 0 && apps[0].job?.skills) {
          setJobSkills(apps[0].job.skills);
        }

        // ── Candidate pool ──
        // String-coerce IDs so ObjectId vs string comparisons never cause mismatches
        const appliedIds = new Set(apps.map((a) => String(a.candidate._id)));

        // Match scores are best-effort — if the endpoint errors, we just show 0%
        let matchScoreMap = new Map<string, number>();
        try {
          const matchedRes = await adminApi.getMatchedCandidates(jobId);
          const matchedArr = matchedRes.data as { candidate: { _id: string }; matchScore: number }[];
          matchScoreMap = new Map(matchedArr.map((m) => [String(m.candidate._id), m.matchScore]));
        } catch {
          // non-fatal — pool still shows without scores
        }

        const poolData = poolRes.data as { candidates: PoolCandidate[] };
        const rawPool: PoolCandidate[] = (poolData.candidates ?? [])
          .filter((c) => !appliedIds.has(String(c._id)))
          .map((c) => ({ ...c, matchScore: matchScoreMap.get(String(c._id)) ?? 0 }))
          .sort((a, b) => b.matchScore - a.matchScore);

        setPoolCandidates(rawPool);
      } catch (err) {
        console.error('[JobApplicationsPage] load error:', err);
      } finally {
        setPoolLoaded(true);
      }
    };

    load();
  }, [jobId]);

  // ── Handlers ──

  const handleShare = async (candidateId: string) => {
    if (!jobId || sharing.has(candidateId) || shared.has(candidateId)) return;
    setSharing((s) => new Set(s).add(candidateId));
    try {
      await adminApi.shareProfile(jobId, candidateId);
      setShared((s) => new Set(s).add(candidateId));
      toast({ title: 'Profile shared', description: 'Candidate and employer have been notified.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to share profile.', variant: 'destructive' });
    } finally {
      setSharing((s) => { const n = new Set(s); n.delete(candidateId); return n; });
    }
  };

  const handleSendJob = async (candidateId: string) => {
    if (!jobId || sending.has(candidateId) || notified.has(candidateId)) return;
    setSending((s) => new Set(s).add(candidateId));
    try {
      await adminApi.sendJobNotifications(jobId, [candidateId]);
      setNotified((s) => new Set(s).add(candidateId));
      toast({ title: 'Job sent', description: 'Candidate has been notified about this job.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send notification.', variant: 'destructive' });
    } finally {
      setSending((s) => { const n = new Set(s); n.delete(candidateId); return n; });
    }
  };

  const candidateSkillSet = (skills: Skill[]) =>
    new Set(skills.map((s) => s.skillName.toLowerCase()));

  const filteredPool = poolCandidates.filter((c) => c.matchScore >= minMatch);
  const requiredSkills = jobSkills.filter((s) => s.required);
  const optionalSkills = jobSkills.filter((s) => !s.required);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/jobs"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          {jobTitle && <p className="text-muted-foreground text-sm">{jobTitle}</p>}
        </div>
      </div>

      {/* ── Section 1: Applied candidates ── */}
      {applications.length === 0 ? (
        <p className="text-muted-foreground">No applications yet for this job.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const candidateId = app.candidate?._id;
            const skillSet = candidateSkillSet(app.skills ?? []);
            const isShared = shared.has(candidateId);
            const isSharing = sharing.has(candidateId);

            return (
              <Card key={app._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        {app.candidate?.firstName} {app.candidate?.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {app.candidate?.user?.email} · {app.candidate?.location} · {app.candidate?.yearsOfExperience} yrs exp
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{app.matchScore}%</div>
                        <div className="text-xs text-muted-foreground">match</div>
                      </div>
                      <Badge
                        variant={app.status === 'applied' ? 'secondary' : 'default'}
                        className="capitalize"
                      >
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((s) => {
                          const has = skillSet.has(s.skillName.toLowerCase());
                          return (
                            <span
                              key={s.skillName}
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                                has
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-red-50 text-red-600 border-red-200'
                              }`}
                            >
                              {has ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {s.skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {optionalSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Optional Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {optionalSkills.map((s) => {
                          const has = skillSet.has(s.skillName.toLowerCase());
                          return (
                            <span
                              key={s.skillName}
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                                has
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {has && <CheckCircle2 className="h-3 w-3" />}
                              {s.skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {app.skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        All Candidate Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills.map((s) => (
                          <Badge key={s.skillName} variant="outline" className="text-xs">
                            {s.skillName} · {s.rating}/5
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share button with tooltip */}
                  <div className="pt-1">
                    <div className="relative group inline-block">
                      <Button
                        size="sm"
                        onClick={() => handleShare(candidateId)}
                        disabled={isSharing || isShared}
                        className={isShared ? 'bg-green-600 hover:bg-green-600' : ''}
                      >
                        <UserCheck className="h-4 w-4 mr-1.5" />
                        {isShared ? 'Profile Shared' : isSharing ? 'Sharing...' : 'Share with Employer'}
                      </Button>
                      {!isShared && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-popover text-popover-foreground border text-xs rounded px-2.5 py-1.5 shadow-md whitespace-nowrap">
                            Forward this profile to employer
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Section 2: Candidate pool ── */}
      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Candidate Pool</h2>
          <span className="text-sm text-muted-foreground ml-1">— candidates not yet applied</span>
        </div>

        {/* Match % slider */}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Minimum match score</label>
              <span className="text-sm font-bold text-primary">{minMatch}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[minMatch]}
              onValueChange={(val) => setMinMatch(val[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-primary">{filteredPool.length}</div>
            <div className="text-xs text-muted-foreground">
              {filteredPool.length === 1 ? 'candidate' : 'candidates'}
            </div>
          </div>
        </div>

        {/* Status messages */}
        {!poolLoaded && (
          <p className="text-sm text-muted-foreground">Loading candidates…</p>
        )}
        {poolLoaded && poolCandidates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            All registered candidates have already interacted with this job.
          </p>
        )}
        {poolLoaded && poolCandidates.length > 0 && filteredPool.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No candidates meet the {minMatch}% threshold — try lowering the slider.
          </p>
        )}

        {/* Pool candidate cards */}
        <div className="space-y-3">
          {filteredPool.map((c) => {
            const isSending = sending.has(c._id);
            const isNotified = notified.has(c._id);

            return (
              <Card key={c._id} className={`transition-opacity ${isNotified ? 'opacity-60' : ''}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.user?.email}
                        {c.location ? ` · ${c.location}` : ''}
                        {` · ${c.yearsOfExperience} yrs exp`}
                      </p>
                      {c.topSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.topSkills.map((s) => (
                            <Badge key={s.skillName} variant="outline" className="text-xs">
                              {s.skillName} · {s.rating}/5
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            c.matchScore >= 70
                              ? 'text-green-600'
                              : c.matchScore >= 40
                              ? 'text-amber-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {c.matchScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">match</div>
                      </div>
                      <Button
                        size="sm"
                        variant={isNotified ? 'outline' : 'default'}
                        onClick={() => handleSendJob(c._id)}
                        disabled={isSending || isNotified}
                        className={isNotified ? 'text-green-600 border-green-300' : ''}
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        {isNotified ? 'Sent' : isSending ? 'Sending…' : 'Send Job'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
