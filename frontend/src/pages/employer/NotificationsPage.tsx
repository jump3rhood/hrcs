import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employerApi } from '@/api/employers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Bell } from 'lucide-react';

interface EmployerNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  jobId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmployerNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<EmployerNotification[]>([]);

  useEffect(() => {
    employerApi.getNotifications().then((r) =>
      setNotifications(r.data as EmployerNotification[])
    );
  }, []);

  const handleClick = async (n: EmployerNotification) => {
    if (!n.isRead) {
      await employerApi.markNotificationRead(n._id);
      setNotifications((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
      );
    }
    if (n.jobId) navigate(`/employer/jobs/${n.jobId}/shortlist`);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 && (
        <p className="text-muted-foreground">No notifications yet.</p>
      )}

      {notifications.map((n) => (
        <Card
          key={n._id}
          onClick={() => handleClick(n)}
          className={`cursor-pointer transition-all hover:shadow-md ${
            !n.isRead
              ? 'border-accent/40 bg-accent/5'
              : ''
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <UserCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <CardTitle className="text-base font-semibold">{n.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && <Badge variant="default" className="text-xs">New</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{n.message}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {n.jobId && (
                <span className="text-xs text-accent font-medium">View job →</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
