import { useState } from "react";
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
import { Building2, Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface PendingRegistration {
  id: string;
  organizationName: string;
  contactEmail: string;
  dateSubmitted: string;
  description: string;
}

export default function AdminDashboard() {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([
    {
      id: "1",
      organizationName: "Green Earth Foundation",
      contactEmail: "contact@greenearth.org",
      dateSubmitted: "2024-01-15",
      description: "Environmental conservation and restoration projects"
    },
    {
      id: "2", 
      organizationName: "Ocean Cleanup Initiative",
      contactEmail: "admin@oceancleanup.org",
      dateSubmitted: "2024-01-18",
      description: "Marine ecosystem protection and plastic cleanup"
    },
    {
      id: "3",
      organizationName: "Solar Communities Network",
      contactEmail: "info@solarcommunities.net",
      dateSubmitted: "2024-01-20",
      description: "Renewable energy adoption in rural communities"
    }
  ]);

  const handleApprove = (id: string) => {
    setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
    // In real app, make API call to approve
  };

  const handleDecline = (id: string) => {
    setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
    // In real app, make API call to decline
  };

  const stats = [
    {
      title: "Active Organizations",
      value: "15",
      icon: Building2,
      color: "text-eco-forest",
      bgColor: "bg-eco-leaf/10"
    },
    {
      title: "Pending Registrations", 
      value: pendingRegistrations.length.toString(),
      icon: Clock,
      color: "text-eco-sky",
      bgColor: "bg-eco-sky/10"
    },
    {
      title: "Total Events Hosted",
      value: "128",
      icon: Calendar,
      color: "text-eco-earth",
      bgColor: "bg-eco-earth/10"
    }
  ];

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage NGO registrations and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
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
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
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
            {pendingRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending registration requests at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization Name</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          {registration.organizationName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {registration.contactEmail}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {new Date(registration.dateSubmitted).toLocaleDateString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {registration.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="bg-eco-forest hover:bg-eco-forest/90 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Registration</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve <strong>{registration.organizationName}</strong>? 
                                    This will grant them access to create events and manage their community.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApprove(registration.id)}
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
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Decline Registration</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to decline <strong>{registration.organizationName}</strong>? 
                                    This action cannot be undone and they will need to reapply.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDecline(registration.id)}
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
                onClick={() => window.location.href = "/admin/ngos"}
              >
                <Building2 className="w-8 h-8 text-eco-forest" />
                <div className="text-center">
                  <p className="font-medium">Manage NGOs</p>
                  <p className="text-xs text-muted-foreground">View and manage all organizations</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => window.location.href = "/admin/reports"}
              >
                <Calendar className="w-8 h-8 text-eco-sky" />
                <div className="text-center">
                  <p className="font-medium">View Reports</p>
                  <p className="text-xs text-muted-foreground">Platform analytics and insights</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => window.location.href = "/admin/settings"}
              >
                <Users className="w-8 h-8 text-eco-earth" />
                <div className="text-center">
                  <p className="font-medium">System Settings</p>
                  <p className="text-xs text-muted-foreground">Configure platform settings</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
