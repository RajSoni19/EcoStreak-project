import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isActive: boolean;
  startDate: Date;
  lastCompleted?: Date;
  reminders: {
    enabled: boolean;
    time: string; // HH:MM format
    days: string[]; // ['monday', 'tuesday', etc.]
  };
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Habit title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Habit category is required'],
    enum: ['waste-reduction', 'energy-conservation', 'water-conservation', 'transportation', 'food-sustainability', 'shopping', 'other'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: [true, 'Frequency is required'],
  },
  target: {
    type: Number,
    required: [true, 'Target is required'],
    min: [1, 'Target must be at least 1'],
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  totalCompletions: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  lastCompleted: {
    type: Date,
  },
  reminders: {
    enabled: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
habitSchema.index({ user: 1 });
habitSchema.index({ category: 1 });
habitSchema.index({ isActive: 1 });
habitSchema.index({ user: 1, isActive: 1 });

// Virtual for completion rate
habitSchema.virtual('completionRate').get(function() {
  if (!this.startDate) return 0;
  
  const daysSinceStart = Math.ceil((Date.now() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedCompletions = this.frequency === 'daily' ? daysSinceStart : 
                              this.frequency === 'weekly' ? Math.ceil(daysSinceStart / 7) : 
                              Math.ceil(daysSinceStart / 30);
  
  return expectedCompletions > 0 ? (this.totalCompletions / expectedCompletions) * 100 : 0;
});

// Virtual for days since last completion
habitSchema.virtual('daysSinceLastCompletion').get(function() {
  if (!this.lastCompleted) return null;
  return Math.ceil((Date.now() - this.lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
});

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
