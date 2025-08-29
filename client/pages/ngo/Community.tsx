import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus,
  Search,
  Filter,
  Trophy,
  Star,
  Calendar,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Award,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface CommunityMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  points: number;
  streak: number;
  lastActive: string;
  status: "active" | "inactive" | "suspended";
  totalEvents: number;
  totalHabits: number;
}

interface CommunityActivity {
  id: string;
  type: "event" | "challenge" | "achievement";
  title: string;
  description: string;
  participants: number;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
}

export default function NGOCommunity() {
  const [members, setMembers] = useState<CommunityMember[]>([
    {
      id: "1",
      name: "Emma Rodriguez",
      email: "emma@example.com",
      joinDate: "2023-06-15",
      points: 2850,
      streak: 45,
      lastActive: "2024-01-21",
      status: "active",
      totalEvents: 8,
      totalHabits: 156,
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael@example.com",
      joinDate: "2023-07-10",
      points: 1820,
      streak: 23,
      lastActive: "2024-01-20",
      status: "active",
      totalEvents: 5,
      totalHabits: 98,
    },
    {
      id: "3",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      joinDate: "2023-09-05",
      points: 1650,
      streak: 12,
      lastActive: "2024-01-19",
      status: "active",
      totalEvents: 3,
      totalHabits: 67,
    },
    {
      id: "4",
      name: "David Kim",
      email: "david@example.com",
      joinDate: "2023-08-30",
      points: 1420,
      streak: 8,
      lastActive: "2024-01-18",
      status: "inactive",
      totalEvents: 2,
      totalHabits: 45,
    },
  ]);

  const [activities, setActivities] = useState<CommunityActivity[]>([
    {
      id: "1",
      type: "challenge",
      title: "30-Day Plastic-Free Challenge",
      description: "Eliminate single-use plastics for 30 days",
      participants: 45,
      startDate: "2024-01-01",
      endDate: "2024-01-30",
      status: "ongoing",
    },
    {
      id: "2",
      type: "event",
      title: "Community Garden Planting",
      description: "Plant native species in our community garden",
      participants: 28,
      startDate: "2024-02-15",
      endDate: "2024-02-15",
      status: "upcoming",
    },
    {
      id: "3",
      type: "achievement",
      title: "Eco Warrior Badge",
      description: "Complete 100 eco-friendly habits",
      participants: 12,
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      status: "completed",
    },
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const statuses = ["All", "active", "inactive", "suspended"];

  const filteredMembers = members.filter(
    (member) =>
      (selectedStatus === "All" || member.status === selectedStatus) &&
      (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    totalPoints: members.reduce((sum, m) => sum + m.points, 0),
    averageStreak: Math.round(
      members.reduce((sum, m) => sum + m.streak, 0) / members.length
    ),
  };

  const handleAddMember = () => {
    // Add member logic here
    setShowAddMember(false);
  };

  const handleAddActivity = () => {
    // Add activity logic here
    setShowAddActivity(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-eco-forest text-white";
      case "inactive":
        return "bg-eco-earth text-white";
      case "suspended":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "challenge":
        return <Trophy className="w-4 h-4" />;
      case "achievement":
        return <Award className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-eco-sky text-white";
      case "ongoing":
        return "bg-eco-forest text-white";
      case "completed":
        return "bg-eco-sage text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout
      userRole="ngo"
      userName="NGO Admin"
      organizationName="Green Earth Foundation"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Community Management
            </h1>
            <p className="text-muted-foreground">
              Manage your community members and activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddMember(true)} variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Member
            </Button>
            <Button onClick={() => setShowAddActivity(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Activity
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-forest/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-eco-forest" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-eco-forest">
                    {stats.totalMembers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-sky/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-eco-sky" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-eco-sky">
                    {stats.activeMembers}
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
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-eco-sage">
                    {stats.totalPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-earth/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-eco-earth" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Streak</p>
                  <p className="text-2xl font-bold text-eco-earth">
                    {stats.averageStreak} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Activities */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-eco-sky" />
              Community Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <Badge
                        variant="outline"
                        className={getActivityStatusColor(activity.status)}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {activity.participants} participants
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(activity.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Members Management */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-eco-forest" />
                Community Members
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-eco-sage" />
                          <span className="font-medium">{member.points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{member.streak} days</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {member.totalEvents} events
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {new Date(member.lastActive).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Award className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Invite a new member to your community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter email address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Activity</DialogTitle>
            <DialogDescription>
              Create a new community activity or challenge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Activity Title</Label>
              <Input id="title" placeholder="Enter activity title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Enter activity description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <select className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                <option value="event">Event</option>
                <option value="challenge">Challenge</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddActivity(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>Create Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
