import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalEvents: number;
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
  totalRewards: number;
  upcomingEvents: any[];
  recentPosts: any[];
  recentActivities: any[];
}

export default function NGOAnalytics() {
  const { toast } = useToast();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getNGODashboardExtended();
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to load analytics');
      
      if (error.message === 'Invalid token' || error.message.includes('401')) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Analytics data refreshed",
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your organization's performance and engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
              className="p-2 border rounded-md"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 text-green-600" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalCommunities || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 text-green-600" />
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 text-green-600" />
                +15% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalPosts || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 text-green-600" />
                +22% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.recentActivities && analyticsData.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-eco-forest/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-eco-forest" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.userInfo?.[0]?.fullName || 'Community Member'} completed a habit
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{activity.points || 0} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Community Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.recentPosts && analyticsData.recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.recentPosts.slice(0, 5).map((post, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{post.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {post.category || 'general'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        by {post.author?.fullName || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent posts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Charts and detailed analytics coming soon</p>
                <p className="text-sm text-muted-foreground">This will include event participation trends, community growth, and engagement metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
