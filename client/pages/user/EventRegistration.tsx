import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Clock, Star, CheckCircle, XCircle } from 'lucide-react';

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
    isVirtual: boolean;
    virtualLink?: string;
  };
  category: string;
  organizer: {
    _id: string;
    fullName: string;
    organizationName?: string;
    avatar: string;
  };
  maxParticipants?: number;
  participants: string[];
  pointsForAttendance: number;
  pointsForCompletion: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
}

const EventRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchUserEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents({
        status: 'upcoming',
        limit: 50,
      });
      if (response.success && response.data.events) {
        setEvents(response.data.events);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      toast({
        title: "Warning",
        description: "Events may not be available. Please try again later.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const response = await apiService.getUserEvents();
      if (response.success && response.data.events) {
        setUserEvents(response.data.events);
      } else {
        setUserEvents([]);
      }
    } catch (error: any) {
      console.log("User events not available (user may not be logged in)");
      setUserEvents([]);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await apiService.joinEvent(eventId);
      
      toast({
        title: "Success!",
        description: response.message,
      });
      
      // Update local state
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, participants: [...event.participants, 'current-user'] }
          : event
      ));
      
      // Refresh user events
      fetchUserEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join event",
        variant: "destructive",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await apiService.leaveEvent(eventId);
      
      toast({
        title: "Success",
        description: "Successfully left the event",
      });
      
      // Update local state
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, participants: event.participants.filter(id => id !== 'current-user') }
          : event
      ));
      
      // Refresh user events
      fetchUserEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave event",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    if (filters.category && filters.category !== 'all' && event.category !== filters.category) return false;
    if (filters.status && filters.status !== 'all' && event.status !== filters.status) return false;
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-800',
      cleanup: 'bg-green-100 text-green-800',
      'tree-planting': 'bg-emerald-100 text-emerald-800',
      awareness: 'bg-purple-100 text-purple-800',
      fundraiser: 'bg-yellow-100 text-yellow-800',
      meeting: 'bg-gray-100 text-gray-800',
      volunteer: 'bg-orange-100 text-orange-800',
      other: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.upcoming;
  };

  const isUserRegistered = (event: Event) => {
    return event.participants.includes('current-user');
  };

  const isEventFull = (event: Event) => {
    return event.maxParticipants && event.participants.length >= event.maxParticipants;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Registration
        </h1>
        <p className="text-gray-600">
          Discover and join environmental events to earn points and make a difference
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <Input
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="cleanup">Cleanup</SelectItem>
                  <SelectItem value="tree-planting">Tree Planting</SelectItem>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ category: 'all', status: 'all', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Events ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="my-events">My Events ({userEvents.length})</TabsTrigger>
        </TabsList>

        {/* Browse Events Tab */}
        <TabsContent value="browse" className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new events.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category.replace('-', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg leading-tight">
                      {event.title}
                    </CardTitle>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>
                          {event.organizer.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {event.organizer.organizationName || event.organizer.fullName}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(event.startDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {event.location.isVirtual ? 'Virtual Event' : `${event.location.city}, ${event.location.state}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.participants.length}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                        </span>
                      </div>
                    </div>
                    
                    {/* Points Info */}
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700 font-medium">Points Available:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">
                            <Star className="w-4 h-4 inline mr-1" />
                            +{event.pointsForAttendance} for joining
                          </span>
                          <span className="text-green-600">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            +{event.pointsForCompletion} for completion
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex justify-between items-center">
                      {isUserRegistered(event) ? (
                        <Button
                          variant="outline"
                          onClick={() => handleLeaveEvent(event._id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Leave Event
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleJoinEvent(event._id)}
                          disabled={isEventFull(event)}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isEventFull(event) ? 'Event Full' : 'Join Event'}
                        </Button>
                      )}
                      
                      {isUserRegistered(event) && (
                        <Badge className="bg-green-100 text-green-800">
                          Registered
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Events Tab */}
        <TabsContent value="my-events" className="mt-6">
          {userEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events registered</h3>
                <p className="text-gray-600 mb-4">
                  You haven't registered for any events yet. Start exploring and join events to earn points!
                </p>
                <Button
                  onClick={() => setActiveTab('browse')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userEvents.map((event) => (
                <Card key={event._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-gray-600">
                          Organized by {event.organizer.organizationName || event.organizer.fullName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {event.location.isVirtual ? 'Virtual Event' : `${event.location.city}, ${event.location.state}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.participants.length} participants</span>
                      </div>
                    </div>
                    
                    {/* Progress and Points */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium">Event Progress</span>
                        <span className="text-blue-600 text-sm">
                          {event.status === 'completed' ? 'Completed' : 
                           event.status === 'ongoing' ? 'In Progress' : 'Upcoming'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600">
                          <Star className="w-4 h-4 inline mr-1" />
                          +{event.pointsForAttendance} points earned for joining
                        </span>
                        {event.status === 'completed' && (
                          <span className="text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            +{event.pointsForCompletion} points earned for completion
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action */}
                    {event.status === 'upcoming' && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleLeaveEvent(event._id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Leave Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventRegistration;
