import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  logo?: string;
  banner?: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  // Product-specific fields
  price: number;
  pointsCost: number;
  stock: number;
  seller: mongoose.Types.ObjectId;
  // Optional location and contact for products
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number];
  };
  contact?: {
    email: string;
    phone?: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Store description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store owner is required'],
  },
  category: {
    type: String,
    required: [true, 'Store category is required'],
    enum: ['eco-friendly', 'sustainable', 'renewable', 'organic', 'recycled', 'energy-efficient', 'water-saving', 'other'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  logo: {
    type: String,
    default: '',
  },
  banner: {
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
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  // Product-specific fields
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  pointsCost: {
    type: Number,
    required: [true, 'Points cost is required'],
    min: [0, 'Points cost cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
  },
  // Optional location and contact
  location: {
    address: {
      type: String,
      trim: true,
      required: false,
    },
    city: {
      type: String,
      trim: true,
      required: false,
    },
    state: {
      type: String,
      trim: true,
      required: false,
    },
    country: {
      type: String,
      trim: true,
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      validate: {
        validator: function(v: number[]) {
          if (v.length !== 2) return false;
          const [lon, lat] = v;
          return lon !== undefined && lat !== undefined && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]',
      },
    },
  },
  contact: {
    email: {
      type: String,
      trim: true,
      required: false,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    website: {
      type: String,
      trim: true,
      required: false,
    },
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
storeSchema.index({ name: 'text', description: 'text', tags: 'text' });
storeSchema.index({ category: 1 });
storeSchema.index({ owner: 1 });
storeSchema.index({ isVerified: 1, isActive: 1 });
storeSchema.index({ rating: -1 });
storeSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });

export const Store = mongoose.model<IStore>('Store', storeSchema);
