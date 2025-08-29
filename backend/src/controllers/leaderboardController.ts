import { Request, Response } from 'express';
import { User } from '@/models/User';
import { Habit } from '@/models/Habit';
import { Event } from '@/models/Event';

export const getGlobalLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, timeframe = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let dateFilter: any = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter.createdAt = { $gte: weekAgo };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter.createdAt = { $gte: monthAgo };
    }

    const leaderboard = await User.aggregate([
      { $match: { ...dateFilter, isActive: true } },
      {
        $addFields: {
          totalPoints: { $ifNull: ['$points', 0] }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          fullName: 1,
          organizationName: 1,
          avatar: 1,
          role: 1,
          totalPoints: 1,
          isVerified: 1
        }
      }
    ]);

    const total = await User.countDocuments({ ...dateFilter, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        },
        timeframe
      }
    });

  } catch (error: any) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCommunityLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get community members
    const community = await Event.findById(communityId);
    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    const memberIds = community.members || [];
    
    const leaderboard = await User.aggregate([
      { $match: { _id: { $in: memberIds }, isActive: true } },
      {
        $addFields: {
          totalPoints: { $ifNull: ['$points', 0] }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          fullName: 1,
          organizationName: 1,
          avatar: 1,
          role: 1,
          totalPoints: 1,
          isVerified: 1
        }
      }
    ]);

    const total = memberIds.length;

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        },
        community: {
          id: community._id,
          name: community.name
        }
      }
    });

  } catch (error: any) {
    console.error('Get community leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userPoints = user.points || 0;

    // Get user's global rank
    const globalRank = await User.countDocuments({
      points: { $gt: userPoints },
      isActive: true
    }) + 1;

    // Get total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Get user's percentile
    const percentile = Math.round(((totalUsers - globalRank + 1) / totalUsers) * 100);

    // Get nearby users (5 above and 5 below)
    const nearbyUsers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          totalPoints: { $ifNull: ['$points', 0] }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $facet: {
          above: [
            { $match: { totalPoints: { $gt: userPoints } } },
            { $sort: { totalPoints: 1 } },
            { $limit: 5 }
          ],
          below: [
            { $match: { totalPoints: { $lt: userPoints } } },
            { $sort: { totalPoints: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          organizationName: user.organizationName,
          avatar: user.avatar,
          role: user.role,
          points: userPoints
        },
        rank: {
          global: globalRank,
          total: totalUsers,
          percentile
        },
        nearbyUsers: nearbyUsers[0]
      }
    });

  } catch (error: any) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTopPerformers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, category } = req.query;

    let matchStage: any = { isActive: true };
    
    if (category === 'habits') {
      // Top performers by habit completion
      const topHabitUsers = await Habit.aggregate([
        {
          $group: {
            _id: '$user',
            totalCompletions: { $sum: '$totalCompletions' },
            totalStreak: { $sum: '$streak' }
          }
        },
        { $sort: { totalCompletions: -1, totalStreak: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: '$userInfo._id',
            fullName: '$userInfo.fullName',
            organizationName: '$userInfo.organizationName',
            avatar: '$userInfo.avatar',
            role: '$userInfo.role',
            totalCompletions: 1,
            totalStreak: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          category: 'habits',
          topPerformers: topHabitUsers
        }
      });
    } else if (category === 'events') {
      // Top performers by event participation
      const topEventUsers = await Event.aggregate([
        {
          $group: {
            _id: '$organizer',
            totalEvents: { $sum: 1 },
            totalParticipants: { $sum: { $size: '$participants' } }
          }
        },
        { $sort: { totalEvents: -1, totalParticipants: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            _id: '$userInfo._id',
            fullName: '$userInfo.fullName',
            organizationName: '$userInfo.organizationName',
            avatar: '$userInfo.avatar',
            role: '$userInfo.role',
            totalEvents: 1,
            totalParticipants: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          category: 'events',
          topPerformers: topEventUsers
        }
      });
    } else {
      // Default: top performers by points
      const topPointUsers = await User.aggregate([
        { $match: { isActive: true } },
        {
          $addFields: {
            totalPoints: { $ifNull: ['$points', 0] }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            fullName: 1,
            organizationName: 1,
            avatar: 1,
            role: 1,
            totalPoints: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          category: 'points',
          topPerformers: topPointUsers
        }
      });
    }

  } catch (error: any) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getLeaderboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: { $ifNull: ['$points', 0] } },
          averagePoints: { $avg: { $ifNull: ['$points', 0] } },
          maxPoints: { $max: { $ifNull: ['$points', 0] } },
          minPoints: { $min: { $ifNull: ['$points', 0] } }
        }
      }
    ]);

    const roleDistribution = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const pointsDistribution = await User.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: { $ifNull: ['$points', 0] },
          boundaries: [0, 100, 500, 1000, 2500, 5000, 10000],
          default: '10000+',
          output: {
            count: { $sum: 1 },
            users: { $push: { fullName: '$fullName', points: '$points' } }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          totalUsers: 0,
          totalPoints: 0,
          averagePoints: 0,
          maxPoints: 0,
          minPoints: 0
        },
        roleDistribution,
        pointsDistribution
      }
    });

  } catch (error: any) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
