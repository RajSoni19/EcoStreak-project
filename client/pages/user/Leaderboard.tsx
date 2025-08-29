import { useState } from "react";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Flame, 
  Star,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface GlobalUser {
  rank: number;
  name: string;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
  change: "up" | "down" | "same";
  avatar?: string;
}

interface Community {
  rank: number;
  name: string;
  totalPoints: number;
  memberCount: number;
  logo?: string;
  ngoName: string;
  change: "up" | "down" | "same";
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("global");

  const globalUsers: GlobalUser[] = [
    { rank: 1, name: "Emma Rodriguez", points: 4250, streak: 45, change: "same", avatar: "" },
    { rank: 2, name: "Michael Chen", points: 3890, streak: 38, change: "up" },
    { rank: 3, name: "Sarah Johnson", points: 3650, streak: 42, change: "down" },
    { rank: 4, name: "David Kim", points: 3420, streak: 35, change: "up" },
    { rank: 5, name: "Lisa Thompson", points: 3180, streak: 29, change: "same" },
    { rank: 6, name: "Carlos Mendez", points: 2950, streak: 31, change: "up" },
    { rank: 7, name: "Anna Petrov", points: 2840, streak: 28, change: "down" },
    { rank: 8, name: "James Wilson", points: 2720, streak: 33, change: "up" },
    { rank: 9, name: "Maria Garcia", points: 2680, streak: 26, change: "same" },
    { rank: 10, name: "Robert Taylor", points: 2540, streak: 30, change: "down" },
    // Current user somewhere in the middle
    { rank: 42, name: "Alex Johnson", points: 1250, streak: 15, isCurrentUser: true, change: "up" },
  ];

  const communities: Community[] = [
    { rank: 1, name: "Green Warriors", totalPoints: 45680, memberCount: 156, ngoName: "Green Earth Foundation", change: "same" },
    { rank: 2, name: "Ocean Guardians", totalPoints: 42340, memberCount: 142, ngoName: "Ocean Cleanup Initiative", change: "up" },
    { rank: 3, name: "Solar Pioneers", totalPoints: 38920, memberCount: 189, ngoName: "Solar Communities Network", change: "down" },
    { rank: 4, name: "Plastic-Free Heroes", totalPoints: 35670, memberCount: 124, ngoName: "Zero Waste Alliance", change: "up" },
    { rank: 5, name: "Climate Champions", totalPoints: 33480, memberCount: 167, ngoName: "Climate Action Coalition", change: "same" },
    { rank: 6, name: "Urban Forest", totalPoints: 31250, memberCount: 98, ngoName: "Urban Forest Project", change: "up" },
    { rank: 7, name: "Renewable Energy Hub", totalPoints: 28940, memberCount: 143, ngoName: "Green Power Initiative", change: "down" },
    { rank: 8, name: "Eco Innovators", totalPoints: 26780, memberCount: 115, ngoName: "Sustainability Lab", change: "up" },
    { rank: 9, name: "Water Savers", totalPoints: 24560, memberCount: 87, ngoName: "H2O Conservation", change: "same" },
    { rank: 10, name: "Carbon Neutrals", totalPoints: 22340, memberCount: 134, ngoName: "Carbon Zero Network", change: "down" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-eco-forest to-eco-leaf text-white";
    if (rank <= 50) return "bg-eco-sky/20 text-eco-sky";
    return "bg-muted text-muted-foreground";
  };

  const getChangeIcon = (change: "up" | "down" | "same") => {
    switch (change) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-eco-forest" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <DashboardLayout userRole="user" userName="Alex Johnson">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">🏆 Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you stack up against eco-warriors worldwide and in your communities
          </p>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Communities
            </TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-eco-earth" />
                  Global Eco-Warriors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {globalUsers.map((user) => (
                    <div 
                      key={user.rank}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        user.isCurrentUser 
                          ? 'bg-gradient-to-r from-eco-forest/10 to-eco-leaf/10 border-2 border-eco-forest/30 shadow-md' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center gap-2">
                          {getRankIcon(user.rank)}
                          {user.rank <= 3 && (
                            <Badge className={getRankBadgeColor(user.rank)}>
                              #{user.rank}
                            </Badge>
                          )}
                        </div>

                        {/* Avatar and Name */}
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={user.isCurrentUser ? "bg-eco-forest text-white" : ""}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`font-semibold ${user.isCurrentUser ? 'text-eco-forest' : 'text-foreground'}`}>
                              {user.name}
                              {user.isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs bg-eco-forest/10 text-eco-forest border-eco-forest/30">
                                  You
                                </Badge>
                              )}
                            </p>
                            {user.rank > 3 && (
                              <p className="text-sm text-muted-foreground">Rank #{user.rank}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-eco-sage" />
                          <span className="font-bold text-eco-sage">{user.points.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-orange-500">{user.streak}</span>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getChangeIcon(user.change)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communities Leaderboard */}
          <TabsContent value="communities" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-eco-sky" />
                  Top Eco-Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communities.map((community) => (
                    <div 
                      key={community.rank}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center gap-2">
                          {getRankIcon(community.rank)}
                          {community.rank <= 3 && (
                            <Badge className={getRankBadgeColor(community.rank)}>
                              #{community.rank}
                            </Badge>
                          )}
                        </div>

                        {/* Community Info */}
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={community.logo} />
                            <AvatarFallback className="bg-eco-sky/20 text-eco-sky">
                              {getInitials(community.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{community.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>by {community.ngoName}</span>
                              {community.rank > 3 && <span>Rank #{community.rank}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-eco-sage" />
                            <span className="font-bold text-eco-sage">{community.totalPoints.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{community.memberCount} members</span>
                          </div>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getChangeIcon(community.change)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User's Current Position Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-eco-forest/5 to-eco-leaf/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Current Standing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-earth mb-1">#42</div>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-eco-forest" />
                    <span className="text-xs text-eco-forest">+3 this week</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-sage mb-1">1,250</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-xs text-muted-foreground mt-1">850 points to rank #35</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">15</div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep it going! 🔥</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
