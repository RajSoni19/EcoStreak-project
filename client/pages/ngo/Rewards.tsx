import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Gift,
  Star,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  image?: string;
  isActive: boolean;
  maxRedemptions: number;
  currentRedemptions: number;
  createdAt: string;
  updatedAt: string;
}

interface RewardFormData {
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  image?: string;
  maxRedemptions: number;
}

const REWARD_CATEGORIES = [
  'eco-products',
  'sustainable-fashion',
  'organic-food',
  'renewable-energy',
  'zero-waste',
  'fair-trade',
  'other'
];

export default function NGORewards() {
  const { toast } = useToast();
  
  // State for real data
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [showAddReward, setShowAddReward] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RewardFormData>({
    name: "",
    description: "",
    pointsCost: 0,
    category: "eco-products",
    image: "",
    maxRedemptions: -1,
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch rewards from backend
  const fetchRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getNGORewards();
      if (response.success) {
        setRewards(response.data.rewards || []);
      } else {
        setError('Failed to fetch rewards');
      }
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
      setError(error.message || 'Failed to load rewards');
      
      if (error.message === 'Invalid token' || error.message.includes('401')) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Refresh rewards
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRewards();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Rewards refreshed",
    });
  };

  // Load rewards on component mount
  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // Filter rewards
  const filteredRewards = rewards.filter(
    (reward) =>
      (selectedCategory === "All" || reward.category === selectedCategory) &&
      reward.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from real data
  const stats = {
    totalRewards: rewards.length,
    activeRewards: rewards.filter((r) => r.isActive).length,
    totalRedemptions: rewards.reduce((sum, r) => sum + r.currentRedemptions, 0),
    averagePointsCost: rewards.length > 0 
      ? Math.round(rewards.reduce((sum, r) => sum + r.pointsCost, 0) / rewards.length)
      : 0,
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      pointsCost: 0,
      category: "eco-products",
      image: "",
      maxRedemptions: -1,
    });
  };

  // Open add reward dialog
  const openAddReward = () => {
    resetForm();
    setShowAddReward(true);
  };

  // Open edit reward dialog
  const openEditReward = (reward: Reward) => {
    setFormData({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      image: reward.image || "",
      maxRedemptions: reward.maxRedemptions,
    });
    setEditingReward(reward);
    setShowAddReward(true);
  };

  // Close dialog
  const closeDialog = () => {
    setShowAddReward(false);
    setEditingReward(null);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (formData.name.length < 3) {
      toast({
        title: "Validation Error",
        description: "Reward name must be at least 3 characters long",
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
    
    if (formData.pointsCost <= 0) {
      toast({
        title: "Validation Error",
        description: "Points cost must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingReward) {
        // Update existing reward
        const response = await apiService.updateNGOReward(editingReward._id, formData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Reward updated successfully",
          });
          closeDialog();
          fetchRewards(); // Refresh the list
        }
      } else {
        // Create new reward
        const response = await apiService.createNGOReward(formData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Reward created successfully",
          });
          closeDialog();
          fetchRewards(); // Refresh the list
        }
      }
    } catch (error: any) {
      console.error('Error saving reward:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save reward",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete reward
  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) {
      return;
    }
    
    try {
      const response = await apiService.deleteNGOReward(rewardId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Reward deleted successfully",
        });
        fetchRewards(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error deleting reward:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete reward",
        variant: "destructive",
      });
    }
  };

  // Toggle reward status
  const toggleRewardStatus = async (reward: Reward) => {
    try {
      const response = await apiService.updateNGOReward(reward._id, {
        isActive: !reward.isActive
      });
      if (response.success) {
        toast({
          title: "Success",
          description: `Reward ${reward.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchRewards(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating reward status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update reward status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading rewards...</span>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Rewards Management</h1>
            <p className="text-muted-foreground">Create and manage point-based rewards for your community</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openAddReward}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRewards}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRewards}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Points Cost</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePointsCost}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search rewards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="All">All Categories</option>
                  {REWARD_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards List */}
        {filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "All" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first reward"
                  }
                </p>
                {!searchTerm && selectedCategory === "All" && (
                  <Button onClick={openAddReward}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Reward
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <Card key={reward._id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{reward.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={reward.isActive ? "default" : "secondary"}>
                          {reward.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {reward.category.charAt(0).toUpperCase() + reward.category.slice(1).replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{reward.pointsCost} pts</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {reward.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Redemptions:</span>
                      <span className="font-medium">
                        {reward.currentRedemptions} / {reward.maxRedemptions === -1 ? '∞' : reward.maxRedemptions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditReward(reward)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRewardStatus(reward)}
                    >
                      {reward.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReward(reward._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Reward Dialog */}
        <Dialog open={showAddReward} onOpenChange={setShowAddReward}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </DialogTitle>
              <DialogDescription>
                {editingReward 
                  ? 'Update your reward information below.'
                  : 'Fill in the details to add a new reward to your community.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Reward Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Eco Water Bottle"
                  required
                  minLength={3}
                />
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
                  {REWARD_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your reward..."
                  rows={3}
                  required
                  minLength={10}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <Label htmlFor="pointsCost">Points Cost *</Label>
                <Input
                  id="pointsCost"
                  type="number"
                  min="1"
                  value={formData.pointsCost}
                  onChange={(e) => setFormData({...formData, pointsCost: parseInt(e.target.value) || 0})}
                  placeholder="100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                <Input
                  id="maxRedemptions"
                  type="number"
                  min="-1"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({...formData, maxRedemptions: parseInt(e.target.value) || -1})}
                  placeholder="-1 for unlimited"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use -1 for unlimited redemptions
                </p>
              </div>
              
              <div>
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingReward ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingReward ? 'Update Reward' : 'Create Reward'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
