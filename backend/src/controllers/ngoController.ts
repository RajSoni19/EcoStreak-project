import { Request, Response } from 'express';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Community } from '@/models/Community';
import { Habit } from '@/models/Habit';
import { Store } from '@/models/Store';
import { CommunityPost } from '@/models/CommunityPost';

// NGO Dashboard Analytics
export const getNGODashboard = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const ngoId = req.user._id;

    // Get NGO profile
    const ngo = await User.findById(ngoId).select('-password');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. NGO role required.',
      });
    }

    // Get events created by NGO
    const events = await Event.find({ organizer: ngoId })
      .populate('participants', 'fullName email')
      .sort({ startDate: 1 })
      .limit(5);

    // Get communities managed by NGO
    const communities = await Community.find({ creator: ngoId })
      .populate('members', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get total participants across all events
    const totalParticipants = await Event.aggregate([
      { $match: { organizer: ngoId } },
      { $group: { _id: null, total: { $sum: { $size: '$participants' } } } }
    ]);

    // Get total events count
    const totalEvents = await Event.countDocuments({ organizer: ngoId });

    // Get total community members
    const totalMembers = await Community.aggregate([
      { $match: { creator: ngoId } },
      { $group: { _id: null, total: { $sum: { $size: '$members' } } } }
    ]);

    // Get recent activities (habits completed by community members)
    const recentActivities = await Habit.aggregate([
      {
        $lookup: {
          from: 'communities',
          localField: 'user',
          foreignField: 'members',
          as: 'userCommunities'
        }
      },
      {
        $match: {
          'userCommunities.creator': ngoId,
          isCompleted: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $sort: { completedAt: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        ngo,
        stats: {
          totalEvents,
          totalParticipants: totalParticipants[0]?.total || 0,
          totalMembers: totalMembers[0]?.total || 0,
        },
        events,
        communities,
        recentActivities,
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO dashboard',
      error: error.message,
    });
  }
};

// Get NGO Profile
export const getNGOProfile = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const ngoId = req.user._id;

    const ngo = await User.findById(ngoId).select('-password');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. NGO role required.',
      });
    }

    res.json({
      success: true,
      data: ngo,
    });
  } catch (error: any) {
    console.error('Error getting NGO profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO profile',
      error: error.message,
    });
  }
};

// Update NGO Profile
export const updateNGOProfile = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const ngoId = req.user._id;
    const { fullName, organizationName, bio, website, phone, address } = req.body;

    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'ngo') {
      res.status(403).json({
        success: false,
        message: 'Access denied. NGO role required.',
      });
      return;
    }

    // Update allowed fields
    if (fullName) ngo.fullName = fullName;
    if (organizationName) ngo.organizationName = organizationName;
    if (bio) ngo.bio = bio;
    if (website) ngo.website = website;
    if (phone) ngo.phone = phone;
    if (address) ngo.address = address;

    await ngo.save();

    res.json({
      success: true,
      message: 'NGO profile updated successfully',
      data: ngo,
    });
  } catch (error: any) {
    console.error('Error updating NGO profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update NGO profile',
      error: error.message,
    });
  }
};

// Get NGO Events
export const getNGOEvents = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { organizer: ngoId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
      .populate('participants', 'fullName email')
      .populate('community', 'name')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    return res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO events',
      error: error.message,
    });
  }
};

