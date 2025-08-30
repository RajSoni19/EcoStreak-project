import { Request, Response } from 'express';
import { Event } from '@/models/Event';
import { User } from '@/models/User';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startDate, endDate, location, maxParticipants, pointsAwarded, category, tags } = req.body;
    
    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      maxParticipants,
      pointsAwarded,
      category,
      tags,
      organizer: req.user._id,
      participants: [],
      status: 'upcoming',
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });

  } catch (error: any) {
    console.error('Create event error:', error);
    
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

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search, status, organizer } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (organizer) filter.organizer = organizer;
    if (search) {
      filter.$text = { $search: search };
    }

    const events = await Event.find(filter)
      .populate('organizer', 'fullName organizationName avatar')
      .populate('participants', 'fullName avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('organizer', 'fullName organizationName avatar')
      .populate('participants', 'fullName avatar');

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { event }
    });

  } catch (error: any) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is organizer
    if (!event.organizer.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only organizer can update event'
      });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('organizer', 'fullName organizationName avatar');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });

  } catch (error: any) {
    console.error('Update event error:', error);
    
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

export const joinEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    if (event.status !== 'upcoming') {
      res.status(400).json({
        success: false,
        message: 'Event is not accepting participants'
      });
      return;
    }

    if (event.participants.includes(req.user._id)) {
      res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
      return;
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      res.status(400).json({
        success: false,
        message: 'Event is full'
      });
      return;
    }

    event.participants.push(req.user._id);
    await event.save();

    // Award points for joining the event
    const user = await User.findById(req.user._id);
    if (user && event.pointsForAttendance) {
      user.totalPoints += event.pointsForAttendance;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Successfully joined event! +${event.pointsForAttendance || 0} points awarded`,
      data: {
        pointsAwarded: event.pointsForAttendance || 0,
        totalPoints: user?.totalPoints || 0
      }
    });

  } catch (error: any) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const leaveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    if (!event.participants.includes(req.user._id)) {
      res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
      return;
    }

    event.participants = event.participants.filter(
      participantId => !participantId.equals(req.user._id)
    );
    
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left event'
    });

  } catch (error: any) {
    console.error('Leave event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is organizer
    if (!event.organizer.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only organizer can delete event'
      });
      return;
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { participants: userId };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('organizer', 'fullName organizationName avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getOrganizerEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { organizer: organizerId };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('participants', 'fullName avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark event as completed and award completion points
export const completeEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is organizer
    if (!event.organizer.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only organizer can complete event'
      });
      return;
    }

    if (event.status !== 'ongoing') {
      res.status(400).json({
        success: false,
        message: 'Event must be ongoing to be completed'
      });
      return;
    }

    // Mark event as completed
    event.status = 'completed';
    await event.save();

    // Award completion points to all participants
    if (event.participants.length > 0 && event.pointsForCompletion) {
      const participants = await User.find({ _id: { $in: event.participants } });
      
      for (const participant of participants) {
        participant.totalPoints += event.pointsForCompletion;
        await participant.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Event marked as completed',
      data: {
        participantsCount: event.participants.length,
        pointsAwarded: event.pointsForCompletion || 0
      }
    });

  } catch (error: any) {
    console.error('Complete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
