import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  UserPlus,
  Leaf,
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string;
  ngoName: string;
  ngoLogo?: string;
  memberCount: number;
  totalPoints: number;
  location: string;
  category: string;
  isJoined: boolean;
  recentActivity: string;
  createdDate: string;
  featuredActivity?: string;
}

export default function Communities() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([
    "2",
    "5",
  ]); // User is already in these communities

  const communities: Community[] = [
    {
      id: "1",
      name: "Green Warriors",
      description:
        "Join us in the fight against climate change! We organize tree planting, beach cleanups, and eco-awareness events.",
      ngoName: "Green Earth Foundation",
      memberCount: 156,
      totalPoints: 45680,
      location: "San Francisco, CA",
      category: "Environmental Action",
      isJoined: false,
      recentActivity: "Organized beach cleanup last weekend",
      createdDate: "2023-03-15",
      featuredActivity: "Tree Planting Day - Feb 15",
    },
    {
      id: "2",
      name: "Ocean Guardians",
      description:
        "Protecting our marine ecosystems through cleanup drives, education, and sustainable living practices.",
      ngoName: "Ocean Cleanup Initiative",
      memberCount: 142,
      totalPoints: 42340,
      location: "Los Angeles, CA",
      category: "Marine Conservation",
      isJoined: true,
      recentActivity: "Weekly plastic collection drive",
      createdDate: "2023-04-20",
      featuredActivity: "Ocean Cleanup Drive - Feb 18",
    },
    {
      id: "3",
      name: "Solar Pioneers",
      description:
        "Advancing renewable energy adoption in communities. Learn about solar power and sustainable energy solutions.",
      ngoName: "Solar Communities Network",
      memberCount: 189,
      totalPoints: 38920,
      location: "Austin, TX",
      category: "Renewable Energy",
      isJoined: false,
      recentActivity: "Solar workshop for beginners",
      createdDate: "2023-02-10",
    },
    {
      id: "4",
      name: "Plastic-Free Heroes",
      description:
        "Working towards a plastic-free world through education, alternatives, and community action.",
      ngoName: "Zero Waste Alliance",
      memberCount: 124,
      totalPoints: 35670,
      location: "Portland, OR",
      category: "Zero Waste",
      isJoined: false,
      recentActivity: "Plastic-free challenge completed",
      createdDate: "2023-05-08",
    },
    {
      id: "5",
      name: "Urban Forest",
      description:
        "Creating green spaces in urban areas. Join us for tree planting, garden maintenance, and green infrastructure projects.",
      ngoName: "Urban Forest Project",
      memberCount: 98,
      totalPoints: 31250,
      location: "Seattle, WA",
      category: "Urban Ecology",
      isJoined: true,
      recentActivity: "Community garden expansion",
      createdDate: "2023-06-12",
    },
    {
      id: "6",
      name: "Climate Champions",
      description:
        "Youth-led movement for climate action. Engage in advocacy, education, and community climate initiatives.",
      ngoName: "Climate Action Coalition",
      memberCount: 167,
      totalPoints: 33480,
      location: "New York, NY",
      category: "Climate Action",
      isJoined: false,
      recentActivity: "Climate march organization",
      createdDate: "2023-01-25",
    },
    {
      id: "7",
      name: "Eco Innovators",
      description:
        "Exploring cutting-edge environmental technologies and sustainable innovation for a greener future.",
      ngoName: "Sustainability Lab",
      memberCount: 115,
      totalPoints: 26780,
      location: "San Diego, CA",
      category: "Innovation",
      isJoined: false,
      recentActivity: "Green tech showcase event",
      createdDate: "2023-07-03",
    },
    {
      id: "8",
      name: "Water Savers",
      description:
        "Conservation-focused community working on water preservation, rainwater harvesting, and sustainable water use.",
      ngoName: "H2O Conservation",
      memberCount: 87,
      totalPoints: 24560,
      location: "Denver, CO",
      category: "Water Conservation",
      isJoined: false,
      recentActivity: "Rainwater harvesting workshop",
      createdDate: "2023-08-14",
    },
  ];

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities((prev) => [...prev, communityId]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Environmental Action":
        "bg-eco-forest/10 text-eco-forest border-eco-forest/20",
      "Marine Conservation": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Renewable Energy":
        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "Zero Waste": "bg-eco-sage/10 text-eco-sage border-eco-sage/20",
      "Urban Ecology": "bg-eco-leaf/10 text-eco-leaf border-eco-leaf/20",
      "Climate Action": "bg-eco-sky/10 text-eco-sky border-eco-sky/20",
      Innovation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Water Conservation": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    };
    return colors[category] || "bg-muted text-muted-foreground border-muted";
  };

  const joinedCount = joinedCommunities.length;

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-eco-sky" />
            Eco-Communities
          </h1>
          <p className="text-muted-foreground">
            Connect with like-minded environmental advocates and make a
            collective impact
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-sky/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-eco-sky" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Communities Joined
                  </p>
                  <p className="text-2xl font-bold text-eco-sky">
                    {joinedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-forest/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-eco-forest" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Available Communities
                  </p>
                  <p className="text-2xl font-bold text-eco-forest">
                    {communities.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-sage/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-eco-sage" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Community Points
                  </p>
                  <p className="text-2xl font-bold text-eco-sage">
                    {communities
                      .filter((c) => joinedCommunities.includes(c.id))
                      .reduce((sum, c) => sum + c.totalPoints, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search communities by name, category, location, or NGO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCommunities.map((community) => {
            const isJoined = joinedCommunities.includes(community.id);

            return (
              <Card
                key={community.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                onClick={() => navigate(`/user/community/${community.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={community.ngoLogo} />
                        <AvatarFallback className="bg-eco-sky/20 text-eco-sky">
                          {getInitials(community.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">
                            {community.name}
                          </CardTitle>
                          {isJoined && (
                            <Badge className="bg-eco-forest/10 text-eco-forest border-eco-forest/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Joined
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(community.category)}
                        >
                          {community.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-eco-sky" />
                      <span className="font-medium">
                        {community.memberCount}
                      </span>
                      <span className="text-muted-foreground">members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-eco-sage" />
                      <span className="font-medium">
                        {community.totalPoints.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">points</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {community.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        by {community.ngoName}
                      </span>
                    </div>
                  </div>

                  {community.recentActivity && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Recent Activity
                      </p>
                      <p className="text-sm font-medium">
                        {community.recentActivity}
                      </p>
                    </div>
                  )}

                  {community.featuredActivity && (
                    <div className="bg-eco-forest/5 border border-eco-forest/20 rounded-lg p-3">
                      <p className="text-xs text-eco-forest mb-1">
                        Upcoming Event
                      </p>
                      <p className="text-sm font-medium text-eco-forest">
                        {community.featuredActivity}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Founded{" "}
                        {new Date(community.createdDate).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>

                    {!isJoined ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinCommunity(community.id);
                        }}
                        className="bg-gradient-to-r from-eco-forest to-eco-leaf hover:from-eco-forest/90 hover:to-eco-leaf/90 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-eco-forest/30 text-eco-forest hover:bg-eco-forest/10"
                      >
                        View Community
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No communities found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms to find communities"
                  : "No communities are available at the moment"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}
