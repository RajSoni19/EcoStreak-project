import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Plus, Edit, Trash2, Star } from 'lucide-react';

interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  author: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  community: {
    _id: string;
    name: string;
  };
  likes: string[];
  appreciations: Array<{
    user: {
      _id: string;
      fullName: string;
      avatar: string;
    };
    points: number;
    message?: string;
    createdAt: string;
  }>;
  totalAppreciationPoints: number;
  createdAt: string;
}

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
}

const CommunityPosts: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAppreciationForm, setShowAppreciationForm] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
  });
  
  const [appreciationData, setAppreciationData] = useState({
    points: 10,
    message: '',
  });

  useEffect(() => {
    if (communityId) {
      fetchCommunityPosts();
      fetchCommunityDetails();
    }
  }, [communityId]);

  const fetchCommunityPosts = async () => {
    try {
      const response = await apiService.getCommunityPosts(communityId!);
      setPosts(response.data.posts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunityDetails = async () => {
    try {
      // This would need to be implemented in the API service
      // For now, we'll use mock data
      setCommunity({
        _id: communityId!,
        name: "Eco Warriors",
        description: "A community dedicated to environmental conservation",
        memberCount: 150,
      });
    } catch (error) {
      console.error("Failed to fetch community details:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.createCommunityPost({
        communityId: communityId!,
        ...formData,
      });
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      setFormData({ title: '', content: '', category: 'general' });
      setShowCreateForm(false);
      fetchCommunityPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const response = await apiService.togglePostLike(postId);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: response.data.isLiked ? [...post.likes, 'current-user'] : post.likes.filter(id => id !== 'current-user') }
          : post
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle like",
        variant: "destructive",
      });
    }
  };

  const handleAppreciatePost = async (postId: string) => {
    try {
      await apiService.appreciatePost(
        postId, 
        appreciationData.points, 
        appreciationData.message
      );
      
      toast({
        title: "Success",
        description: `Post appreciated with ${appreciationData.points} points!`,
      });
      
      setAppreciationData({ points: 10, message: '' });
      setShowAppreciationForm(null);
      fetchCommunityPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to appreciate post",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await apiService.deletePost(postId);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      fetchCommunityPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      achievement: 'bg-green-100 text-green-800',
      idea: 'bg-blue-100 text-blue-800',
      question: 'bg-yellow-100 text-yellow-800',
      event: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {community?.name || 'Community'} Posts
            </h1>
            <p className="text-gray-600 mt-2">
              {community?.description} • {community?.memberCount} members
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  maxLength={200}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your thoughts, achievements, or questions..."
                  rows={4}
                  maxLength={2000}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Create Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to share something with your community!
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.author.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    {post.author._id === 'current-user' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {/* Handle edit */}}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {post.title}
                </h4>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLike(post._id)}
                      className={`flex items-center space-x-2 ${
                        post.likes.includes('current-user') 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${
                        post.likes.includes('current-user') ? 'fill-current' : ''
                      }`} />
                      <span>{post.likes.length}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAppreciationForm(
                        showAppreciationForm === post._id ? null : post._id
                      )}
                      className="flex items-center space-x-2 text-yellow-600"
                    >
                      <Star className="w-4 h-4" />
                      <span>{post.appreciations.length}</span>
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Total Appreciation: {post.totalAppreciationPoints} points
                    </div>
                  </div>
                </div>
                
                {/* Appreciation Form */}
                {showAppreciationForm === post._id && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-3">
                      Appreciate this post with points
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-yellow-700 mb-1">
                          Points (1-100)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={appreciationData.points}
                          onChange={(e) => setAppreciationData({
                            ...appreciationData,
                            points: parseInt(e.target.value) || 1
                          })}
                          className="max-w-32"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-700 mb-1">
                          Message (optional)
                        </label>
                        <Textarea
                          value={appreciationData.message}
                          onChange={(e) => setAppreciationData({
                            ...appreciationData,
                            message: e.target.value
                          })}
                          placeholder="Leave a message of appreciation..."
                          rows={2}
                          maxLength={200}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAppreciatePost(post._id)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Appreciate with {appreciationData.points} points
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAppreciationForm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Appreciations List */}
                {post.appreciations.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                      Appreciations ({post.appreciations.length})
                    </h6>
                    <div className="space-y-2">
                      {post.appreciations.map((appreciation, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={appreciation.user.avatar} />
                            <AvatarFallback>
                              {appreciation.user.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">
                            {appreciation.user.fullName}
                          </span>
                          <span className="text-yellow-600 font-semibold">
                            +{appreciation.points} points
                          </span>
                          {appreciation.message && (
                            <span className="text-gray-600">
                              • "{appreciation.message}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPosts;
