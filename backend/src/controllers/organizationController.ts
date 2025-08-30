import { Request, Response } from 'express';
import { User } from '@/models/User';
import { Organization } from '@/models/Organization';

// Register new organization
export const registerOrganization = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      address,
      description,
      mission,
      focusAreas,
      establishedYear,
      legalStatus,
      registrationNumber,
      taxId,
      contactPerson,
      documents,
      // Admin user details
      adminFullName,
      adminEmail,
      adminPassword,
      adminPhone
    } = req.body;

    // Check if organization email already exists
    const existingOrganization = await Organization.findOne({ email });
    if (existingOrganization) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user with this email already exists'
      });
    }

    // Create admin user first (password will be hashed by the User model pre-save hook)
    const adminUser = new User({
      fullName: adminFullName,
      email: adminEmail,
      password: adminPassword, // Don't hash here - the User model will handle it
      role: 'ngo',
      organizationName: name,
      phone: adminPhone,
      isActive: false, // Will be activated after approval
      organizationApproved: false
    });

    await adminUser.save();

    // Create organization
    const organization = new Organization({
      name,
      email,
      phone,
      website,
      address,
      description,
      mission,
      focusAreas,
      establishedYear,
      legalStatus,
      registrationNumber,
      taxId,
      contactPerson,
      documents,
      adminUser: adminUser._id,
      status: 'pending'
    });

    await organization.save();

    return res.status(201).json({
      success: true,
      message: 'Organization registration submitted successfully. Please wait for admin approval.',
      data: {
        organizationId: organization._id,
        status: 'pending'
      }
    });

  } catch (error: any) {
    console.error('Organization registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to register organization',
      error: error.message
    });
  }
};

// Get organization status (for checking approval status)
export const getOrganizationStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const organization = await Organization.findOne({ email })
      .populate('adminUser', 'fullName email organizationName');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    return res.json({
      success: true,
      data: {
        organizationId: organization._id,
        name: organization.name,
        status: organization.status,
        adminUser: organization.adminUser,
        createdAt: organization.createdAt,
        approvalDetails: organization.approvalDetails
      }
    });

  } catch (error: any) {
    console.error('Error getting organization status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get organization status',
      error: error.message
    });
  }
};

// Update organization details (for approved organizations)
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const organizationId = req.params.organizationId;
    const updateData = req.body;

    // Verify user is the organization admin
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (organization.adminUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only organization admin can update details.'
      });
    }

    if (organization.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Organization must be approved to update details'
      });
    }

    // Remove fields that shouldn't be updated
    const allowedFields = [
      'phone', 'website', 'address', 'description', 'mission',
      'focusAreas', 'registrationNumber', 'taxId', 'contactPerson', 'documents'
    ];

    const filteredUpdateData: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      filteredUpdateData,
      { new: true, runValidators: true }
    ).populate('adminUser', 'fullName email organizationName');

    return res.json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrganization
    });

  } catch (error: any) {
    console.error('Error updating organization:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// Get organization profile (for approved organizations)
export const getOrganizationProfile = async (req: Request, res: Response) => {
  try {
    const organizationId = req.params.organizationId;

    const organization = await Organization.findById(organizationId)
      .populate('adminUser', 'fullName email organizationName phone');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user has access to this organization
    if (organization.adminUser._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.json({
      success: true,
      data: organization
    });

  } catch (error: any) {
    console.error('Error getting organization profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get organization profile',
      error: error.message
    });
  }
};
