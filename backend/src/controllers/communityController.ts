import { Request, Response } from 'express';
import { Community } from '@/models/Community';
import { User } from '@/models/User';

export const createCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, tags, location, rules, isPublic } = req.body;
    
    const community = new Community({
      name,
      description,
      category,
      tags,
      location,
      rules,
      isPublic,
      creator: req.user._id,
      members: [req.user._id],
      moderators: [req.user._id],
    });

    await community.save();

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: { community }
    });

  } catch (error: any) {
    console.error('Create community error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search, location } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { isActive: true };
    
    if (category) filter.category = category;
    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const communities = await Community.find(filter)
      .populate('creator', 'fullName avatar')
      .populate('members', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Community.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        communities,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCommunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id)
      .populate('creator', 'fullName avatar organizationName')
      .populate('members', 'fullName avatar organizationName')
      .populate('moderators', 'fullName avatar organizationName');

    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (!community.isPublic && !community.members.includes(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Access denied to private community'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { community }
    });

  } catch (error: any) {
    console.error('Get community error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const community = await Community.findById(id);
    
    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Check if user is creator or moderator
    if (!community.creator.equals(req.user._id) && !community.moderators.includes(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only creators and moderators can update community'
      });
      return;
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('creator', 'fullName avatar organizationName');

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      data: { community: updatedCommunity }
    });

  } catch (error: any) {
    console.error('Update community error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const joinCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    
    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (!community.isActive) {
      res.status(400).json({
        success: false,
        message: 'Community is not active'
      });
      return;
    }

    if (community.members.includes(req.user._id)) {
      res.status(400).json({
        success: false,
        message: 'Already a member of this community'
      });
      return;
    }

    community.members.push(req.user._id);
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined community'
    });

  } catch (error: any) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const leaveCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    
    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    if (!community.members.includes(req.user._id)) {
      res.status(400).json({
        success: false,
        message: 'Not a member of this community'
      });
      return;
    }

    // Creator cannot leave community
    if (community.creator.equals(req.user._id)) {
      res.status(400).json({
        success: false,
        message: 'Creator cannot leave community'
      });
      return;
    }

    community.members = community.members.filter(
      memberId => !memberId.equals(req.user._id)
    );
    
    // Remove from moderators if applicable
    community.moderators = community.moderators.filter(
      moderatorId => !moderatorId.equals(req.user._id)
    );

    await community.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left community'
    });

  } catch (error: any) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    
    if (!community) {
      res.status(404).json({
        success: false,
        message: 'Community not found'
      });
      return;
    }

    // Only creator can delete community
    if (!community.creator.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only creator can delete community'
      });
      return;
    }

    community.isActive = false;
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete community error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
