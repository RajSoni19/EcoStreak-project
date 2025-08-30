import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '@/models/User';
import { serverConfig } from '@/config/server';

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = serverConfig.jwt.secret;
  if (typeof secret !== 'string') {
    throw new Error('JWT secret is not properly configured');
  }
  // @ts-ignore - JWT v9 type compatibility issue
  return jwt.sign(
    { userId, email, role },
    secret,
    { expiresIn: serverConfig.jwt.expiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  const secret = serverConfig.jwt.secret;
  if (typeof secret !== 'string') {
    throw new Error('JWT secret is not properly configured');
  }
  // @ts-ignore - JWT v9 type compatibility issue
  return jwt.sign(
    { userId, type: 'refresh' },
    secret,
    { expiresIn: serverConfig.jwt.refreshExpiresIn }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Validate NGO role requirements
    if (role === 'ngo' && !organizationName) {
      res.status(400).json({
        success: false,
        message: 'Organization name is required for NGO accounts'
      });
      return;
    }

    // Create new user
    const userData: any = {
      fullName,
      email,
      password,
      role
    };

    if (role === 'ngo') {
      userData.organizationName = organizationName;
    }

    const user = new User(userData);
    await user.save();

    // Generate tokens
    // @ts-ignore - User type from mongoose
    const token = generateToken(user._id.toString(), user.email, user.role);
    // @ts-ignore - User type from mongoose
    const refreshToken = generateRefreshToken(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Update last login and handle daily streak logic
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if this is a new day login
    if (!user.lastStreakDate || user.lastStreakDate < today) {
      // Check if user completed at least one habit yesterday
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      // Import Habit model for checking habit completion
      const { Habit } = await import('@/models/Habit');
      const yesterdayHabits = await Habit.find({
        user: user._id,
        isCompleted: true,
        completedAt: {
          $gte: yesterday,
          $lt: today
        }
      });

      if (yesterdayHabits.length > 0) {
        // Increment streak
        user.currentStreak += 1;
        
        // Update longest streak if current is longer
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        
        // Bonus points for maintaining streak (every 7 days)
        if (user.currentStreak % 7 === 0) {
          user.totalPoints += 25; // Bonus points for weekly streak
        }
        
        // Special bonus for 15+ day streaks (2x multiplier)
        if (user.currentStreak >= 15) {
          user.totalPoints += 50; // Extra bonus for long streaks
        }
      } else {
        // Reset streak if no habits completed yesterday
        user.currentStreak = 0;
      }
      
      user.lastStreakDate = today;
    }
    
    // Check if streak should be reset due to inactivity (2+ days)
    if (user.lastStreakDate) {
      const daysSinceLastStreak = Math.floor((today.getTime() - user.lastStreakDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysSinceLastStreak >= 2) {
        user.currentStreak = 0;
        user.lastStreakDate = today;
      }
    }
    
    user.lastLogin = now;
    await user.save();

    // Generate tokens
    // @ts-ignore - User type from mongoose
    const token = generateToken((user as IUser)._id.toString(), (user as IUser).email, (user as IUser).role);
    // @ts-ignore - User type from mongoose
    const refreshToken = generateRefreshToken((user as IUser)._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken: token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, serverConfig.jwt.secret) as any;
    
    if (decoded.type !== 'refresh') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Generate new tokens
    // @ts-ignore - User type from mongoose
    const newToken = generateToken((user as IUser)._id.toString(), (user as IUser).email, (user as IUser).role);
    // @ts-ignore - User type from mongoose
    const newRefreshToken = generateRefreshToken((user as IUser)._id.toString());

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    } else {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, organizationName } = req.body;
    const updates: any = {};

    if (fullName) updates.fullName = fullName;
    if (organizationName && req.user.role === 'ngo') {
      updates.organizationName = organizationName;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
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

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    
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
