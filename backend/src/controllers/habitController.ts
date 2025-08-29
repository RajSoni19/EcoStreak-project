import { Request, Response } from 'express';
import { Habit } from '@/models/Habit';
import { User } from '@/models/User';

export const createHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, points, frequency, reminderTime } = req.body;
    
    const habit = new Habit({
      title,
      description,
      category,
      points,
      frequency,
      reminderTime,
      user: req.user._id,
      streak: 0,
      totalCompletions: 0,
      lastCompleted: null,
    });

    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: { habit }
    });

  } catch (error: any) {
    console.error('Create habit error:', error);
    
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

export const getUserHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, category, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { user: userId };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const habits = await Habit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Habit.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        habits,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get user habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getHabitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: id, user: userId });

    if (!habit) {
      res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { habit }
    });

  } catch (error: any) {
    console.error('Get habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const habit = await Habit.findOne({ _id: id, user: userId });
    
    if (!habit) {
      res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
      return;
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: { habit: updatedHabit }
    });

  } catch (error: any) {
    console.error('Update habit error:', error);
    
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

export const completeHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: id, user: userId });
    
    if (!habit) {
      res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already completed today
    if (habit.lastCompleted && 
        new Date(habit.lastCompleted.getFullYear(), habit.lastCompleted.getMonth(), habit.lastCompleted.getDate()).getTime() === today.getTime()) {
      res.status(400).json({
        success: false,
        message: 'Habit already completed today'
      });
      return;
    }

    // Update streak and completions
    habit.totalCompletions += 1;
    habit.lastCompleted = now;

    // Check if streak should continue
    if (habit.lastCompleted) {
      const lastCompletedDate = new Date(habit.lastCompleted.getFullYear(), habit.lastCompleted.getMonth(), habit.lastCompleted.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      if (lastCompletedDate.getTime() === yesterday.getTime()) {
        habit.streak += 1;
      } else if (lastCompletedDate.getTime() !== today.getTime()) {
        habit.streak = 1; // Reset streak if more than 1 day gap
      }
    } else {
      habit.streak = 1; // First completion
    }

    await habit.save();

    // Award points to user
    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + habit.points;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Habit completed successfully',
      data: { 
        habit,
        pointsEarned: habit.points,
        newTotalPoints: user?.points || 0
      }
    });

  } catch (error: any) {
    console.error('Complete habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const habit = await Habit.findOne({ _id: id, user: userId });
    
    if (!habit) {
      res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
      return;
    }

    await Habit.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getHabitStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const stats = await Habit.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalHabits: { $sum: 1 },
          totalCompletions: { $sum: '$totalCompletions' },
          totalPoints: { $sum: '$points' },
          averageStreak: { $avg: '$streak' },
          maxStreak: { $max: '$streak' }
        }
      }
    ]);

    const todayCompletions = await Habit.countDocuments({
      user: userId,
      lastCompleted: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const weeklyStats = await Habit.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%U', date: '$lastCompleted' }
          },
          completions: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 4 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalHabits: 0,
          totalCompletions: 0,
          totalPoints: 0,
          averageStreak: 0,
          maxStreak: 0
        },
        todayCompletions,
        weeklyStats
      }
    });

  } catch (error: any) {
    console.error('Get habit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
