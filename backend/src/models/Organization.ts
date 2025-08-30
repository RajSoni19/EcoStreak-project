import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  description: string;
  mission: string;
  focusAreas: string[];
  establishedYear: number;
  legalStatus: string;
  registrationNumber?: string;
  taxId?: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  documents: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    annualReport?: string;
    otherDocuments?: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvalDetails?: {
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    rejectionReason?: string;
    suspendedBy?: mongoose.Types.ObjectId;
    suspendedAt?: Date;
    suspensionReason?: string;
  };
  adminUser: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  mission: {
    type: String,
    required: true,
    maxlength: 500
  },
  focusAreas: [{
    type: String,
    required: true,
    enum: [
      'environmental-conservation',
      'climate-change',
      'renewable-energy',
      'waste-management',
      'water-conservation',
      'biodiversity',
      'sustainable-agriculture',
      'forest-conservation',
      'ocean-conservation',
      'air-quality',
      'education',
      'research',
      'advocacy',
      'community-development',
      'other'
    ]
  }],
  establishedYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  legalStatus: {
    type: String,
    required: true,
    enum: ['registered', 'non-profit', 'charity', 'foundation', 'trust', 'society', 'other']
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    }
  },
  documents: {
    registrationCertificate: String,
    taxExemptionCertificate: String,
    annualReport: String,
    otherDocuments: [String]
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvalDetails: {
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    suspendedAt: Date,
    suspensionReason: String
  },
  adminUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
organizationSchema.index({ status: 1 });
organizationSchema.index({ email: 1 });
organizationSchema.index({ adminUser: 1 });
organizationSchema.index({ createdAt: -1 });

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
