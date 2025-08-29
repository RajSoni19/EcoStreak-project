import { Request, Response } from 'express';
import { CommunityPost } from '@/models/CommunityPost';
import { User } from '@/models/User';
import { Community } from '@/models/Community';

// Create a new community post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { communityId, title, content, category, images } = req.body;
    const userId = (req as any).user.id;

    // Check if user is member of the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (!community.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to post',
      });
    }

    const post = new CommunityPost({
      author: userId,
      community: communityId,
      title,
      content,
      category,
      images: images || [],
    });

    await post.save();

    // Populate author and community details
    await post.populate('author', 'fullName avatar');
    await post.populate('community', 'name');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message,
    });
  }
};

// Get posts for a community
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 10, category } = req.query;
    const userId = (req as any).user.id;

    // Check if user is member of the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (!community.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to view posts',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { community: communityId, isActive: true };
    
    if (category) {
      query.category = category;
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'fullName avatar')
      .populate('community', 'name')
      .populate('appreciations.user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting community posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get community posts',
      error: error.message,
    });
  }
};

// Get a single post
export const getPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await CommunityPost.findById(postId)
      .populate('author', 'fullName avatar')
      .populate('community', 'name')
      .populate('appreciations.user', 'fullName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    if (!community || !community.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to view this post',
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('Error getting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: error.message,
    });
  }
};

// Like/Unlike a post
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        isLiked: !isLiked,
        likesCount: post.likes.length,
      },
    });
  } catch (error: any) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message,
    });
  }
};

// Appreciate a post with points
export const appreciatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { points, message } = req.body;
    const userId = (req as any).user.id;

    if (!points || points < 1 || points > 100) {
      return res.status(400).json({
        success: false,
        message: 'Points must be between 1 and 100',
      });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is trying to appreciate their own post
    if (post.author.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot appreciate your own post',
      });
    }

    // Check if user has already appreciated this post
    const existingAppreciation = post.appreciations.find(
      app => app.user.toString() === userId
    );

    if (existingAppreciation) {
      return res.status(400).json({
        success: false,
        message: 'You have already appreciated this post',
      });
    }

    // Check if user has enough points
    const user = await User.findById(userId);
    if (!user || user.totalPoints < points) {
      return res.status(400).json({
        success: false,
        message: 'You do not have enough points to appreciate this post',
      });
    }

    // Add appreciation
    post.appreciations.push({
      user: userId,
      points,
      message,
      createdAt: new Date(),
    });

    await post.save();

    // Update user points
    user.totalPoints -= points;
    user.pointsGiven += points;
    await user.save();

    // Update post author points
    const postAuthor = await User.findById(post.author);
    if (postAuthor) {
      postAuthor.totalPoints += points;
      await postAuthor.save();
    }

    // Populate the updated post
    await post.populate('author', 'fullName avatar');
    await post.populate('community', 'name');
    await post.populate('appreciations.user', 'fullName avatar');

    res.json({
      success: true,
      message: 'Post appreciated successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Error appreciating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to appreciate post',
      error: error.message,
    });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content, category, images } = req.body;
    const userId = (req as any).user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (images) post.images = images;

    await post.save();

    // Populate author and community details
    await post.populate('author', 'fullName avatar');
    await post.populate('community', 'name');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message,
    });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
};

// Get user's posts
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await CommunityPost.find({ 
      author: userId, 
      isActive: true 
    })
      .populate('author', 'fullName avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments({ 
      author: userId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user posts',
      error: error.message,
    });
  }
};
