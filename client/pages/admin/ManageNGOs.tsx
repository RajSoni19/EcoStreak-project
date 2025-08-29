import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  Eye,
  Ban,
  CheckCircle,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";

interface NGO {
  id: string;
  organizationName: string;
  contactEmail: string;
  totalEvents: number;
  totalMembers: number;
  status: "active" | "suspended";
  joinedDate: string;
  lastActivity: string;
}

export default function ManageNGOs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ngos, setNgos] = useState<NGO[]>([
    {
      id: "1",
      organizationName: "Green Earth Foundation",
      contactEmail: "contact@greenearth.org",
      totalEvents: 25,
      totalMembers: 150,
      status: "active",
      joinedDate: "2023-06-15",
      lastActivity: "2024-01-20",
    },
    {
      id: "2",
      organizationName: "Ocean Cleanup Initiative",
      contactEmail: "admin@oceancleanup.org",
      totalEvents: 18,
      totalMembers: 89,
      status: "active",
      joinedDate: "2023-08-22",
      lastActivity: "2024-01-19",
    },
    {
      id: "3",
      organizationName: "Solar Communities Network",
      contactEmail: "info@solarcommunities.net",
      totalEvents: 32,
      totalMembers: 245,
      status: "active",
      joinedDate: "2023-04-10",
      lastActivity: "2024-01-18",
    },
    {
      id: "4",
      organizationName: "Urban Forest Project",
      contactEmail: "team@urbanforest.org",
      totalEvents: 12,
      totalMembers: 67,
      status: "suspended",
      joinedDate: "2023-09-05",
      lastActivity: "2023-12-15",
    },
    {
      id: "5",
      organizationName: "Climate Action Coalition",
      contactEmail: "hello@climateaction.org",
      totalEvents: 41,
      totalMembers: 320,
      status: "active",
      joinedDate: "2023-03-18",
      lastActivity: "2024-01-21",
    },
  ]);

  const filteredNgos = ngos.filter(
    (ngo) =>
      ngo.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSuspend = (id: string) => {
    setNgos((prev) =>
      prev.map((ngo) =>
        ngo.id === id ? { ...ngo, status: "suspended" as const } : ngo,
      ),
    );
  };

  const handleActivate = (id: string) => {
    setNgos((prev) =>
      prev.map((ngo) =>
        ngo.id === id ? { ...ngo, status: "active" as const } : ngo,
      ),
    );
  };

  const totalActiveNGOs = ngos.filter((ngo) => ngo.status === "active").length;
  const totalEvents = ngos.reduce((sum, ngo) => sum + ngo.totalEvents, 0);
  const totalMembers = ngos.reduce((sum, ngo) => sum + ngo.totalMembers, 0);

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Manage NGOs
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all registered organizations on the platform
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active NGOs</p>
                  <p className="text-2xl font-bold text-eco-forest">
                    {totalActiveNGOs}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-eco-forest/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-eco-sky">
                    {totalEvents}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-eco-sky/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-eco-earth">
                    {totalMembers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-eco-earth/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Events/NGO
                  </p>
                  <p className="text-2xl font-bold text-eco-sage">
                    {Math.round(totalEvents / ngos.length)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-eco-sage/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NGO Management Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                All Organizations
              </CardTitle>
              <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNgos.map((ngo) => (
                    <TableRow key={ngo.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {ngo.organizationName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Joined{" "}
                            {new Date(ngo.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ngo.contactEmail}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-eco-sky" />
                          <span className="font-medium">{ngo.totalEvents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-eco-earth" />
                          <span className="font-medium">
                            {ngo.totalMembers}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ngo.status === "active" ? "default" : "secondary"
                          }
                          className={
                            ngo.status === "active"
                              ? "bg-eco-forest/10 text-eco-forest border-eco-forest/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {ngo.status === "active" ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3 mr-1" />
                              Suspended
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ngo.lastActivity).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>

                          {ngo.status === "active" ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Suspend
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Suspend Organization
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to suspend{" "}
                                    <strong>{ngo.organizationName}</strong>?
                                    This will prevent them from creating new
                                    events and managing their community until
                                    reactivated.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleSuspend(ngo.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Suspend
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-eco-forest hover:bg-eco-forest/90 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Activate
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Activate Organization
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reactivate{" "}
                                    <strong>{ngo.organizationName}</strong>?
                                    This will restore their access to create
                                    events and manage their community.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleActivate(ngo.id)}
                                    className="bg-eco-forest hover:bg-eco-forest/90"
                                  >
                                    Activate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredNgos.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No organizations found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No organizations have been registered yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
