import { useState } from "react";
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

  // User data - would come from API/context in real app
  const userName = "Alex Johnson";
  const currentStreak = 45; // Changed to be multiple of 30 for demo
  const totalPoints = 2850;
  const globalRank = 42;
  const totalUsers = 5000;

  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: "1",
      name: "Community Tree Planting Day",
      date: "2024-02-15",
      time: "09:00",
      location: "Central Park",
      organizer: "Green Earth Foundation",
    },
    {
      id: "2",
      name: "Ocean Cleanup Drive",
      date: "2024-02-18",
      time: "07:30",
      location: "Marina Beach",
      organizer: "Ocean Cleanup Initiative",
    },
    {
      id: "3",
      name: "Sustainable Living Workshop",
      date: "2024-02-22",
      time: "14:00",
      location: "Community Center",
      organizer: "Green Earth Foundation",
    },
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const hasMultiplierActive = currentStreak % 30 === 0 && currentStreak > 0;

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
                <p className="text-sm text-orange-600">Amazing consistency!</p>
              </div>

              {hasMultiplierActive && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-bold animate-pulse">
                  🎉 2x Points Multiplier Active!
                </Badge>
              )}
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