import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, ArrowLeft, UserCheck } from 'lucide-react';

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

export default function AdminJobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobSkills, setJobSkills] = useState<JobSkill[]>([]);
  const [sharing, setSharing] = useState<Set<string>>(new Set());
  const [shared, setShared] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId) return;
    adminApi.getJobApplications(jobId).then((r) => {
      const apps = r.data as ApplicationRow[];
      setApplications(apps);
      // Extract job skills from the first application if available
      if (apps.length > 0 && apps[0].job?.skills) {
        setJobSkills(apps[0].job.skills);
      }
    });
    // Fetch job title from the all-jobs list
    fetch('/api/admin/all-jobs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((jobs: { _id: string; title: string; skills: JobSkill[] }[]) => {
        const job = jobs.find((j) => j._id === jobId);
        if (job) { setJobTitle(job.title); setJobSkills(job.skills); }
      })
      .catch(() => {});
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

  const candidateSkillSet = (skills: Skill[]) =>
    new Set(skills.map((s) => s.skillName.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/jobs"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          {jobTitle && <p className="text-muted-foreground text-sm">{jobTitle}</p>}
        </div>
      </div>

      {applications.length === 0 && (
        <p className="text-muted-foreground">No applications yet for this job.</p>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          const candidateId = app.candidate?._id;
          const skillSet = candidateSkillSet(app.skills ?? []);
          const requiredSkills = jobSkills.filter((s) => s.required);
          const optionalSkills = jobSkills.filter((s) => !s.required);
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
                    <Badge variant={app.status === 'applied' ? 'secondary' : 'default'} className="capitalize">
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Skill match breakdown */}
                {requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Required Skills</p>
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
                            {has
                              ? <CheckCircle2 className="h-3 w-3" />
                              : <XCircle className="h-3 w-3" />
                            }
                            {s.skillName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {optionalSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Optional Skills</p>
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

                {/* Candidate's full skill set */}
                {app.skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">All Candidate Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.skills.map((s) => (
                        <Badge key={s.skillName} variant="outline" className="text-xs">
                          {s.skillName} · {s.rating}/5
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleShare(candidateId)}
                    disabled={isSharing || isShared}
                    className={isShared ? 'bg-green-600 hover:bg-green-600' : ''}
                  >
                    <UserCheck className="h-4 w-4 mr-1.5" />
                    {isShared ? 'Profile Shared' : isSharing ? 'Sharing...' : 'Share with Employer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
