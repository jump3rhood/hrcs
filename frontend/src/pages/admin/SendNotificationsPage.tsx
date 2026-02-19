import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { employerApi } from '@/api/employers';
import type { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CandidateRow {
  _id: string;
  firstName: string;
  lastName: string;
  yearsOfExperience: number;
  user: { email: string };
  topSkills: { skillName: string; rating: number }[];
}

export default function AdminSendNotificationsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId) return;
    adminApi.getCandidates({ page: 1 }).then((r) => {
      const data = r.data as { candidates: CandidateRow[] };
      setCandidates(data.candidates);
    });
    employerApi.getJobs().then((r) => {
      const found = r.data.find((j) => j._id === jobId);
      if (found) setJob(found);
    });
  }, [jobId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!jobId || selected.size === 0) return;
    try {
      const res = await adminApi.sendJobNotifications(jobId, [...selected]);
      const data = res.data as { sent: number };
      toast({ title: `Sent ${data.sent} notifications` });
      navigate('/admin/jobs');
    } catch {
      toast({ title: 'Error sending notifications', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Send Notifications</h1>
      {job && (
        <Card>
          <CardHeader><CardTitle>Job: {job.title}</CardTitle></CardHeader>
        </Card>
      )}
      <p className="text-muted-foreground">
        Select candidates to notify about this job. {selected.size} selected.
      </p>
      <div className="space-y-2">
        {candidates.map((c) => (
          <div
            key={c._id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer"
            onClick={() => toggle(c._id)}
          >
            <Checkbox checked={selected.has(c._id)} onCheckedChange={() => toggle(c._id)} />
            <div className="flex-1">
              <p className="font-medium">{c.firstName} {c.lastName}</p>
              <p className="text-sm text-muted-foreground">{c.user?.email} · {c.yearsOfExperience} yrs exp</p>
            </div>
            <div className="flex gap-1">
              {c.topSkills?.slice(0, 3).map((s) => (
                <Badge key={s.skillName} variant="secondary" className="text-xs">{s.skillName}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSend} disabled={selected.size === 0}>
          Send to {selected.size} candidates
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/jobs')}>Cancel</Button>
      </div>
    </div>
  );
}