// Create NGO Event
export const createNGOEvent = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    console.log('🎯 createNGOEvent called');
    console.log('🎯 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('🎯 User from request:', req.user);
    
    const ngoId = req.user._id;
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      category,
      tags,
      maxParticipants,
      pointsForAttendance,
      pointsForCompletion,
      isPublic,
      community
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !location || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Create new event
    const event = new Event({
      title,
      description,
      organizer: ngoId,
      community,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      category,
      tags: tags || [],
      maxParticipants: maxParticipants || undefined,
      pointsForAttendance: pointsForAttendance || 10,
      pointsForCompletion: pointsForCompletion || 50,
      isPublic: isPublic !== undefined ? isPublic : true,
      participants: [],
      status: 'upcoming',
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'fullName organizationName')
      .populate('community', 'name');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent,
    });
  } catch (error: any) {
    console.error('Error creating NGO event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// Update NGO Event
export const updateNGOEvent = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const eventId = req.params.eventId;
    const updateData = req.body;

    // Check if event exists and belongs to NGO
    const event = await Event.findOne({ _id: eventId, organizer: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 'location', 
      'category', 'tags', 'maxParticipants', 'pointsForAttendance', 
      'pointsForCompletion', 'isPublic', 'community'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          (event as any)[field] = new Date(updateData[field]);
        } else {
          (event as any)[field] = updateData[field];
        }
      }
    });

    await event.save();

    const updatedEvent = await Event.findById(eventId)
      .populate('organizer', 'fullName organizationName')
      .populate('community', 'name')
      .populate('participants', 'fullName email');

    return res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error updating NGO event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};

// Delete NGO Event
export const deleteNGOEvent = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const eventId = req.params.eventId;

    // Check if event exists and belongs to NGO
    const event = await Event.findOne({ _id: eventId, organizer: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Check if event has participants
    if (event.participants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with registered participants',
      });
    }

    await Event.findByIdAndDelete(eventId);

    return res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting NGO event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
};

// Get NGO Event Details
export const getNGOEventDetails = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findOne({ _id: eventId, organizer: ngoId })
      .populate('organizer', 'fullName organizationName')
      .populate('community', 'name')
      .populate('participants', 'fullName email avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error('Error getting NGO event details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get event details',
      error: error.message,
    });
  }
};

// Get NGO Communities
export const getNGOCommunities = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const communities = await Community.find({ creator: ngoId })
      .populate('members', 'fullName email')
      .populate('creator', 'fullName organizationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Community.countDocuments({ creator: ngoId });

    return res.json({
      success: true,
      data: {
        communities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO communities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO communities',
      error: error.message,
    });
  }
};

// Create NGO Community
export const createNGOCommunity = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const {
      name,
      description,
      category,
      tags,
      isPublic,
      location,
      rules
    } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community name already exists',
      });
    }

    // Create new community
    const community = new Community({
      name,
      description,
      creator: ngoId,
      members: [ngoId], // Creator is automatically a member
      moderators: [ngoId], // Creator is automatically a moderator
      category,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      location,
      rules: rules || [],
    });

    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'fullName organizationName')
      .populate('members', 'fullName email');

    return res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: populatedCommunity,
    });
  } catch (error: any) {
    console.error('Error creating NGO community:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create community',
      error: error.message,
    });
  }
};

// Update NGO Community
export const updateNGOCommunity = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const communityId = req.params.communityId;
    const updateData = req.body;

    // Check if community exists and belongs to NGO
    const community = await Community.findOne({ _id: communityId, creator: ngoId });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found or access denied',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'description', 'category', 'tags', 'isPublic', 'location', 'rules'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (community as any)[field] = updateData[field];
      }
    });

    await community.save();

    const updatedCommunity = await Community.findById(communityId)
      .populate('creator', 'fullName organizationName')
      .populate('members', 'fullName email');

    return res.json({
      success: true,
      message: 'Community updated successfully',
      data: updatedCommunity,
    });
  } catch (error: any) {
    console.error('Error updating NGO community:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update community',
      error: error.message,
    });
  }
};

// Delete NGO Community
export const deleteNGOCommunity = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const communityId = req.params.communityId;

    // Check if community exists and belongs to NGO
    const community = await Community.findOne({ _id: communityId, creator: ngoId });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found or access denied',
      });
    }

    // Check if community has members (other than creator)
    if (community.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete community with active members',
      });
    }

    await Community.findByIdAndDelete(communityId);

    return res.json({
      success: true,
      message: 'Community deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting NGO community:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete community',
      error: error.message,
    });
  }
};

