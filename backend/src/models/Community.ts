import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  category: string;
  tags: string[];
  image?: string;
  isPublic: boolean;
  location?: {
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  rules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Community description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Community creator is required'],
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  category: {
    type: String,
    required: [true, 'Community category is required'],
    enum: ['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other'],
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
  isPublic: {
    type: Boolean,
    default: true,
  },
  location: {
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v: number[] | undefined) {
          if (!v) return true; // Allow undefined
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]',
      },
    },
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: [200, 'Rule cannot exceed 200 characters'],
  }],
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
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ category: 1 });
communitySchema.index({ location: 1 });
communitySchema.index({ isPublic: 1, isActive: 1 });
communitySchema.index({ creator: 1 });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

export const Community = mongoose.model<ICommunity>('Community', communitySchema);
