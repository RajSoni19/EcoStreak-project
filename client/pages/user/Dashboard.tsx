import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  Calendar, 
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Target,
  Award,
  Zap,
  ChevronRight
} from "lucide-react";

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  pointsReward: number;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const userName = "Alex Johnson";
  const currentStreak = 15;
  const totalPoints = 1250;
  const globalRank = 42;
  const weeklyGoal = 7;
  const habitsLoggedThisWeek = 5;
  
  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: "1",
      name: "Community Tree Planting Day", 
      date: "2024-02-15",
      time: "09:00",
      location: "Central Park",
      organizer: "Green Earth Foundation",
      pointsReward: 25
    },
    {
      id: "2",
      name: "Ocean Cleanup Drive",
      date: "2024-02-18", 
      time: "07:30",
      location: "Marina Beach",
      organizer: "Ocean Cleanup Initiative",
      pointsReward: 30
    },
    {
      id: "3",
      name: "Sustainable Living Workshop",
      date: "2024-02-22",
      time: "14:00", 
      location: "Community Center",
      organizer: "Green Earth Foundation",
      pointsReward: 20
    }
  ]);

  const todayHabitsLogged = false; // This would come from actual data

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-orange-500";
    if (streak >= 14) return "text-eco-forest";
    if (streak >= 7) return "text-eco-sky";
    return "text-eco-earth";
  };

  const getStreakBgColor = (streak: number) => {
    if (streak >= 30) return "bg-orange-500/10";
    if (streak >= 14) return "bg-eco-forest/10";
    if (streak >= 7) return "bg-eco-sky/10";
    return "bg-eco-earth/10";
  };

  return (
    <DashboardLayout userRole="user" userName={userName}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-eco-forest/10 via-eco-leaf/5 to-eco-sky/10 rounded-xl p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {userName}! 🌱
          </h1>
          <p className="text-muted-foreground">
            Ready to make a positive impact today? Your eco-journey continues!
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Streak Counter */}
          <Card className="border-0 shadow-lg overflow-hidden relative">
            <div className={`absolute inset-0 ${getStreakBgColor(currentStreak)}`} />
            <CardContent className="p-6 relative">
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${getStreakBgColor(currentStreak)} flex items-center justify-center border-4 border-white shadow-lg`}>
                  <Flame className={`w-10 h-10 ${getStreakColor(currentStreak)}`} />
                </div>
                <div className={`text-3xl font-bold ${getStreakColor(currentStreak)} mb-1`}>
                  {currentStreak}
                </div>
                <p className="text-sm font-medium text-foreground">Day Streak!</p>
                <p className="text-xs text-muted-foreground mt-1">Keep it going! 🔥</p>
              </div>
            </CardContent>
          </Card>

          {/* Points Counter */}
          <Card className="border-0 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-eco-sage/20 to-eco-sky/10" />
            <CardContent className="p-6 relative">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-eco-sage/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <Sparkles className="w-10 h-10 text-eco-sage" />
                </div>
                <div className="text-3xl font-bold text-eco-sage mb-1">
                  {totalPoints.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-foreground">Points ✨</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to redeem!</p>
              </div>
            </CardContent>
          </Card>

          {/* Global Rank */}
          <Card className="border-0 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-eco-earth/20 to-eco-forest/10" />
            <CardContent className="p-6 relative">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-eco-earth/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <Trophy className="w-10 h-10 text-eco-earth" />
                </div>
                <div className="text-3xl font-bold text-eco-earth mb-1">
                  #{globalRank}
                </div>
                <p className="text-sm font-medium text-foreground">Global Rank</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-eco-forest" />
                  <p className="text-xs text-eco-forest">+3 this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-0 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-eco-sky/20 to-eco-leaf/10" />
            <CardContent className="p-6 relative">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-eco-sky/20 flex items-center justify-center border-4 border-white shadow-lg">
                  <Target className="w-10 h-10 text-eco-sky" />
                </div>
                <div className="text-3xl font-bold text-eco-sky mb-1">
                  {habitsLoggedThisWeek}/{weeklyGoal}
                </div>
                <p className="text-sm font-medium text-foreground">Weekly Goal</p>
                <div className="mt-2">
                  <Progress 
                    value={(habitsLoggedThisWeek / weeklyGoal) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-forest to-eco-leaf rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {todayHabitsLogged ? "Habits Logged Today! 🎉" : "Ready for Today's Impact?"}
                  </h3>
                  <p className="text-muted-foreground">
                    {todayHabitsLogged 
                      ? "Great job! You're building amazing eco-habits." 
                      : "Log your daily eco-habits and keep your streak alive!"
                    }
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/user/habits")}
                className="bg-gradient-to-r from-eco-forest to-eco-leaf hover:from-eco-forest/90 hover:to-eco-leaf/90 text-white px-8 py-3 h-auto"
                disabled={todayHabitsLogged}
              >
                {todayHabitsLogged ? "Complete! ✓" : "Log Today's Habits"}
                {!todayHabitsLogged && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-eco-sky" />
                Your Upcoming Events
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/user/events")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">Discover environmental events in your community</p>
                <Button onClick={() => navigate("/user/events")}>
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors hover:bg-accent/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{event.name}</h4>
                        <Badge className="bg-eco-sage/10 text-eco-sage border-eco-sage/20">
                          <Award className="w-3 h-3 mr-1" />
                          +{event.pointsReward} pts
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} at {event.time}
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
                  </div>
                ))}

                {upcomingEvents.length > 3 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/user/events")}
                      className="text-eco-forest hover:text-eco-forest/80"
                    >
                      View {upcomingEvents.length - 3} more events
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/user/leaderboard")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-eco-earth/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-eco-earth" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Leaderboard</h3>
              <p className="text-sm text-muted-foreground">See how you rank globally and in your communities</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/user/store")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-eco-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-eco-sage" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Rewards Store</h3>
              <p className="text-sm text-muted-foreground">Redeem your points for amazing eco-friendly rewards</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/user/communities")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-eco-sky/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-eco-sky" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Communities</h3>
              <p className="text-sm text-muted-foreground">Join eco-communities and connect with like-minded people</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