// Get NGO Analytics
export const getNGOAnalytics = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { period = 'month' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    // Event analytics
    const eventStats = await Event.aggregate([
      { $match: { organizer: ngoId, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalParticipants: { $sum: { $size: '$participants' } }
        }
      }
    ]);

    // Community growth
    const communityGrowth = await Community.aggregate([
      { $match: { creator: ngoId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalMembers: { $sum: { $size: '$members' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Member engagement (habits completed by community members)
    const memberEngagement = await Habit.aggregate([
      {
        $lookup: {
          from: 'communities',
          localField: 'user',
          foreignField: 'members',
          as: 'userCommunities'
        }
      },
      {
        $match: {
          'userCommunities.creator': ngoId,
          isCompleted: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          completedHabits: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return res.json({
      success: true,
      data: {
        eventStats,
        communityGrowth,
        memberEngagement,
        period,
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO analytics',
      error: error.message,
    });
  }
};

// Get NGO Members
export const getNGOMembers = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Get all communities created by NGO
    const communities = await Community.find({ creator: ngoId });
    const communityIds = communities.map(c => c._id);

    // Get all members from these communities
    const members = await Community.aggregate([
      { $match: { _id: { $in: communityIds } } },
      { $unwind: '$members' },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$members',
          userInfo: { $first: '$userInfo' },
          communities: { $addToSet: '$name' }
        }
      },
      { $skip: skip },
      { $limit: Number(limit) }
    ]);

    const total = await Community.aggregate([
      { $match: { _id: { $in: communityIds } } },
      { $unwind: '$members' },
      { $group: { _id: '$members' } },
      { $count: 'total' }
    ]);

    return res.json({
      success: true,
      data: {
        members,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total[0]?.total || 0,
          pages: Math.ceil((total[0]?.total || 0) / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO members:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO members',
      error: error.message,
    });
  }
};

// Get NGO Store Products
export const getNGOStoreProducts = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Store.find({ seller: ngoId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Store.countDocuments({ seller: ngoId });

    return res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO store products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO store products',
      error: error.message,
    });
  }
};

// Create NGO Store Product
export const createNGOStoreProduct = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    console.log('🎯 createNGOStoreProduct called');
    console.log('🎯 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('🎯 User from request:', req.user);
    
    const ngoId = req.user._id;
    const {
      name,
      description,
      category,
      tags,
      price,
      pointsCost,
      stock,
      location,
      contact,
      socialMedia
    } = req.body;

    console.log('Creating NGO store product with data:', {
      ngoId,
      name,
      description,
      category,
      price,
      pointsCost,
      stock,
      location,
      contact,
      socialMedia
    });

    // Validate required fields
    if (!name || !description || !category || !price || !pointsCost || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing: {
          name: !name,
          description: !description,
          category: !category,
          price: !price,
          pointsCost: !pointsCost,
          stock: !stock
        }
      });
    }

    // Create new store product
    const product = new Store({
      name,
      description,
      owner: ngoId,
      category,
      tags: tags || [],
      price,
      pointsCost,
      stock,
      seller: ngoId,
      location,
      contact,
      socialMedia,
      isVerified: false, // Will be verified by admin
      isActive: true,
      rating: 0,
      totalRatings: 0,
    });

    console.log('Store product object created:', product);

    await product.save();

    const populatedProduct = await Store.findById(product._id)
      .populate('owner', 'fullName organizationName')
      .populate('seller', 'fullName organizationName');

    return res.status(201).json({
      success: true,
      message: 'Store product created successfully',
      data: populatedProduct,
    });
  } catch (error: any) {
    console.error('Error creating NGO store product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store product',
      error: error.message,
    });
  }
};

// Update NGO Store Product
export const updateNGOStoreProduct = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const productId = req.params.productId;
    const updateData = req.body;

    // Check if product exists and belongs to NGO
    const product = await Store.findOne({ _id: productId, seller: ngoId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'description', 'category', 'tags', 'price', 'pointsCost', 
      'stock', 'location', 'contact', 'socialMedia', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (product as any)[field] = updateData[field];
      }
    });

    await product.save();

    const updatedProduct = await Store.findById(productId)
      .populate('owner', 'fullName organizationName')
      .populate('seller', 'fullName organizationName');

    return res.json({
      success: true,
      message: 'Store product updated successfully',
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error updating NGO store product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update store product',
      error: error.message,
    });
  }
};

