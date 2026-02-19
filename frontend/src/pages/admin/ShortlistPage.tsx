import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface AppRow {
  _id: string;
  matchScore: number;
  status: string;
  skills: { skillName: string; rating: number }[];
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    yearsOfExperience: number;
    location: string;
    user: { email: string };
  };
}

interface ShortlistEntry {
  applicationId: string;
  rank: number;
  notes: string;
}

export default function AdminShortlistPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [selected, setSelected] = useState<Map<string, ShortlistEntry>>(new Map());

  useEffect(() => {
    if (jobId) {
      adminApi.getJobApplications(jobId).then((r) => setApplications(r.data as AppRow[]));
    }
  }, [jobId]);

  const toggle = (app: AppRow) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(app._id)) {
        next.delete(app._id);
      } else if (next.size < 5) {
        next.set(app._id, { applicationId: app._id, rank: next.size + 1, notes: '' });
      } else {
        toast({ title: 'Maximum 5 candidates per shortlist', variant: 'destructive' });
      }
      return next;
    });
  };

  const updateNotes = (appId: string, notes: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const entry = next.get(appId);
      if (entry) next.set(appId, { ...entry, notes });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!jobId || selected.size === 0) return;
    try {
      const candidates = [...selected.values()].map((e, i) => ({ ...e, rank: i + 1 }));
      await adminApi.createShortlist(jobId, candidates);
      toast({ title: 'Shortlist created and sent to employer!' });
      navigate('/admin/jobs');
    } catch {
      toast({ title: 'Failed to create shortlist', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create Shortlist</h1>
      <p className="text-muted-foreground">
        Select 3–5 candidates to shortlist. {selected.size}/5 selected.
      </p>
      {applications.length === 0 && <p className="text-muted-foreground">No applications yet for this job.</p>}
      <div className="space-y-3">
        {applications.map((app) => {
          const isSelected = selected.has(app._id);
          return (
            <Card key={app._id} className={isSelected ? 'border-primary' : ''}>
              <CardHeader className="py-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggle(app)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {app.candidate?.firstName} {app.candidate?.lastName}
                      </CardTitle>
                      <span className="text-primary font-bold">{app.matchScore}% match</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.candidate?.yearsOfExperience} yrs exp · {app.candidate?.location}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {app.skills?.slice(0, 4).map((s) => (
                        <Badge key={s.skillName} variant="secondary" className="text-xs">{s.skillName}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent>
                  <Textarea
                    placeholder="Admin notes for employer…"
                    value={selected.get(app._id)?.notes ?? ''}
                    onChange={(e) => updateNotes(app._id, e.target.value)}
                    rows={2}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={selected.size === 0}>
          Submit Shortlist ({selected.size})
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/jobs')}>Cancel</Button>
      </div>
    </div>
  );
}
