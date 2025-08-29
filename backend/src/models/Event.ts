import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  community?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number];
    isVirtual: boolean;
    virtualLink?: string;
  };
  category: string;
  tags: string[];
  image?: string;
  maxParticipants?: number;
  participants: mongoose.Types.ObjectId[];
  // Points system for events
  pointsForAttendance: number; // Points given for attending
  pointsForCompletion: number; // Points given for completing the event
  isPublic: boolean;
  isActive: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required'],
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v: number[]) {
          return !v || (v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90);
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]',
      },
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    virtualLink: {
      type: String,
      required: function(this: IEvent) {
        return this.location.isVirtual;
      },
    },
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['workshop', 'cleanup', 'tree-planting', 'awareness', 'fundraiser', 'meeting', 'volunteer', 'other'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  image: {
    type: String,
    default: '',
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1'],
  },

  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Points system for events
  pointsForAttendance: {
    type: Number,
    default: 10,
    min: [0, 'Points for attendance cannot be negative'],
  },
  pointsForCompletion: {
    type: Number,
    default: 50,
    min: [0, 'Points for completion cannot be negative'],
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ community: 1 });
eventSchema.index({ status: 1, isActive: 1 });
eventSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });

// Virtual for current participants count
eventSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

// Pre-save middleware to update status
eventSchema.pre('save', function(next) {
  const now = new Date();
  if (this.startDate <= now && this.endDate >= now) {
    this.status = 'ongoing';
  } else if (this.endDate < now) {
    this.status = 'completed';
  }
  
  next();
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);
