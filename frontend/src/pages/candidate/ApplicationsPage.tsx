import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidates';
import type { ApplicationStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface ApplicationItem {
  _id: string;
  status: ApplicationStatus;
  matchScore: number;
  createdAt: string;
  job: {
    _id: string;
    title: string;
    jobType: string;
    workMode: string;
    location: string;
    employer: { companyName: string };
  };
}

const statusColor: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  applied: 'secondary',
  shortlisted: 'default',
  rejected: 'destructive',
  invited: 'outline',
  interview_scheduled: 'default',
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    candidateApi.getApplications().then((r) => setApplications(r.data as ApplicationItem[]));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>

      {applications.length === 0 && (
        <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
      )}

      {applications.map((app) => (
        <Link key={app._id} to={`/candidate/jobs/${app.job?._id}`} className="block group">
          <Card className="transition-shadow group-hover:shadow-md group-hover:border-primary/30 cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-lg flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    {app.job?.title}
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {app.job?.employer?.companyName} · {app.job?.jobType} · {app.job?.workMode} · {app.job?.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <Badge variant={statusColor[app.status]}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Match: {app.matchScore}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Applied {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