// Delete NGO Store Product
export const deleteNGOStoreProduct = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const productId = req.params.productId;

    // Check if product exists and belongs to NGO
    const product = await Store.findOne({ _id: productId, seller: ngoId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied',
      });
    }

    await Store.findByIdAndDelete(productId);

    return res.json({
      success: true,
      message: 'Store product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting NGO store product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete store product',
      error: error.message,
    });
  }
};

// Get NGO Event Participants
export const getNGOEventParticipants = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const eventId = req.params.eventId;
    const { page = 1, limit = 20 } = req.query;

    // Check if event exists and belongs to NGO
    const event = await Event.findOne({ _id: eventId, organizer: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const participants = await User.find({ _id: { $in: event.participants } })
      .select('fullName email avatar currentStreak totalPoints')
      .skip(skip)
      .limit(Number(limit));

    const total = event.participants.length;

    return res.json({
      success: true,
      data: {
        participants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO event participants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get event participants',
      error: error.message,
    });
  }
};

// Award Points to Event Participants
export const awardPointsToParticipants = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const eventId = req.params.eventId;
    const { participantIds, points, reason } = req.body;

    // Check if event exists and belongs to NGO
    const event = await Event.findOne({ _id: eventId, organizer: ngoId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Validate participant IDs
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid participant IDs are required',
      });
    }

    // Check if all participants are registered for the event
    const validParticipants = participantIds.filter(id => 
      event.participants.includes(id)
    );

    if (validParticipants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some participants are not registered for this event',
      });
    }

    // Award points to participants
    const updatePromises = validParticipants.map(participantId =>
      User.findByIdAndUpdate(participantId, {
        $inc: { totalPoints: points },
        $set: { lastStreakDate: new Date() }
      })
    );

    await Promise.all(updatePromises);

    return res.json({
      success: true,
      message: `Points awarded successfully to ${validParticipants.length} participants`,
      data: {
        participantsAwarded: validParticipants.length,
        pointsAwarded: points * validParticipants.length,
        reason
      }
    });
  } catch (error: any) {
    console.error('Error awarding points to participants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message,
    });
  }
};

// Get NGO Community Posts
export const getNGOCommunityPosts = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { communityId, page = 1, limit = 20, category } = req.query;

    // Get communities created by NGO
    const communities = await Community.find({ creator: ngoId });
    const communityIds = communities.map(c => c._id);

    // If specific community is requested, verify ownership
    if (communityId && !communityIds.includes(communityId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this community',
      });
    }

    const query: any = { community: { $in: communityIds } };
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await CommunityPost.find(query)
      .populate('author', 'fullName email avatar')
      .populate('community', 'name')
      .populate('likes', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(query);

    return res.json({
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
    console.error('Error getting NGO community posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get community posts',
      error: error.message,
    });
  }
};

// Create NGO Community Post
export const createNGOCommunityPost = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { communityId, title, content, images, category } = req.body;

    // Validate required fields
    if (!communityId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if community exists and belongs to NGO
    const community = await Community.findOne({ _id: communityId, creator: ngoId });
    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'Community not found or access denied',
      });
    }

    // Create new post
    const post = new CommunityPost({
      author: ngoId,
      community: communityId,
      title,
      content,
      images: images || [],
      category: category || 'general',
      likes: [],
      appreciations: [],
      totalAppreciationPoints: 0,
    });

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'fullName email avatar')
      .populate('community', 'name');

    return res.status(201).json({
      success: true,
      message: 'Community post created successfully',
      data: populatedPost,
    });
  } catch (error: any) {
    console.error('Error creating NGO community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create community post',
      error: error.message,
    });
  }
};

