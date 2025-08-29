import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock,
  Users,
  Award,
  Eye
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  registeredParticipants: number;
  maxParticipants: number;
  pointsAwarded: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: string;
  pointsAwarded: string;
}

export default function NGOEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    pointsAwarded: ""
  });

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Community Tree Planting Day",
      description: "Join us for a day of environmental restoration as we plant native trees in Central Park.",
      date: "2024-02-15",
      time: "09:00",
      location: "Central Park",
      registeredParticipants: 32,
      maxParticipants: 50,
      pointsAwarded: 25,
      status: "upcoming"
    },
    {
      id: "2",
      name: "Ocean Cleanup Drive",
      description: "Help us clean our beautiful coastline and protect marine life.",
      date: "2024-02-18",
      time: "07:30",
      location: "Marina Beach",
      registeredParticipants: 18,
      maxParticipants: 30,
      pointsAwarded: 30,
      status: "upcoming"
    },
    {
      id: "3",
      name: "Sustainable Living Workshop",
      description: "Learn practical tips for reducing your environmental footprint.",
      date: "2024-01-20",
      time: "14:00",
      location: "Community Center",
      registeredParticipants: 45,
      maxParticipants: 60,
      pointsAwarded: 20,
      status: "completed"
    },
    {
      id: "4",
      name: "Green Energy Seminar",
      description: "Discover renewable energy solutions for your home and community.",
      date: "2024-02-25",
      time: "10:00",
      location: "University Auditorium",
      registeredParticipants: 15,
      maxParticipants: 40,
      pointsAwarded: 35,
      status: "upcoming"
    }
  ]);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    if (!formData.name || !formData.date || !formData.time || !formData.location) {
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      registeredParticipants: 0,
      maxParticipants: parseInt(formData.maxParticipants) || 50,
      pointsAwarded: parseInt(formData.pointsAwarded) || 20,
      status: "upcoming"
    };

    setEvents(prev => [...prev, newEvent]);
    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: "",
      pointsAwarded: ""
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getStatusBadge = (status: Event['status']) => {
    const statusConfig = {
      upcoming: { label: "Upcoming", className: "bg-eco-sky/10 text-eco-sky border-eco-sky/20" },
      ongoing: { label: "Ongoing", className: "bg-eco-earth/10 text-eco-earth border-eco-earth/20" },
      completed: { label: "Completed", className: "bg-eco-forest/10 text-eco-forest border-eco-forest/20" },
      cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const showEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  return (
    <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Green Earth Foundation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Events Management</h1>
            <p className="text-muted-foreground">
              Create and manage your environmental initiatives
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new environmental event.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Community Tree Planting"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your event and its environmental impact..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    placeholder="e.g., Central Park, Community Center"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Participant Limit</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({...prev, maxParticipants: e.target.value}))}
                      placeholder="50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pointsAwarded">Points Awarded</Label>
                    <Input
                      id="pointsAwarded"
                      type="number"
                      value={formData.pointsAwarded}
                      onChange={(e) => setFormData(prev => ({...prev, pointsAwarded: e.target.value}))}
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
                  Create Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Events ({filteredEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No events found" : "No events created yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first event to start engaging your community"}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Details</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{event.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p>{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">{event.time}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {event.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {event.registeredParticipants} / {event.maxParticipants}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-eco-sage" />
                            <span className="font-medium text-eco-sage">+{event.pointsAwarded}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(event.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => showEventDetails(event)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{event.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
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

        {/* Event Details Modal */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.name}</DialogTitle>
                  <DialogDescription>
                    Event details and participant information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Date & Time</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Location</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {selectedEvent.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Participants</h4>
                      <p className="text-2xl font-bold text-eco-earth">
                        {selectedEvent.registeredParticipants} / {selectedEvent.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Points</h4>
                      <p className="text-2xl font-bold text-eco-sage">+{selectedEvent.pointsAwarded}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      {getStatusBadge(selectedEvent.status)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
