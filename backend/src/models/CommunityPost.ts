import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  title: string;
  content: string;
  images?: string[];
  category: 'achievement' | 'idea' | 'question' | 'event' | 'general';
  likes: mongoose.Types.ObjectId[];
  appreciations: {
    user: mongoose.Types.ObjectId;
    points: number;
    message?: string;
    createdAt: Date;
  }[];
  totalAppreciationPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author is required'],
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'Community is required'],
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Post title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot exceed 2000 characters'],
  },
  images: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['achievement', 'idea', 'question', 'event', 'general'],
    default: 'general',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  appreciations: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: [1, 'Appreciation points must be at least 1'],
      max: [100, 'Appreciation points cannot exceed 100'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Appreciation message cannot exceed 200 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalAppreciationPoints: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
communityPostSchema.index({ community: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ 'appreciations.user': 1 });

// Virtual for total likes count
communityPostSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for total appreciations count
communityPostSchema.virtual('appreciationsCount').get(function() {
  return this.appreciations.length;
});

// Pre-save middleware to calculate total appreciation points
communityPostSchema.pre('save', function(next) {
  this.totalAppreciationPoints = this.appreciations.reduce((total, app) => total + app.points, 0);
  next();
});

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
