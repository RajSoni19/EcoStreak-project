import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Award,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  category: string;
  tags: string[];
  maxParticipants?: number;
  participants: any[];
  pointsForAttendance: number;
  pointsForCompletion: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isPublic: boolean;
  community?: any;
  createdAt: string;
}

const EVENT_CATEGORIES = [
  'workshop',
  'cleanup',
  'tree-planting',
  'awareness',
  'fundraiser',
  'meeting',
  'volunteer',
  'other'
];

const EVENT_STATUSES = [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
];

export default function NGOEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNGOEvents();
      if (response.success) {
        setEvents(response.data.events);
        setFilteredEvents(response.data.events);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Refresh events
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Events refreshed",
    });
  };

  // Filter events
  useEffect(() => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, categoryFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchEvents();
    
    const interval = setInterval(() => {
      fetchEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await apiService.deleteNGOEvent(eventId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        fetchEvents();
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'cleanup': return 'bg-green-100 text-green-800';
      case 'tree-planting': return 'bg-emerald-100 text-emerald-800';
      case 'awareness': return 'bg-blue-100 text-blue-800';
      case 'fundraiser': return 'bg-yellow-100 text-yellow-800';
      case 'meeting': return 'bg-indigo-100 text-indigo-800';
      case 'volunteer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Events Management</h1>
            <p className="text-muted-foreground">Create and manage your environmental events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/ngo/events/create")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All statuses</option>
                  {EVENT_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setCategoryFilter("");
                  }}
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/ngo/events/${event._id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/ngo/events/${event._id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString()} at{' '}
                    {new Date(event.startDate).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location.city}, {event.location.state}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.participants.length} / {event.maxParticipants || '∞'} participants
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>+{event.pointsForCompletion} pts</span>
                </div>
                
                {event.maxParticipants && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-eco-forest h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round((event.participants.length / event.maxParticipants) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter || categoryFilter ? 'No events found' : 'No events yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter || categoryFilter 
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first event to start engaging your community'
                }
              </p>
              {!searchTerm && !statusFilter && !categoryFilter && (
                <Button onClick={() => navigate("/ngo/events/create")} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
