import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Star,
  Heart,
  Send,
  ArrowLeft,
  Calendar,
  Trophy,
  Gift,
  CheckCircle,
  Sparkles,
  MapPin,
  TrendingUp,
} from "lucide-react";

interface CommunityMember {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  joinedDate: string;
  isCurrentUser?: boolean;
}

interface FeedPost {
  id: string;
  type: "event_registration" | "habit_log" | "achievement" | "milestone";
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  eventName?: string;
  pointsEarned?: number;
}

export default function Community() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPointTransferModal, setShowPointTransferModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(
    null,
  );
  const [transferAmount, setTransferAmount] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);

  const userPoints = 1250;

  // Mock community data - would come from API
  const community = {
    id: id || "2",
    name: "Ocean Guardians",
    description:
      "Protecting our marine ecosystems through cleanup drives, education, and sustainable living practices.",
    ngoName: "Ocean Cleanup Initiative",
    memberCount: 142,
    totalPoints: 42340,
    location: "Los Angeles, CA",
    category: "Marine Conservation",
    isJoined: true,
  };

  const members: CommunityMember[] = [
    { id: "1", name: "Emma Rodriguez", points: 2850, joinedDate: "2023-06-15" },
    {
      id: "2",
      name: "Alex Johnson",
      points: 1250,
      joinedDate: "2023-08-22",
      isCurrentUser: true,
    },
    { id: "3", name: "Michael Chen", points: 1820, joinedDate: "2023-07-10" },
    { id: "4", name: "Sarah Wilson", points: 1650, joinedDate: "2023-09-05" },
    { id: "5", name: "David Kim", points: 1420, joinedDate: "2023-08-30" },
    { id: "6", name: "Lisa Thompson", points: 1180, joinedDate: "2023-09-12" },
    { id: "7", name: "Carlos Mendez", points: 980, joinedDate: "2023-09-18" },
    { id: "8", name: "Anna Petrov", points: 845, joinedDate: "2023-10-02" },
  ];

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: "1",
      type: "event_registration",
      userName: "Emma Rodriguez",
      content: "just registered for the 'Ocean Cleanup Drive' event!",
      timestamp: "2024-01-21T10:30:00Z",
      likes: 8,
      isLiked: false,
      eventName: "Ocean Cleanup Drive",
    },
    {
      id: "2",
      type: "achievement",
      userName: "Michael Chen",
      content: "completed their 30-day plastic-free challenge! 🌊",
      timestamp: "2024-01-21T09:15:00Z",
      likes: 12,
      isLiked: true,
      pointsEarned: 150,
    },
    {
      id: "3",
      type: "habit_log",
      userName: "Sarah Wilson",
      content: "logged 5 eco-habits today and earned 45 points!",
      timestamp: "2024-01-21T08:45:00Z",
      likes: 5,
      isLiked: false,
      pointsEarned: 45,
    },
    {
      id: "4",
      type: "milestone",
      userName: "David Kim",
      content: "reached a 20-day streak! Keep the momentum going! 🔥",
      timestamp: "2024-01-20T16:20:00Z",
      likes: 15,
      isLiked: true,
    },
    {
      id: "5",
      type: "event_registration",
      userName: "Lisa Thompson",
      content: "just registered for the 'Sustainable Living Workshop' event!",
      timestamp: "2024-01-20T14:10:00Z",
      likes: 3,
      isLiked: false,
      eventName: "Sustainable Living Workshop",
    },
  ]);

  const sortedMembers = [...members].sort((a, b) => b.points - a.points);

  const handleLike = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post,
      ),
    );
  };

  const handleSendPoints = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowPointTransferModal(true);
  };

  const confirmPointTransfer = () => {
    const amount = parseInt(transferAmount);
    if (amount > 0 && amount <= userPoints && selectedMember) {
      // In real app, make API call here
      setShowPointTransferModal(false);
      setTransferAmount("");
      setSelectedMember(null);

      // Add success feedback (could be a toast notification)
      alert(`Successfully sent ${amount} points to ${selectedMember.name}!`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - postTime.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPostIcon = (type: FeedPost["type"]) => {
    switch (type) {
      case "event_registration":
        return <Calendar className="w-4 h-4 text-eco-sky" />;
      case "achievement":
        return <Trophy className="w-4 h-4 text-eco-earth" />;
      case "habit_log":
        return <CheckCircle className="w-4 h-4 text-eco-forest" />;
      case "milestone":
        return <Star className="w-4 h-4 text-eco-sage" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout userRole="user" userName="Alex Johnson">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/user/communities")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 via-eco-sky/5 to-eco-leaf/10 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-eco-sky/20 text-eco-sky text-xl">
                  {getInitials(community.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {community.name}
                  </h1>
                  <Badge className="bg-eco-forest/10 text-eco-forest border-eco-forest/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Member
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">
                  {community.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {community.location}
                  </div>
                  <div>by {community.ngoName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Community Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-eco-sky" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-sky mb-1">
                    {community.memberCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-sage mb-1">
                    {community.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Community Points
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-earth mb-1">
                    #2
                  </div>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Members */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-eco-earth" />
                  Top Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedMembers.slice(0, 5).map((member, index) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        member.isCurrentUser
                          ? "bg-eco-forest/10 border border-eco-forest/30"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? "bg-yellow-500 text-white"
                                  : index === 1
                                    ? "bg-gray-400 text-white"
                                    : "bg-amber-600 text-white"
                              }`}
                            >
                              {index + 1}
                            </div>
                          )}
                          {index >= 3 && (
                            <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback
                            className={
                              member.isCurrentUser
                                ? "bg-eco-forest text-white text-xs"
                                : "text-xs"
                            }
                          >
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p
                            className={`text-sm font-medium ${member.isCurrentUser ? "text-eco-forest" : "text-foreground"}`}
                          >
                            {member.name}
                            {member.isCurrentUser && (
                              <span className="text-xs ml-1">(You)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-eco-sage" />
                          <span className="font-medium text-eco-sage">
                            {member.points}
                          </span>
                        </div>
                        {!member.isCurrentUser && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendPoints(member)}
                            className="h-8 px-2"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Community Feed */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-eco-sky" />
                  Community Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-border/50 rounded-lg p-4 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.userAvatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(post.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPostIcon(post.type)}
                            <span className="font-semibold text-foreground">
                              {post.userName}
                            </span>
                            <span className="text-muted-foreground">
                              {post.content}
                            </span>
                          </div>

                          {post.eventName && (
                            <div className="inline-flex items-center gap-1 bg-eco-sky/10 text-eco-sky px-2 py-1 rounded-full text-xs mb-2">
                              <Calendar className="w-3 h-3" />
                              {post.eventName}
                            </div>
                          )}

                          {post.pointsEarned && (
                            <div className="inline-flex items-center gap-1 bg-eco-sage/10 text-eco-sage px-2 py-1 rounded-full text-xs mb-2">
                              <Sparkles className="w-3 h-3" />+
                              {post.pointsEarned} points
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(post.timestamp)}
                            </span>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 text-sm transition-colors ${
                                  post.isLiked
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-muted-foreground hover:text-red-500"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
                                />
                                {post.likes}
                              </button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const member = members.find(
                                    (m) => m.name === post.userName,
                                  );
                                  if (member && !member.isCurrentUser) {
                                    handleSendPoints(member);
                                  }
                                }}
                                className="h-8 px-2 text-xs"
                                disabled={post.userName === "Alex Johnson"}
                              >
                                <Gift className="w-3 h-3 mr-1" />
                                Send Points
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Point Transfer Modal */}
        <Dialog
          open={showPointTransferModal}
          onOpenChange={setShowPointTransferModal}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-eco-sage" />
                Send Points
              </DialogTitle>
              <DialogDescription>
                Transfer points to {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.points} points
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to send</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter points amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    max={userPoints}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    You have {userPoints} points available
                  </p>
                </div>

                {transferAmount && parseInt(transferAmount) > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>You have:</span>
                      <span className="font-semibold">{userPoints} points</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sending:</span>
                      <span className="font-semibold">
                        {transferAmount} points
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1">
                      <span>After transfer:</span>
                      <span className="font-semibold text-eco-sage">
                        {userPoints - parseInt(transferAmount)} points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPointTransferModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPointTransfer}
                disabled={
                  !transferAmount ||
                  parseInt(transferAmount) <= 0 ||
                  parseInt(transferAmount) > userPoints
                }
                className="bg-gradient-to-r from-eco-sage to-eco-sky hover:from-eco-sage/90 hover:to-eco-sky/90"
              >
                Confirm Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
