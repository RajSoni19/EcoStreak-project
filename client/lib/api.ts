const API_BASE_URL = 'http://localhost:5000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
      organizationName?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'ngo' | 'admin';
  organizationName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
      organizationName?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string): Promise<any> {
    return this.request('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  // User profile and stats
  async getUserStats(): Promise<any> {
    return this.request('/auth/profile');
  }

  // Events
  async getEvents(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/events${queryString}`);
  }

  async createEvent(data: any): Promise<any> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinEvent(eventId: string): Promise<any> {
    return this.request(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  async leaveEvent(eventId: string): Promise<any> {
    return this.request(`/events/${eventId}/leave`, {
      method: 'POST',
    });
  }

  // Habits
  async getHabits(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/habits${queryString}`);
  }

  async createHabit(data: any): Promise<any> {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeHabit(habitId: string): Promise<any> {
    return this.request(`/habits/${habitId}/complete`, {
      method: 'POST',
    });
  }

  // Store
  async getProducts(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/store${queryString}`);
  }

  async purchaseProduct(productId: string, quantity: number = 1): Promise<any> {
    return this.request(`/store/${productId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  // Leaderboard
  async getLeaderboard(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/leaderboard/global${queryString}`);
  }

  async getUserRank(): Promise<any> {
    return this.request('/leaderboard/user/rank');
  }

  // Community Posts
  async createCommunityPost(data: {
    communityId: string;
    title: string;
    content: string;
    category?: string;
    images?: string[];
  }): Promise<any> {
    return this.request('/community-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCommunityPosts(communityId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    
    return this.request(`/community-posts/community/${communityId}?${queryParams}`);
  }

  async getPost(postId: string): Promise<any> {
    return this.request(`/community-posts/${postId}`);
  }

  async togglePostLike(postId: string): Promise<any> {
    return this.request(`/community-posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async appreciatePost(postId: string, data: {
    points: number;
    message?: string;
  }): Promise<any> {
    return this.request(`/community-posts/${postId}/appreciate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(postId: string, data: {
    title?: string;
    content?: string;
    category?: string;
    images?: string[];
  }): Promise<any> {
    return this.request(`/community-posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<any> {
    return this.request(`/community-posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async getUserPosts(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request(`/community-posts/user/${userId}?${queryParams}`);
  }

  // User Events
  async getUserEvents(): Promise<any> {
    return this.request('/events/user');
  }

  async getUserEventRegistrations(): Promise<any> {
    return this.request('/events/registrations');
  }

  // NGO-specific endpoints
  async getNGODashboard(): Promise<any> {
    return this.request('/ngo/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOProfile(): Promise<any> {
    return this.request('/ngo/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async updateNGOProfile(data: any): Promise<any> {
    return this.request('/ngo/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getNGOEvents(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/events${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGOEvent(data: any): Promise<any> {
    return this.request('/ngo/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateNGOEvent(eventId: string, data: any): Promise<any> {
    return this.request(`/ngo/events/${eventId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteNGOEvent(eventId: string): Promise<any> {
    return this.request(`/ngo/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOEventDetails(eventId: string): Promise<any> {
    return this.request(`/ngo/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOEventParticipants(eventId: string, params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/events/${eventId}/participants${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async awardPointsToParticipants(eventId: string, data: {
    participantIds: string[];
    points: number;
    reason?: string;
  }): Promise<any> {
    return this.request(`/ngo/events/${eventId}/award-points`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getNGOCommunities(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/communities${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGOCommunity(data: any): Promise<any> {
    return this.request('/ngo/communities', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateNGOCommunity(communityId: string, data: any): Promise<any> {
    return this.request(`/ngo/communities/${communityId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteNGOCommunity(communityId: string): Promise<any> {
    return this.request(`/ngo/communities/${communityId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOAnalytics(period: string = 'month'): Promise<any> {
    return this.request(`/ngo/analytics?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOMembers(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/members${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async getNGOStoreProducts(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/store/products${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGOStoreProduct(data: any): Promise<any> {
    return this.request('/ngo/store/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateNGOStoreProduct(productId: string, data: any): Promise<any> {
    return this.request(`/ngo/store/products/${productId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteNGOStoreProduct(productId: string): Promise<any> {
    return this.request(`/ngo/store/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // NGO Community Posts
  async getNGOCommunityPosts(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/community-posts${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGOCommunityPost(data: any): Promise<any> {
    return this.request('/ngo/community-posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateNGOCommunityPost(postId: string, data: any): Promise<any> {
    return this.request(`/ngo/community-posts/${postId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteNGOCommunityPost(postId: string): Promise<any> {
    return this.request(`/ngo/community-posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // NGO Community Engagement Analytics
  async getNGOCommunityEngagement(period: string = 'month'): Promise<any> {
    return this.request(`/ngo/community-engagement?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // NGO Community Member Management
  async manageNGOCommunityMembers(communityId: string, data: {
    action: 'add_member' | 'remove_member' | 'add_moderator' | 'remove_moderator';
    userId: string;
  }): Promise<any> {
    return this.request(`/ngo/communities/${communityId}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  // NGO Rewards Management
  async getNGORewards(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/rewards${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGOReward(data: any): Promise<any> {
    return this.request('/ngo/rewards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async updateNGOReward(rewardId: string, data: any): Promise<any> {
    return this.request(`/ngo/rewards/${rewardId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteNGOReward(rewardId: string): Promise<any> {
    return this.request(`/ngo/rewards/${rewardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // NGO User Points Analytics
  async getNGOUserPointsAnalytics(period: string = 'month'): Promise<any> {
    return this.request(`/ngo/user-points-analytics?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // Award Points to Users
  async awardPointsToUsers(data: {
    userIds: string[];
    points: number;
    reason?: string;
    eventId?: string;
  }): Promise<any> {
    return this.request('/ngo/award-points', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  // NGO Dashboard Extended
  async getNGODashboardExtended(): Promise<any> {
    return this.request('/ngo/dashboard/extended', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  // NGO Notifications
  async getNGONotifications(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/ngo/notifications${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  async createNGONotification(data: any): Promise<any> {
    return this.request('/ngo/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
  }

  // NGO Notification Analytics
  async getNGONotificationAnalytics(period: string = 'month'): Promise<any> {
    return this.request(`/ngo/notification-analytics?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;