// Update NGO Community Post
export const updateNGOCommunityPost = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const postId = req.params.postId;
    const updateData = req.body;

    // Check if post exists and belongs to NGO
    const post = await CommunityPost.findById(postId).populate('community');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if NGO owns the community where the post was made
    const community = await Community.findOne({ _id: post.community, creator: ngoId });
    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this post',
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'content', 'images', 'category'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (post as any)[field] = updateData[field];
      }
    });

    await post.save();

    const updatedPost = await CommunityPost.findById(postId)
      .populate('author', 'fullName email avatar')
      .populate('community', 'name')
      .populate('likes', 'fullName');

    return res.json({
      success: true,
      message: 'Community post updated successfully',
      data: updatedPost,
    });
  } catch (error: any) {
    console.error('Error updating NGO community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update community post',
      error: error.message,
    });
  }
};

// Delete NGO Community Post
export const deleteNGOCommunityPost = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const postId = req.params.postId;

    // Check if post exists and belongs to NGO
    const post = await CommunityPost.findById(postId).populate('community');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if NGO owns the community where the post was made
    const community = await Community.findOne({ _id: post.community, creator: ngoId });
    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this post',
      });
    }

    await CommunityPost.findByIdAndDelete(postId);

    return res.json({
      success: true,
      message: 'Community post deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting NGO community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete community post',
      error: error.message,
    });
  }
};

// Get NGO Community Engagement Analytics
export const getNGOCommunityEngagement = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { period = 'month' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    // Get communities created by NGO
    const communities = await Community.find({ creator: ngoId });
    const communityIds = communities.map(c => c._id);

    // Get post analytics
    const postStats = await CommunityPost.aggregate([
      { $match: { community: { $in: communityIds }, ...dateFilter } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalAppreciationPoints: { $sum: '$totalAppreciationPoints' }
        }
      }
    ]);

    // Get engagement trends over time
    const engagementTrends = await CommunityPost.aggregate([
      { $match: { community: { $in: communityIds }, ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          posts: { $sum: 1 },
          likes: { $sum: { $size: '$likes' } },
          appreciationPoints: { $sum: '$totalAppreciationPoints' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top performing posts
    const topPosts = await CommunityPost.find({ community: { $in: communityIds } })
      .populate('author', 'fullName')
      .populate('community', 'name')
      .sort({ totalAppreciationPoints: -1, 'likes.length': -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        postStats,
        engagementTrends,
        topPosts,
        period,
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO community engagement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get community engagement analytics',
      error: error.message,
    });
  }
};

// Manage NGO Community Members
export const manageNGOCommunityMembers = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const communityId = req.params.communityId;
    const { action, userId, role } = req.body;

    // Check if community exists and belongs to NGO
    const community = await Community.findOne({ _id: communityId, creator: ngoId });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found or access denied',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    switch (action) {
      case 'add_member':
        if (!community.members.includes(userId)) {
          community.members.push(userId);
          await community.save();
        }
        break;

      case 'remove_member':
        if (userId !== ngoId) { // Cannot remove creator
          community.members = community.members.filter(id => id.toString() !== userId);
          community.moderators = community.moderators.filter(id => id.toString() !== userId);
          await community.save();
        }
        break;

      case 'add_moderator':
        if (community.members.includes(userId) && !community.moderators.includes(userId)) {
          community.moderators.push(userId);
          await community.save();
        }
        break;

      case 'remove_moderator':
        if (userId !== ngoId) { // Cannot remove creator from moderators
          community.moderators = community.moderators.filter(id => id.toString() !== userId);
          await community.save();
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
        });
    }

    const updatedCommunity = await Community.findById(communityId)
      .populate('creator', 'fullName organizationName')
      .populate('members', 'fullName email')
      .populate('moderators', 'fullName email');

    return res.json({
      success: true,
      message: `Member ${action} successful`,
      data: updatedCommunity,
    });
  } catch (error: any) {
    console.error('Error managing NGO community members:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to manage community members',
      error: error.message,
    });
  }
};

