import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Calendar, MapPin, Users, Award } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

interface EventFormData {
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
  tags: string[];
  maxParticipants?: number;
  pointsForAttendance: number;
  pointsForCompletion: number;
  isPublic: boolean;
  community?: string;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      isVirtual: false,
      virtualLink: "",
    },
    category: "workshop",
    tags: [],
    maxParticipants: undefined,
    pointsForAttendance: 10,
    pointsForCompletion: 50,
    isPublic: true,
    community: undefined,
  });
  
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (formData.title.length < 3) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.location.address || !formData.location.city || !formData.location.state || !formData.location.country) {
      toast({
        title: "Validation Error",
        description: "All location fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.location.isVirtual && !formData.location.virtualLink) {
      toast({
        title: "Validation Error",
        description: "Virtual meeting link is required for virtual events",
        variant: "destructive",
      });
      return;
    }
    
    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Start and end dates are required",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast({
        title: "Validation Error",
        description: "Invalid date format",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    // Create a copy of formData with proper date format and ensure all required fields
    const submissionData = {
      ...formData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      // Ensure required fields are present
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: {
        address: formData.location.address.trim(),
        city: formData.location.city.trim(),
        state: formData.location.state.trim(),
        country: formData.location.country.trim(),
        isVirtual: formData.location.isVirtual,
        virtualLink: formData.location.virtualLink || ""
      },
      category: formData.category,
      tags: formData.tags,
      maxParticipants: formData.maxParticipants || undefined,
      pointsForAttendance: formData.pointsForAttendance || 0,
      pointsForCompletion: formData.pointsForCompletion || 0,
      isPublic: formData.isPublic !== undefined ? formData.isPublic : true
    };
    
    console.log('Data being submitted:', JSON.stringify(submissionData, null, 2));
    
    setIsSubmitting(true);

    try {
      const response = await apiService.createNGOEvent(submissionData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        navigate("/ngo/events");
      }
         } catch (error: any) {
       console.error('Error creating event:', error);
       
       // Log the form data being sent
       console.log('Form data being sent:', JSON.stringify(formData, null, 2));
       
       // Show more detailed error message
       let errorMessage = error.message || "Failed to create event";
       
       // Try to extract validation errors from different possible locations
       if (error.errors && Array.isArray(error.errors)) {
         errorMessage = error.errors.join(', ');
       } else if (error.response && error.response.errors) {
         errorMessage = error.response.errors.join(', ');
       } else if (error.data && error.data.errors) {
         errorMessage = error.data.errors.join(', ');
       } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
         errorMessage = error.response.data.errors.join(', ');
       } else if (error.response?.data?.message) {
         errorMessage = error.response.data.message;
       }
       
       // Log the full error response for debugging
       console.log('Full error response:', error);
       console.log('Error errors array:', error.errors);
       console.log('Error response:', error.response);
       console.log('Error data:', error.data);
       console.log('Error response data:', error.response?.data);
       
       toast({
         title: "Error",
         description: errorMessage,
         variant: "destructive",
       });
     } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/ngo/events")}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Event</h1>
            <p className="text-muted-foreground">Fill in the details to create a new environmental event</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Urban Garden Workshop"
                      required
                      minLength={3}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.title.length}/200 characters (minimum 3 required)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      {EVENT_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide a detailed description of your event (minimum 10 characters)..."
                    rows={4}
                    required
                    minLength={10}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description.length}/2000 characters (minimum 10 required)
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date and Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                      placeholder="New York"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.location.state}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                      placeholder="NY"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, country: e.target.value}})}
                      placeholder="USA"
                      required
                    />
                  </div>
                                 </div>
                 
                 {/* Virtual Event Settings */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold flex items-center gap-2">
                     <Award className="w-5 h-5" />
                     Virtual Event Settings
                   </h3>
                   
                   <div className="space-y-4">
                     <div className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         id="isVirtual"
                         checked={formData.location.isVirtual}
                         onChange={(e) => setFormData({
                           ...formData, 
                           location: {
                             ...formData.location, 
                             isVirtual: e.target.checked,
                             virtualLink: e.target.checked ? formData.location.virtualLink : ""
                           }
                         })}
                         className="rounded"
                       />
                       <Label htmlFor="isVirtual">This is a virtual event</Label>
                     </div>
                     
                     {formData.location.isVirtual && (
                       <div>
                         <Label htmlFor="virtualLink">Virtual Meeting Link *</Label>
                         <Input
                           id="virtualLink"
                           type="url"
                           value={formData.location.virtualLink}
                           onChange={(e) => setFormData({
                             ...formData, 
                             location: {
                               ...formData.location, 
                               virtualLink: e.target.value
                             }
                           })}
                           placeholder="https://meet.google.com/..."
                           required={formData.location.isVirtual}
                         />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
 
               {/* Participation and Points */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participation & Points
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={formData.maxParticipants || ''}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined})}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pointsForAttendance">Points for Attendance</Label>
                    <Input
                      id="pointsForAttendance"
                      type="number"
                      min="0"
                      value={formData.pointsForAttendance}
                      onChange={(e) => setFormData({...formData, pointsForAttendance: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pointsForCompletion">Points for Completion</Label>
                    <Input
                      id="pointsForCompletion"
                      type="number"
                      min="0"
                      value={formData.pointsForCompletion}
                      onChange={(e) => setFormData({...formData, pointsForCompletion: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="isPublic">Public Event</Label>
                  <select
                    id="isPublic"
                    value={formData.isPublic.toString()}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.value === 'true'})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="true">Yes - Anyone can join</option>
                    <option value="false">No - Invitation only</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/ngo/events")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
