import { useState, useEffect } from "react";
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
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  registeredParticipants: number;
  maxParticipants: number;
  pointsAwarded: number;
  status: "upcoming" | "ongoing" | "completed";
}

export default function NGODashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for real data
  const [ngoData, setNgoData] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    scheduledEvents: 0,
    completedEvents: 0,
    totalMembers: 0,
    totalPointsAwarded: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNGODashboard = async () => {
      try {
        setIsLoading(true);
        
        // Get NGO data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setNgoData(JSON.parse(storedUser));
        }

        // Fetch NGO dashboard data
        const dashboardResponse = await apiService.getNGODashboard();
        if (dashboardResponse.success) {
          const { ngo, stats: dashboardStats, events } = dashboardResponse.data;
          
          // Update stats
          setStats({
            scheduledEvents: dashboardStats.totalEvents,
            completedEvents: dashboardStats.totalEvents, // You can filter by status if needed
            totalMembers: dashboardStats.totalMembers,
            totalPointsAwarded: 0, // Calculate from events if needed
          });

          // Update events
          if (events && events.length > 0) {
            setUpcomingEvents(events.map((event: any) => ({
              id: event._id,
              name: event.title,
              date: event.startDate,
              time: new Date(event.startDate).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              location: `${event.location?.city || ''}, ${event.location?.state || ''}`,
              registeredParticipants: event.participants?.length || 0,
              maxParticipants: event.maxParticipants || 0,
              pointsAwarded: 25, // Default points, can be configured
              status: event.status,
            })));
          }
        }

      } catch (error: any) {
        console.error('Error fetching NGO dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load NGO dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNGODashboard();
  }, [toast]);

  const organizationName = ngoData?.organizationName || "NGO Organization";

  const getParticipationPercentage = (registered: number, max: number) => {
    return Math.round((registered / max) * 100);
  };

  const getStatusColor = (registered: number, max: number) => {
    const percentage = getParticipationPercentage(registered, max);
    if (percentage >= 80) return "text-eco-forest";
    if (percentage >= 50) return "text-eco-sky";
    return "text-eco-earth";
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

  return (
    <DashboardLayout
      userRole="ngo"
      userName="NGO Admin"
      organizationName={organizationName}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {organizationName} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your environmental initiatives and community engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Scheduled Events
                  </p>
                  <p className="text-3xl font-bold text-eco-sky">
                    {stats.scheduledEvents}
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
                    {stats.completedEvents}
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
                    {stats.totalPointsAwarded}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-eco-sage/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-eco-sage" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
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
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {event.name}
                        </h3>
                        <Badge variant="outline" className="ml-2">
                          +{event.pointsAwarded} pts
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span
                            className={`font-medium ${getStatusColor(event.registeredParticipants, event.maxParticipants)}`}
                          >
                            {event.registeredParticipants} /{" "}
                            {event.maxParticipants}
                          </span>
                          <span className="text-muted-foreground">
                            participants
                          </span>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-eco-forest h-2 rounded-full transition-all"
                              style={{
                                width: `${getParticipationPercentage(event.registeredParticipants, event.maxParticipants)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getParticipationPercentage(
                            event.registeredParticipants,
                            event.maxParticipants,
                          )}
                          % full
                        </span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="ml-4">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {upcomingEvents.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All Events ({upcomingEvents.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
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
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
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
                    Community
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your eco-community members
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/ngo/store")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-eco-sage/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-eco-sage" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Rewards Store
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage environmental rewards
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
