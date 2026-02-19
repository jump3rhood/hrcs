import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { employerApi } from '@/api/employers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ShortlistCandidate {
  applicationId: {
    _id: string;
    matchScore: number;
    status: string;
    candidate: {
      _id: string;
      firstName: string;
      lastName: string;
      yearsOfExperience: number;
      location: string;
      bio: string;
      phone: string;
      user: { email: string };
    };
  };
  rank: number;
  notes: string;
  skills: { skillName: string; rating: number }[];
}

export default function EmployerShortlistPage() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const [shortlist, setShortlist] = useState<{ candidates: ShortlistCandidate[] } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (jobId) {
      employerApi.getShortlist(jobId).then((r) => setShortlist(r.data as { candidates: ShortlistCandidate[] }));
    }
  }, [jobId]);

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      await employerApi.updateApplicationStatus(applicationId, status);
      setShortlist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          candidates: prev.candidates.map((c) =>
            c.applicationId._id === applicationId
              ? { ...c, applicationId: { ...c.applicationId, status } }
              : c
          ),
        };
      });
      toast({ title: `Candidate marked as ${status.replace(/_/g, ' ')}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!shortlist) {
    return (
      <div className="text-center mt-20">
        <p className="text-muted-foreground">No shortlist has been created for this job yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shortlisted Candidates</h1>
      <p className="text-muted-foreground">{shortlist.candidates.length} candidates recommended by HR</p>

      {shortlist.candidates
        .sort((a, b) => a.rank - b.rank)
        .map((entry) => {
          const app = entry.applicationId;
          const c = app?.candidate;
          const isExpanded = expanded.has(app?._id ?? '');
          return (
            <Card key={app?._id} className="relative">
              <div className="absolute top-3 right-3 text-xs text-muted-foreground font-medium">
                #{entry.rank}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <CardTitle className="text-lg">{c?.firstName} {c?.lastName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {c?.yearsOfExperience} yrs exp · {c?.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-primary font-bold text-lg">{app?.matchScore}%</span>
                    <Badge variant={app?.status === 'shortlisted' ? 'default' : app?.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {app?.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 flex-wrap mb-2">
                  {entry.skills?.map((s) => (
                    <Badge key={s.skillName} variant="secondary" className="text-xs">{s.skillName}</Badge>
                  ))}
                </div>
                {entry.notes && (
                  <div className="bg-muted/50 rounded p-2 mb-3 text-sm">
                    <span className="font-medium">HR Notes: </span>{entry.notes}
                  </div>
                )}

                <Button size="sm" variant="outline" onClick={() => toggleExpand(app?._id ?? '')}>
                  {isExpanded ? 'Hide Details' : 'View Full Profile'}
                </Button>

                {isExpanded && c && (
                  <div className="mt-3 space-y-2 text-sm border-t pt-3">
                    <p><span className="font-medium">Email: </span>{c.user?.email}</p>
                    <p><span className="font-medium">Phone: </span>{c.phone || 'N/A'}</p>
                    {c.bio && <p><span className="font-medium">Bio: </span>{c.bio}</p>}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(app._id, 'interview_scheduled')}
                    disabled={app?.status === 'interview_scheduled'}
                  >
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                    disabled={app?.status === 'rejected'}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
