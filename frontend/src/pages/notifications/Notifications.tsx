import { useEffect, useState } from 'react';
import { notificationService } from '@/services/api';
import { Notification } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Bell, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Skeleton className="h-10 w-48" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
    </div>
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'TASK_OVERDUE': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'PROJECT_INVITATION': return <UserPlus className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Stay updated on your project activities.</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border rounded-lg bg-muted/20">
            <Bell className="h-10 w-10 mx-auto mb-4 opacity-20" />
            No new notifications.
          </div>
        ) : (
          notifications.map(notification => (
            <Card key={notification.id} className={!notification.is_read ? 'bg-primary/5 border-primary/20' : ''}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