// Create NGO Reward
export const createNGOReward = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const {
      name,
      description,
      pointsCost,
      category,
      image,
      isActive,
      maxRedemptions,
      expiryDate
    } = req.body;

    // Validate required fields
    if (!name || !description || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Create new reward
    const reward = new Store({
      name,
      description,
      owner: ngoId,
      category: category || 'eco-products',
      tags: [],
      price: 0, // Rewards are free, only cost points
      pointsCost,
      stock: maxRedemptions || -1, // -1 means unlimited
      seller: ngoId,
      location: {
        address: 'Digital Reward',
        city: 'Online',
        state: 'Digital',
        country: 'Global'
      },
      contact: {
        email: req.user.email
      },
      isVerified: true,
      isActive: isActive !== undefined ? isActive : true,
      rating: 0,
      totalRatings: 0,
    });

    await reward.save();

    const populatedReward = await Store.findById(reward._id)
      .populate('owner', 'fullName organizationName')
      .populate('seller', 'fullName organizationName');

    return res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: populatedReward,
    });
  } catch (error: any) {
    console.error('Error creating NGO reward:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reward',
      error: error.message,
    });
  }
};

// Get NGO Rewards
export const getNGORewards = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 10, isActive } = req.query;

    const query: any = { seller: ngoId, price: 0 }; // Only rewards (free items)
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const rewards = await Store.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Store.countDocuments(query);

    return res.json({
      success: true,
      data: {
        rewards,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO rewards:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get rewards',
      error: error.message,
    });
  }
};

// Update NGO Reward
export const updateNGOReward = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const rewardId = req.params.rewardId;
    const updateData = req.body;

    // Check if reward exists and belongs to NGO
    const reward = await Store.findOne({ _id: rewardId, seller: ngoId, price: 0 });
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or access denied',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'description', 'pointsCost', 'category', 'image', 
      'isActive', 'maxRedemptions'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'maxRedemptions') {
          (reward as any).stock = updateData[field];
        } else {
          (reward as any)[field] = updateData[field];
        }
      }
    });

    await reward.save();

    const updatedReward = await Store.findById(rewardId)
      .populate('owner', 'fullName organizationName')
      .populate('seller', 'fullName organizationName');

    return res.json({
      success: true,
      message: 'Reward updated successfully',
      data: updatedReward,
    });
  } catch (error: any) {
    console.error('Error updating NGO reward:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reward',
      error: error.message,
    });
  }
};

// Delete NGO Reward
export const deleteNGOReward = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const rewardId = req.params.rewardId;

    // Check if reward exists and belongs to NGO
    const reward = await Store.findOne({ _id: rewardId, seller: ngoId, price: 0 });
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or access denied',
      });
    }

    await Store.findByIdAndDelete(rewardId);

    return res.json({
      success: true,
      message: 'Reward deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting NGO reward:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete reward',
      error: error.message,
    });
  }
};

