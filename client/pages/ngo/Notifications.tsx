import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function NGONotifications() {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getNGONotifications();
      if (response.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh notifications
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Notifications refreshed",
    });
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading notifications...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Send updates and announcements to your community</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.filter(n => n.status === 'sent').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.filter(n => n.status === 'read').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by sending your first notification
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Send Your First Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{notification.title || 'Untitled'}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {notification.type || 'general'}
                        </Badge>
                        <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                          {notification.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {notification.message || 'No message content'}
                  </p>
                  
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
