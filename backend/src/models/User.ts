import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'ngo' | 'admin';
  organizationName?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  organizationApproved?: boolean;
  deactivationReason?: string;
  lastLogin?: Date;
  // NGO-specific fields
  bio?: string;
  website?: string;
  phone?: string;
  address?: string;
  // Streak and points system
  currentStreak: number;
  longestStreak: number;
  lastStreakDate?: Date;
  totalPoints: number;
  pointsGiven: number; // Points given to other users
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'ngo', 'admin'],
    default: 'user',
  },
  organizationName: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'ngo';
    },
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  organizationApproved: {
    type: Boolean,
    default: false,
  },
  deactivationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Deactivation reason cannot exceed 500 characters'],
  },
  lastLogin: {
    type: Date,
  },
  // NGO-specific fields
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please enter a valid URL'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/, 'Please enter a valid phone number'],
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters'],
  },
  // Streak and points system
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastStreakDate: {
    type: Date,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  pointsGiven: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

  // Hash password before saving
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
      const salt = await bcrypt.genSalt(12);
      (this as any).password = await bcrypt.hash((this as any).password, salt);
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  // Compare password method
  userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, (this as any).password);
    } catch (error) {
      return false;
    }
  };

  // Virtual for user display name
  userSchema.virtual('displayName').get(function() {
    return (this as any).organizationName || (this as any).fullName;
  });

export const User = mongoose.model<IUser>('User', userSchema);