// Get NGO User Points Analytics
export const getNGOUserPointsAnalytics = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { period = 'month' } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { lastStreakDate: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { lastStreakDate: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { lastStreakDate: { $gte: yearAgo } };
    }

    // Get communities created by NGO
    const communities = await Community.find({ creator: ngoId });
    const communityIds = communities.map(c => c._id);

    // Get users from these communities
    const communityUsers = await Community.aggregate([
      { $match: { _id: { $in: communityIds } } },
      { $unwind: '$members' },
      { $group: { _id: '$members' } }
    ]);

    const userIds = communityUsers.map(u => u._id);

    // Get user points analytics
    const userPointsStats = await User.aggregate([
      { $match: { _id: { $in: userIds }, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$totalPoints' },
          avgPoints: { $avg: '$totalPoints' },
          maxPoints: { $max: '$totalPoints' },
          minPoints: { $min: '$totalPoints' },
          totalStreaks: { $sum: '$currentStreak' },
          avgStreak: { $avg: '$currentStreak' }
        }
      }
    ]);

    // Get top users by points
    const topUsers = await User.find({ _id: { $in: userIds } })
      .select('fullName email totalPoints currentStreak longestStreak')
      .sort({ totalPoints: -1 })
      .limit(10);

    // Get points distribution
    const pointsDistribution = await User.aggregate([
      { $match: { _id: { $in: userIds } } },
      {
        $bucket: {
          groupBy: '$totalPoints',
          boundaries: [0, 100, 500, 1000, 2500, 5000, 10000],
          default: '10000+',
          output: {
            count: { $sum: 1 },
            users: { $push: { fullName: '$fullName', points: '$totalPoints' } }
          }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        userPointsStats: userPointsStats[0] || {},
        topUsers,
        pointsDistribution,
        period,
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO user points analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user points analytics',
      error: error.message,
    });
  }
};

// Award Points to Specific Users
export const awardPointsToUsers = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { userIds, points, reason, eventId } = req.body;

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !points) {
      return res.status(400).json({
        success: false,
        message: 'Valid user IDs and points are required',
      });
    }

    // Check if NGO has access to these users (through communities)
    const communities = await Community.find({ creator: ngoId });
    const communityIds = communities.map(c => c._id);
    
    const accessibleUsers = await Community.aggregate([
      { $match: { _id: { $in: communityIds } } },
      { $unwind: '$members' },
      { $group: { _id: '$members' } }
    ]);

    const accessibleUserIds = accessibleUsers.map(u => u._id.toString());
    const validUserIds = userIds.filter(id => accessibleUserIds.includes(id));

    if (validUserIds.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some users are not accessible',
      });
    }

    // Award points to users
    const updatePromises = validUserIds.map(userId =>
      User.findByIdAndUpdate(userId, {
        $inc: { totalPoints: points },
        $set: { lastStreakDate: new Date() }
      })
    );

    await Promise.all(updatePromises);

    return res.json({
      success: true,
      message: `Points awarded successfully to ${validUserIds.length} users`,
      data: {
        usersAwarded: validUserIds.length,
        pointsAwarded: points * validUserIds.length,
        reason,
        eventId
      }
    });
  } catch (error: any) {
    console.error('Error awarding points to users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message,
    });
  }
};

