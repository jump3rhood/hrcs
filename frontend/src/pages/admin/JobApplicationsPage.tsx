import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ArrowLeft, UserCheck, Send } from 'lucide-react';

interface Skill { skillName: string; rating: number }
interface JobSkill { skillName: string; required: boolean }

interface MatchedCandidate {
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    location: string;
    yearsOfExperience: number;
    user: { email: string };
  };
  skills: Skill[];
  matchScore: number;
  applied: boolean;
  applicationStatus: string | null;
  applicationId: string | null;
}

type TabFilter = 'all' | 'applied' | 'not-applied';

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (s === 'shortlisted' || s === 'interview_scheduled') return 'default';
  if (s === 'rejected') return 'destructive';
  if (s === 'invited') return 'outline';
  return 'secondary';
};

export default function AdminJobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();

  const [matchedCandidates, setMatchedCandidates] = useState<MatchedCandidate[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobSkills, setJobSkills] = useState<JobSkill[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [tab, setTab] = useState<TabFilter>('all');
  const [minMatch, setMinMatch] = useState(0);

  const [sharing, setSharing] = useState<Set<string>>(new Set());
  const [shared, setShared] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      try {
        const [matchedRes, jobsRes] = await Promise.all([
          adminApi.getMatchedCandidates(jobId),
          adminApi.getAllJobs(),
        ]);

        const matched = matchedRes.data as MatchedCandidate[];
        setMatchedCandidates(matched);

        const jobs = jobsRes.data as { _id: string; title: string; skills: JobSkill[] }[];
        const foundJob = jobs.find((j) => j._id === jobId);
        if (foundJob) {
          setJobTitle(foundJob.title);
          setJobSkills(foundJob.skills);
        }
      } catch (err) {
        console.error('[JobApplicationsPage] load error:', err);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [jobId]);

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

  const requiredSkills = jobSkills.filter((s) => s.required);

  const filtered = matchedCandidates.filter((m) => {
    if (m.matchScore < minMatch) return false;
    if (tab === 'applied') return m.applied;
    if (tab === 'not-applied') return !m.applied;
    return true;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All Matches' },
    { key: 'applied', label: 'Applied' },
    { key: 'not-applied', label: 'Not Applied' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/jobs"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Skill-Matched Candidates</h1>
          {jobTitle && <p className="text-muted-foreground text-sm">{jobTitle}</p>}
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => {
          const count = matchedCandidates.filter((m) => {
            if (t.key === 'applied') return m.applied;
            if (t.key === 'not-applied') return !m.applied;
            return true;
          }).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tab === t.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20' : 'bg-muted'
              }`}>{count}</span>
            </button>
          );
        })}
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
          <div className="text-2xl font-bold text-primary">{filtered.length}</div>
          <div className="text-xs text-muted-foreground">
            {filtered.length === 1 ? 'candidate' : 'candidates'}
          </div>
        </div>
      </div>

      {/* Status messages */}
      {!loaded && <p className="text-sm text-muted-foreground">Loading candidates…</p>}
      {loaded && matchedCandidates.length === 0 && (
        <p className="text-sm text-muted-foreground">No skill-matched candidates found for this job.</p>
      )}
      {loaded && matchedCandidates.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No candidates match the current filters — try lowering the match score or switching tabs.
        </p>
      )}

      {/* Candidate cards */}
      <div className="space-y-4">
        {filtered.map((m) => {
          const c = m.candidate;
          const candidateId = c._id;
          const candidateSkillSet = new Set(m.skills.map((s) => s.skillName.toLowerCase()));
          const isShared = shared.has(candidateId);
          const isSharing = sharing.has(candidateId);
          const isSending = sending.has(candidateId);
          const isNotified = notified.has(candidateId);

          return (
            <Card key={candidateId} className={`overflow-hidden transition-opacity ${isNotified && !m.applied ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {c.firstName} {c.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {c.user?.email} · {c.location} · {c.yearsOfExperience} yrs exp
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        m.matchScore >= 70 ? 'text-green-600' :
                        m.matchScore >= 40 ? 'text-amber-600' :
                        'text-muted-foreground'
                      }`}>{m.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                    {m.applied && m.applicationStatus && (
                      <Badge variant={statusVariant(m.applicationStatus)} className="capitalize">
                        {m.applicationStatus.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {!m.applied && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not Applied
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Required skill match overlay */}
                {requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((s) => {
                        const has = candidateSkillSet.has(s.skillName.toLowerCase());
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

                {/* All candidate skills */}
                {m.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      All Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.skills.map((s) => (
                        <Badge key={s.skillName} variant="outline" className="text-xs">
                          {s.skillName} · {s.rating}/5
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {m.applied ? (
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
                  ) : (
                    <Button
                      size="sm"
                      variant={isNotified ? 'outline' : 'default'}
                      onClick={() => handleSendJob(candidateId)}
                      disabled={isSending || isNotified}
                      className={isNotified ? 'text-green-600 border-green-300' : ''}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      {isNotified ? 'Sent' : isSending ? 'Sending…' : 'Send Job'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
