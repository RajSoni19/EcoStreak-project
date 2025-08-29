import { Request, Response } from 'express';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Community } from '@/models/Community';
import { Habit } from '@/models/Habit';
import { Store } from '@/models/Store';

// NGO Dashboard Analytics
export const getNGODashboard = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;

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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO dashboard',
      error: error.message,
    });
  }
};

// Get NGO Profile
export const getNGOProfile = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;

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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO profile',
      error: error.message,
    });
  }
};

// Update NGO Profile
export const updateNGOProfile = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
    const { fullName, organizationName, bio, website, phone, address } = req.body;

    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. NGO role required.',
      });
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
    res.status(500).json({
      success: false,
      message: 'Failed to update NGO profile',
      error: error.message,
    });
  }
};

// Get NGO Events
export const getNGOEvents = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
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

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO events',
      error: error.message,
    });
  }
};

// Get NGO Communities
export const getNGOCommunities = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const communities = await Community.find({ creator: ngoId })
      .populate('members', 'fullName email')
      .populate('creator', 'fullName organizationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Community.countDocuments({ creator: ngoId });

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO communities',
      error: error.message,
    });
  }
};

// Get NGO Analytics
export const getNGOAnalytics = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
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

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO analytics',
      error: error.message,
    });
  }
};

// Get NGO Members
export const getNGOMembers = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
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

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO members',
      error: error.message,
    });
  }
};

// Get NGO Store Products
export const getNGOStoreProducts = async (req: Request, res: Response) => {
  try {
    const ngoId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Store.find({ seller: ngoId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Store.countDocuments({ seller: ngoId });

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to get NGO store products',
      error: error.message,
    });
  }
};