// Create NGO Notification
export const createNGONotification = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const {
      title,
      message,
      type,
      targetUsers,
      communityId,
      eventId,
      isUrgent,
      scheduledFor
    } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if NGO has access to target users or community
    let targetUserIds: string[] = [];
    
    if (targetUsers && targetUsers.length > 0) {
      // Verify NGO has access to these users through communities
      const communities = await Community.find({ creator: ngoId });
      const communityIds = communities.map(c => c._id);
      
      const accessibleUsers = await Community.aggregate([
        { $match: { _id: { $in: communityIds } } },
        { $unwind: '$members' },
        { $group: { _id: '$members' } }
      ]);
      
      const accessibleUserIds = accessibleUsers.map(u => u._id.toString());
      targetUserIds = targetUsers.filter((id: string) => accessibleUserIds.includes(id));
    } else if (communityId) {
      // Verify NGO owns the community
      const community = await Community.findOne({ _id: communityId, creator: ngoId });
      if (!community) {
        return res.status(403).json({
          success: false,
          message: 'Community not found or access denied',
        });
      }
      targetUserIds = community.members.map(id => id.toString());
    }

    // Create notification object (you'll need to create a Notification model)
    const notification = {
      title,
      message,
      type,
      sender: ngoId,
      targetUsers: targetUserIds,
      community: communityId,
      event: eventId,
      isUrgent: isUrgent || false,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      status: 'sent',
      readBy: [],
      createdAt: new Date()
    };

    // For now, we'll return the notification object
    // In a real implementation, you'd save this to a Notification collection
    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        ...notification,
        targetUsersCount: targetUserIds.length
      },
    });
  } catch (error: any) {
    console.error('Error creating NGO notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

// Get NGO Notifications
export const getNGONotifications = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { page = 1, limit = 20, type, status } = req.query;

    // TODO: Implement real notification system
    // For now, return empty response until Notification model is created
    return res.json({
      success: true,
      data: {
        notifications: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

// Get NGO Notification Analytics
export const getNGONotificationAnalytics = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;
    const { period = 'month' } = req.query;

    // TODO: Implement real notification analytics
    // For now, return empty analytics until Notification model is created
    return res.json({
      success: true,
      data: {
        totalNotifications: 0,
        notificationsByType: {},
        readRate: 0,
        engagementRate: 0,
        topPerformingNotifications: []
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO notification analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notification analytics',
      error: error.message,
    });
  }
};

// Get NGO Dashboard Extended Analytics
export const getNGODashboardExtended = async (req: Request, res: Response) => { // @ts-ignore - Missing return statements
  try {
    const ngoId = req.user._id;

    // Get basic NGO profile
    const ngo = await User.findById(ngoId).select('-password');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. NGO role required.',
      });
    }

    // Get comprehensive statistics
    const [
      totalEvents,
      totalCommunities,
      totalMembers,
      totalPosts,
      totalRewards,
      recentActivities
    ] = await Promise.all([
      Event.countDocuments({ organizer: ngoId }),
      Community.countDocuments({ creator: ngoId }),
      Community.aggregate([
        { $match: { creator: ngoId } },
        { $group: { _id: null, total: { $sum: { $size: '$members' } } } }
      ]),
      CommunityPost.countDocuments({ 
        community: { $in: (await Community.find({ creator: ngoId })).map(c => c._id) }
      }),
      Store.countDocuments({ seller: ngoId, price: 0 }), // Rewards only
      Habit.aggregate([
        {
          $lookup: {
            from: 'communities',
            localField: 'user',
            foreignField: 'members',
            as: 'userCommunities'
          }
        },
        {
          $match: {
            'userCommunities.creator': ngoId,
            isCompleted: true
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $sort: { completedAt: -1 }
        },
        {
          $limit: 5
        }
      ])
    ]);

    // Get upcoming events
    const upcomingEvents = await Event.find({ 
      organizer: ngoId, 
      startDate: { $gte: new Date() },
      status: 'upcoming'
    })
    .populate('participants', 'fullName email')
    .sort({ startDate: 1 })
    .limit(3);

    // Get recent community posts
    const recentPosts = await CommunityPost.find({
      community: { $in: (await Community.find({ creator: ngoId })).map(c => c._id) }
    })
    .populate('author', 'fullName email avatar')
    .populate('community', 'name')
    .sort({ createdAt: -1 })
    .limit(3);

    return res.json({
      success: true,
      data: {
        ngo,
        stats: {
          totalEvents,
          totalCommunities,
          totalMembers: totalMembers[0]?.total || 0,
          totalPosts,
          totalRewards,
        },
        upcomingEvents,
        recentPosts,
        recentActivities,
        quickActions: [
          { name: 'Create Event', action: 'create_event', icon: 'calendar' },
          { name: 'Create Community', action: 'create_community', icon: 'users' },
          { name: 'Add Reward', action: 'add_reward', icon: 'gift' },
          { name: 'Send Notification', action: 'send_notification', icon: 'bell' }
        ]
      },
    });
  } catch (error: any) {
    console.error('Error getting NGO dashboard extended:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get NGO dashboard extended',
      error: error.message,
    });
  }
};
