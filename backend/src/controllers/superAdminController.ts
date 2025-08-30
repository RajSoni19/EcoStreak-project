import { Request, Response } from 'express';
import { User } from '@/models/User';
import { Organization } from '@/models/Organization';
import { Event } from '@/models/Event';
import { Community } from '@/models/Community';
import { Store } from '@/models/Store';
import { Habit } from '@/models/Habit';

// Super Admin Dashboard Analytics
export const getSuperAdminDashboard = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    // Get platform statistics
    const totalOrganizations = await Organization.countDocuments();
    const pendingOrganizations = await Organization.countDocuments({ status: 'pending' });
    const approvedOrganizations = await Organization.countDocuments({ status: 'approved' });
    const totalUsers = await User.countDocuments({ role: { $in: ['user', 'ngo'] } });
    const totalEvents = await Event.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalProducts = await Store.countDocuments();
    const totalHabits = await Habit.countDocuments();

    // Get recent organization applications
    const recentApplications = await Organization.find({ status: 'pending' })
      .populate('adminUser', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent activities
    const recentEvents = await Event.find()
      .populate('organizer', 'fullName organizationName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get organization status distribution
    const organizationStats = await Organization.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          role: { $in: ['user', 'ngo'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          totalOrganizations,
          pendingOrganizations,
          approvedOrganizations,
          totalUsers,
          totalEvents,
          totalCommunities,
          totalProducts,
          totalHabits
        },
        recentApplications,
        recentEvents,
        organizationStats,
        userGrowth
      }
    });
  } catch (error: any) {
    console.error('Error getting super admin dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get super admin dashboard',
      error: error.message,
    });
  }
};

// Get all organizations with filtering and pagination
export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      focusArea,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    // Build filter query
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (focusArea) {
      filter.focusAreas = focusArea;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get organizations with pagination
    const organizations = await Organization.find(filter)
      .populate('adminUser', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Organization.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        organizations,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting organizations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get organizations',
      error: error.message,
    });
  }
};

// Get organization details
export const getOrganizationDetails = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const organizationId = req.params.organizationId;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const organization = await Organization.findById(organizationId)
      .populate('adminUser', 'fullName email phone organizationName')
      .populate('approvalDetails.approvedBy', 'fullName email')
      .populate('approvalDetails.rejectedBy', 'fullName email')
      .populate('approvalDetails.suspendedBy', 'fullName email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Get organization statistics
    const totalEvents = await Event.countDocuments({ organizer: organization.adminUser });
    const totalCommunities = await Community.countDocuments({ creator: organization.adminUser });
    const totalProducts = await Store.countDocuments({ owner: organization.adminUser });
    const totalMembers = await User.countDocuments({ organizationId: organization._id });

    return res.json({
      success: true,
      data: {
        organization,
        stats: {
          totalEvents,
          totalCommunities,
          totalProducts,
          totalMembers
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting organization details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get organization details',
      error: error.message,
    });
  }
};

// Approve organization
export const approveOrganization = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const organizationId = req.params.organizationId;
    const { approvalNotes } = req.body;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Organization is not in pending status',
      });
    }

    // Update organization status
    organization.status = 'approved';
    organization.approvalDetails = {
      ...organization.approvalDetails,
      approvedBy: adminId,
      approvedAt: new Date()
    };

    await organization.save();

    // Update the admin user to allow login
    await User.findByIdAndUpdate(organization.adminUser, {
      isActive: true,
      organizationApproved: true
    });

    return res.json({
      success: true,
      message: 'Organization approved successfully',
      data: organization
    });
  } catch (error: any) {
    console.error('Error approving organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve organization',
      error: error.message,
    });
  }
};

// Reject organization
export const rejectOrganization = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const organizationId = req.params.organizationId;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Organization is not in pending status',
      });
    }

    // Update organization status
    organization.status = 'rejected';
    organization.approvalDetails = {
      ...organization.approvalDetails,
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason
    };

    await organization.save();

    // Update the admin user to prevent login
    await User.findByIdAndUpdate(organization.adminUser, {
      isActive: false,
      organizationApproved: false
    });

    return res.json({
      success: true,
      message: 'Organization rejected successfully',
      data: organization
    });
  } catch (error: any) {
    console.error('Error rejecting organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject organization',
      error: error.message,
    });
  }
};

// Suspend organization
export const suspendOrganization = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const organizationId = req.params.organizationId;
    const { suspensionReason } = req.body;

    if (!suspensionReason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required',
      });
    }

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Organization is already suspended',
      });
    }

    // Update organization status
    organization.status = 'suspended';
    organization.approvalDetails = {
      ...organization.approvalDetails,
      suspendedBy: adminId,
      suspendedAt: new Date(),
      suspensionReason
    };

    await organization.save();

    // Update the admin user to prevent login
    await User.findByIdAndUpdate(organization.adminUser, {
      isActive: false
    });

    return res.json({
      success: true,
      message: 'Organization suspended successfully',
      data: organization
    });
  } catch (error: any) {
    console.error('Error suspending organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to suspend organization',
      error: error.message,
    });
  }
};

// Reactivate organization
export const reactivateOrganization = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const organizationId = req.params.organizationId;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Organization is not suspended',
      });
    }

    // Update organization status
    organization.status = 'approved';
    organization.approvalDetails = {
      ...organization.approvalDetails,
      approvedBy: adminId,
      approvedAt: new Date()
    };

    await organization.save();

    // Update the admin user to allow login
    await User.findByIdAndUpdate(organization.adminUser, {
      isActive: true
    });

    return res.json({
      success: true,
      message: 'Organization reactivated successfully',
      data: organization
    });
  } catch (error: any) {
    console.error('Error reactivating organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reactivate organization',
      error: error.message,
    });
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const { period = 'month' } = req.query;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: { $in: ['user', 'ngo'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get organization growth
    const organizationGrowth = await Organization.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get event growth
    const eventGrowth = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top organizations by events
    const topOrganizations = await Event.aggregate([
      {
        $group: {
          _id: '$organizer',
          eventCount: { $sum: 1 }
        }
      },
      {
        $sort: { eventCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          organizationName: '$user.organizationName',
          fullName: '$user.fullName',
          eventCount: 1
        }
      }
    ]);

    // Get focus areas distribution
    const focusAreasDistribution = await Organization.aggregate([
      {
        $unwind: '$focusAreas'
      },
      {
        $group: {
          _id: '$focusAreas',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return res.json({
      success: true,
      data: {
        userGrowth,
        organizationGrowth,
        eventGrowth,
        topOrganizations,
        focusAreasDistribution
      }
    });
  } catch (error: any) {
    console.error('Error getting platform analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get platform analytics',
      error: error.message,
    });
  }
};

// Get all users with filtering
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      role, 
      search, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    // Build filter query
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const adminId = req.user._id;
    const userId = req.params.userId;
    const { isActive, reason } = req.body;

    // Verify super admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating other admins
    if (user.role === 'admin' && (user._id as any).toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify other admin accounts',
      });
    }

    user.isActive = isActive;
    if (reason) {
      user.deactivationReason = reason;
    }

    await user.save();

    return res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};
