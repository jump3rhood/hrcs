import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '@/api/candidates';
import type { Notification } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    candidateApi.getNotifications().then((r) => setNotifications(r.data as Notification[]));
  }, []);

  const handleJobInvitationClick = async (n: Notification) => {
    if (!n.isRead) {
      await candidateApi.markNotificationRead(n._id);
      setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.jobId) {
      navigate(`/candidate/jobs/${n.jobId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {notifications.length === 0 && <p className="text-muted-foreground">No notifications yet.</p>}
      {notifications.map((n) => (
        <Card
          key={n._id}
          className={`transition-colors ${n.type === 'job_invitation' ? 'cursor-pointer' : 'cursor-default'} ${!n.isRead ? 'border-primary bg-primary/5' : ''}`}
          onClick={n.type === 'job_invitation' ? () => handleJobInvitationClick(n) : undefined}
        >
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{n.title}</CardTitle>
              <div className="flex items-center gap-2">
                {n.matchScore !== undefined && (
                  <span className="text-sm font-bold text-primary">{n.matchScore}% match</span>
                )}
                {!n.isRead && <Badge className="text-xs">New</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
