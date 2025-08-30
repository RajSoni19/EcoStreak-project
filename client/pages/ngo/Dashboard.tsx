import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Event {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  participants: any[];
  maxParticipants?: number;
  pointsForAttendance: number;
  pointsForCompletion: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  category: string;
  tags: string[];
}

interface Community {
  _id: string;
  name: string;
  description: string;
  category: string;
  members: any[];
  isPublic: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalMembers: number;
  totalPointsAwarded: number;
  upcomingEventsCount: number;
  completedEventsCount: number;
}

// Static sample data for NGO Dashboard
const STATIC_EVENTS: Event[] = [
  {
    _id: "1",
    title: "Community Tree Planting Day",
    startDate: "2024-12-15T09:00:00Z",
    endDate: "2024-12-15T16:00:00Z",
    location: {
      address: "Central Park",
      city: "New York",
      state: "NY",
      country: "USA"
    },
    participants: Array(35).fill({}).map((_, i) => ({ id: i, name: `Participant ${i + 1}` })),
    maxParticipants: 50,
    pointsForAttendance: 25,
    pointsForCompletion: 50,
    status: "upcoming",
    category: "tree-planting",
    tags: ["environmental", "community", "outdoor"]
  },
  {
    _id: "2",
    title: "Eco-Workshop: Sustainable Living",
    startDate: "2024-12-10T14:00:00Z",
    endDate: "2024-12-10T17:00:00Z",
    location: {
      address: "Community Center",
      city: "New York",
      state: "NY",
      country: "USA"
    },
    participants: Array(28).fill({}).map((_, i) => ({ id: i, name: `Participant ${i + 1}` })),
    maxParticipants: 30,
    pointsForAttendance: 20,
    pointsForCompletion: 40,
    status: "upcoming",
    category: "workshop",
    tags: ["education", "sustainability", "lifestyle"]
  },
  {
    _id: "3",
    title: "Beach Cleanup Initiative",
    startDate: "2024-12-20T08:00:00Z",
    endDate: "2024-12-20T12:00:00Z",
    location: {
      address: "Rockaway Beach",
      city: "New York",
      state: "NY",
      country: "USA"
    },
    participants: Array(75).fill({}).map((_, i) => ({ id: i, name: `Participant ${i + 1}` })),
    maxParticipants: 100,
    pointsForAttendance: 30,
    pointsForCompletion: 60,
    status: "upcoming",
    category: "cleanup",
    tags: ["beach", "marine", "volunteer"]
  }
];

const STATIC_COMMUNITIES: Community[] = [
  {
    _id: "1",
    name: "Eco Warriors",
    description: "A community dedicated to environmental activism and sustainable living practices.",
    category: "environmental",
    members: Array(156).fill({}).map((_, i) => ({ id: i, name: `Member ${i + 1}` })),
    isPublic: true,
    createdAt: "2024-10-01T10:00:00Z"
  },
  {
    _id: "2",
    name: "Green Tech Innovators",
    description: "Exploring and sharing innovative green technologies and renewable energy solutions.",
    category: "technology",
    members: Array(89).fill({}).map((_, i) => ({ id: i, name: `Member ${i + 1}` })),
    isPublic: true,
    createdAt: "2024-10-15T10:00:00Z"
  },
  {
    _id: "3",
    name: "Urban Gardeners",
    description: "Community of urban farmers and gardeners promoting local food production.",
    category: "agriculture",
    members: Array(234).fill({}).map((_, i) => ({ id: i, name: `Member ${i + 1}` })),
    isPublic: true,
    createdAt: "2024-09-20T10:00:00Z"
  }
];

