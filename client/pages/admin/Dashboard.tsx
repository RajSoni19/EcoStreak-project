import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  _id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  description: string;
  createdAt: string;
  adminUser: {
    fullName: string;
    email: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

interface DashboardStats {
  totalOrganizations: number;
  pendingOrganizations: number;
  totalEvents: number;
}

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch organizations and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access the dashboard",
          variant: "destructive",
        });
        return;
      }

      // Fetch pending organizations
      const orgResponse = await fetch('/api/super-admin/organizations?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!orgResponse.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const orgData = await orgResponse.json();
      setOrganizations(orgData.data.organizations || []);

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/super-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalOrganizations: statsData.data.stats.totalOrganizations || 0,
          pendingOrganizations: statsData.data.stats.pendingOrganizations || 0,
          totalEvents: statsData.data.stats.totalEvents || 0,
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (organizationId: string) => {
    try {
      setApproving(organizationId);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalNotes: 'Organization approved by Super Admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve organization');
      }

      toast({
        title: "Success",
        description: "Organization approved successfully",
      });

      // Refresh data
      fetchData();

    } catch (error) {
      console.error('Error approving organization:', error);
      toast({
        title: "Error",
        description: "Failed to approve organization",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (organizationId: string) => {
    try {
      setRejecting(organizationId);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: 'Organization rejected by Super Admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject organization');
      }

      toast({
        title: "Success",
        description: "Organization rejected successfully",
      });

      // Refresh data
      fetchData();

    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast({
        title: "Error",
        description: "Failed to reject organization",
        variant: "destructive",
      });
    } finally {
      setRejecting(null);
    }
  };

  const dashboardStats = [
    {
      title: "Active Organizations",
      value: stats.totalOrganizations.toString(),
      icon: Building2,
      color: "text-eco-forest",
      bgColor: "bg-eco-leaf/10",
    },
    {
      title: "Pending Registrations",
      value: stats.pendingOrganizations.toString(),
      icon: Clock,
      color: "text-eco-sky",
      bgColor: "bg-eco-sky/10",
    },
    {
      title: "Total Events Hosted",
      value: stats.totalEvents.toString(),
      icon: Calendar,
      color: "text-eco-earth",
      bgColor: "bg-eco-earth/10",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin User">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-eco-forest" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage NGO registrations and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* NGO Registration Requests */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              NGO Registration Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  All caught up!
                </h3>
                <p className="text-muted-foreground">
                  No pending registration requests at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization Name</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Admin User</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((organization) => (
                      <TableRow key={organization._id}>
                        <TableCell className="font-medium">
                          {organization.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {organization.email}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{organization.adminUser?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{organization.adminUser?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {new Date(organization.createdAt).toLocaleDateString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {organization.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-eco-forest hover:bg-eco-forest/90 text-white"
                                  disabled={approving === organization._id}
                                >
                                  {approving === organization._id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Approve Registration
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve{" "}
                                    <strong>{organization.name}</strong>? This will grant them access to create
                                    events and manage their community.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApprove(organization._id)}
                                    className="bg-eco-forest hover:bg-eco-forest/90"
                                  >
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  disabled={rejecting === organization._id}
                                >
                                  {rejecting === organization._id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                  )}
                                  Decline
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Decline Registration
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to decline{" "}
                                    <strong>{organization.name}</strong>? This action cannot be undone and they will
                                    need to reapply.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleReject(organization._id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Decline
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => (window.location.href = "/admin/ngos")}
              >
                <Building2 className="w-8 h-8 text-eco-forest" />
                <div className="text-center">
                  <p className="font-medium">Manage NGOs</p>
                  <p className="text-xs text-muted-foreground">
                    View and manage all organizations
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => (window.location.href = "/admin/reports")}
              >
                <Calendar className="w-8 h-8 text-eco-sky" />
                <div className="text-center">
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Platform analytics and insights
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => (window.location.href = "/admin/settings")}
              >
                <Users className="w-8 h-8 text-eco-earth" />
                <div className="text-center">
                  <p className="font-medium">System Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Configure platform settings
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
