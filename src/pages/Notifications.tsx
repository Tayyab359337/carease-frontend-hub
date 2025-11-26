import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notificationAPI } from '@/services/api/mockService';
import { Notification } from '@/services/api/types';
import { toast } from '@/hooks/use-toast';
import { Bell, Check, Info, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getNotifications(user!.id);
      setNotifications(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="default" className="bg-destructive text-destructive-foreground">
                  {unreadNotifications.length} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your latest activity</p>
          </div>
        </div>

        {unreadNotifications.length > 0 && (
          <Card className="shadow-md border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Unread ({unreadNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg bg-primary-light/10 hover:bg-primary-light/20 transition-colors"
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as read
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {readNotifications.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Earlier Notifications</CardTitle>
              <CardDescription>{readNotifications.length} read notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg opacity-75"
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {notifications.length === 0 && (
          <Card className="shadow-md">
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll see notifications here when there's activity
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