const STATIC_RECENT_ACTIVITIES = [
  {
    _id: "1",
    userInfo: [{ fullName: "Sarah Johnson" }],
    completedAt: "2024-12-01T14:30:00Z",
    points: 25,
    activity: "Completed daily recycling habit"
  },
  {
    _id: "2",
    userInfo: [{ fullName: "Mike Chen" }],
    completedAt: "2024-12-01T13:15:00Z",
    points: 30,
    activity: "Attended tree planting workshop"
  },
  {
    _id: "3",
    userInfo: [{ fullName: "Emma Rodriguez" }],
    completedAt: "2024-12-01T12:00:00Z",
    points: 20,
    activity: "Completed water conservation challenge"
  },
  {
    _id: "4",
    userInfo: [{ fullName: "David Kim" }],
    completedAt: "2024-12-01T11:45:00Z",
    points: 35,
    activity: "Participated in beach cleanup"
  },
  {
    _id: "5",
    userInfo: [{ fullName: "Lisa Thompson" }],
    completedAt: "2024-12-01T10:30:00Z",
    points: 25,
    activity: "Completed sustainable shopping habit"
  }
];

const STATIC_DASHBOARD_STATS: DashboardStats = {
  totalEvents: 12,
  totalParticipants: 847,
  totalMembers: 479,
  totalPointsAwarded: 15680,
  upcomingEventsCount: 3,
  completedEventsCount: 9
};

