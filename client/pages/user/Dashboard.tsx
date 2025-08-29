import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Sparkles,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Target,
  Star,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for real data
  const [userData, setUserData] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }

        // Fetch upcoming events
        const eventsResponse = await apiService.getEvents({ status: 'upcoming', limit: 3 });
        if (eventsResponse.success) {
          setUpcomingEvents(eventsResponse.data.events.map((event: any) => ({
            id: event._id,
            name: event.title,
            date: event.startDate,
            time: new Date(event.startDate).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            location: `${event.location?.city || ''}, ${event.location?.state || ''}`,
            organizer: event.organizer?.organizationName || event.organizer?.fullName || 'Unknown',
          })));
        }

        // Fetch user rank (only if user is logged in)
        try {
          const rankResponse = await apiService.getUserRank();
          if (rankResponse.success) {
            setUserRank(rankResponse.data);
          }
        } catch (error) {
          // User rank fetch failed (likely not logged in), continue without it
          console.log('User rank not available (user may not be logged in)');
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Get user info with fallbacks
  const userName = userData?.fullName || "User";
  const currentStreak = userData?.currentStreak || 0;
  const longestStreak = userData?.longestStreak || 0;
  const totalPoints = userData?.totalPoints || 0;
  const pointsGiven = userData?.pointsGiven || 0;
  const globalRank = userRank?.rank?.global || 0;
  const totalUsers = userRank?.rank?.total || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const hasMultiplierActive = currentStreak % 30 === 0 && currentStreak > 0;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to make a positive environmental impact today?
          </p>
        </div>

        {/* Main Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget 1: Streak Counter (Primary Focus) */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4 shadow-lg">
                  <Flame className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl font-bold text-orange-600 mb-2">
                  {currentStreak}
                </div>
                <p className="text-xl font-semibold text-orange-700 mb-2">
                  Day Streak! 🔥
                </p>
                <p className="text-sm text-orange-600">
                  Longest: {longestStreak} days
                </p>
              </div>

              {hasMultiplierActive && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-bold animate-pulse">
                  🎉 2x Points Multiplier Active!
                </Badge>
              )}

              {/* Streak Info */}
              <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                <p className="text-xs text-orange-700">
                  💡 Complete at least one habit daily to maintain your streak!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Widget 2: Points Balance */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">
                    Your Points ✨
                  </p>
                  <p className="text-4xl font-bold text-green-700">
                    {totalPoints.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Ready to redeem!
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    Given: {pointsGiven.toLocaleString()} pts
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 3: Call-to-Action */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Ready for Today?
                </h3>
                <p className="text-sm text-blue-600 mb-4">
                  Log your daily eco-habits and keep your streak alive!
                </p>
                <Button
                  onClick={() => navigate("/user/habits")}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg"
                >
                  Log Today's Habits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Widget 4: Leaderboard Snapshot */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">
                    Your Global Rank
                  </p>
                  <p className="text-4xl font-bold text-purple-700">
                    #{globalRank}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    of {totalUsers.toLocaleString()} users
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 5: Upcoming Events */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Your Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover environmental events in your community
                  </p>
                  <Button
                    onClick={() => navigate("/user/events")}
                    variant="outline"
                  >
                    Browse Events
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
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
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.organizer}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/user/events")}
                    >
                      View All Events
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">This Week:</span>
                <span className="text-lg font-bold text-green-600">
                  +245 pts
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Communities:</span>
                <span className="text-lg font-bold text-blue-600">
                  3 joined
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">This Month:</span>
                <span className="text-lg font-bold text-purple-600">
                  28/30 days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}