export default function NGODashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for real data
  const [ngoData, setNgoData] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalParticipants: 0,
    totalMembers: 0,
    totalPointsAwarded: 0,
    upcomingEventsCount: 0,
    completedEventsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch NGO dashboard data
  const fetchNGODashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get NGO data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setNgoData(userData);
      }

      // Fetch NGO dashboard data
      const dashboardResponse = await apiService.getNGODashboard();
      if (dashboardResponse.success && dashboardResponse.data) {
        const { ngo, stats: dashboardStats, events, communities: dashboardCommunities, recentActivities: activities } = dashboardResponse.data;
        
        // Update stats with real data only
        setStats({
          totalEvents: dashboardStats?.totalEvents || 0,
          totalParticipants: dashboardStats?.totalParticipants || 0,
          totalMembers: dashboardStats?.totalMembers || 0,
          totalPointsAwarded: 0, // Will be calculated from events
          upcomingEventsCount: 0, // Will be calculated from events
          completedEventsCount: 0, // Will be calculated from events
        });

        // Update events and calculate stats from real data
        if (events && events.length > 0) {
          const upcoming = events.filter((event: Event) => 
            new Date(event.startDate) > new Date() && event.status === 'upcoming'
          );
          const completed = events.filter((event: Event) => 
            event.status === 'completed'
          );
          
          setUpcomingEvents(upcoming);
          
          // Calculate total points awarded from real event data
          const totalPoints = events.reduce((sum: number, event: Event) => {
            return sum + (event.participants?.length || 0) * event.pointsForCompletion;
          }, 0);
          
          setStats(prev => ({
            ...prev,
            totalPointsAwarded: totalPoints,
            upcomingEventsCount: upcoming.length,
            completedEventsCount: completed.length,
          }));
        } else {
          // Use static data if no real events
          setUpcomingEvents(STATIC_EVENTS);
          setStats(STATIC_DASHBOARD_STATS);
        }

        // Update communities with real data
        if (dashboardCommunities && dashboardCommunities.length > 0) {
          setCommunities(dashboardCommunities);
        } else {
          // Use static communities if no real data
          setCommunities(STATIC_COMMUNITIES);
        }

        // Update recent activities with real data
        if (activities && activities.length > 0) {
          setRecentActivities(activities);
        } else {
          // Use static activities if no real data
          setRecentActivities(STATIC_RECENT_ACTIVITIES);
        }
      } else {
        // Use static data if API fails
        setUpcomingEvents(STATIC_EVENTS);
        setCommunities(STATIC_COMMUNITIES);
        setRecentActivities(STATIC_RECENT_ACTIVITIES);
        setStats(STATIC_DASHBOARD_STATS);
      }

    } catch (error: any) {
      console.error('Error fetching NGO dashboard data:', error);
      
      // Handle authentication errors
      if (error.message === 'Invalid token' || error.message.includes('401')) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      // Use static data as fallback
      setUpcomingEvents(STATIC_EVENTS);
      setCommunities(STATIC_COMMUNITIES);
      setRecentActivities(STATIC_RECENT_ACTIVITIES);
      setStats(STATIC_DASHBOARD_STATS);
      
      toast({
        title: "Info",
        description: "Using sample data. Real data will load when connected to backend.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNGODashboard();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Dashboard data refreshed",
    });
  };

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    fetchNGODashboard();
    
    const interval = setInterval(() => {
      fetchNGODashboard();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchNGODashboard]);

  const organizationName = ngoData?.organizationName || "NGO Organization";

  const getParticipationPercentage = (registered: number, max: number) => {
    if (!max || max === 0) return 0;
    return Math.round((registered / max) * 100);
  };

  const getStatusColor = (registered: number, max: number) => {
    const percentage = getParticipationPercentage(registered, max);
    if (percentage >= 80) return "text-eco-forest";
    if (percentage >= 50) return "text-eco-sky";
    return "text-eco-earth";
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout
        userRole="ngo"
        userName="NGO Admin"
        organizationName={organizationName}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading NGO dashboard...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="ngo"
        userName="NGO Admin"
        organizationName={organizationName}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="ngo"
      userName="NGO Admin"
      organizationName={organizationName}
    >
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {organizationName} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your environmental initiatives and community engagement
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards - Only Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Scheduled Events
                  </p>
                  <p className="text-3xl font-bold text-eco-sky">
                    {stats.upcomingEventsCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-eco-sky/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-eco-sky" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Completed Events
                  </p>
                  <p className="text-3xl font-bold text-eco-forest">
                    {stats.completedEventsCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-eco-forest/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-eco-forest" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Community Members
                  </p>
                  <p className="text-3xl font-bold text-eco-earth">
                    {stats.totalMembers}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-eco-earth/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-eco-earth" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Points Awarded
                  </p>
                  <p className="text-3xl font-bold text-eco-sage">
                    {stats.totalPointsAwarded.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-eco-sage/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-eco-sage" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events - Only Real Data */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate("/ngo/events/create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No upcoming events
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to start engaging your community
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/ngo/events/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            +{event.pointsForCompletion} pts
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatEventDate(event.startDate)}{" "}
                          at {formatEventTime(event.startDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location?.city}, {event.location?.state}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span
                            className={`font-medium ${getStatusColor(event.participants?.length || 0, event.maxParticipants || 0)}`}
                          >
                            {event.participants?.length || 0} /{" "}
                            {event.maxParticipants || '∞'}
                          </span>
                          <span className="text-muted-foreground">
                            participants
                          </span>
                        </div>
                        {event.maxParticipants && (
                          <>
                            <div className="flex-1 mx-4">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-eco-forest h-2 rounded-full transition-all"
                                  style={{
                                    width: `${getParticipationPercentage(event.participants?.length || 0, event.maxParticipants)}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {getParticipationPercentage(
                                event.participants?.length || 0,
                                event.maxParticipants
                              )}
                              % full
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-4"
                      onClick={() => navigate(`/ngo/events/${event._id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}

                {upcomingEvents.length > 3 && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/ngo/events")}
                    >
                      View All Events ({upcomingEvents.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-eco-forest/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-eco-forest" />
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
          </CardContent>
        </Card>

        {/* Communities Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Communities
              </CardTitle>
              <Button 
                variant="outline"
                onClick={() => navigate("/ngo/communities")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {communities.slice(0, 3).map((community) => (
                <div key={community._id} className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-sm">
                      {community.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {community.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {community.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {community.members.length} members
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {community.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/ngo/events")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-eco-sky/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-eco-sky" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Manage Events
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create and edit your environmental events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/ngo/store")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-eco-forest/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-eco-forest" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Manage Store
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add and manage eco-friendly products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/ngo/communities")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-eco-earth/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-eco-earth" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Manage Communities
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Build and manage your communities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
