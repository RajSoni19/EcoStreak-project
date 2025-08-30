import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import {
  registerOrganization,
  getOrganizationStatus,
  updateOrganization,
  getOrganizationProfile
} from '@/controllers/organizationController';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', [
  // Organization details validation
  body('name').isString().trim().isLength({ min: 2, max: 200 }).withMessage('Organization name must be between 2 and 200 characters'),
  body('email').isEmail().withMessage('Valid organization email is required'),
  body('phone').optional().isString().trim().withMessage('Phone must be a string'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  
  // Address validation
  body('address.street').isString().trim().isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
  body('address.city').isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('address.state').isString().trim().isLength({ min: 2, max: 100 }).withMessage('State must be between 2 and 100 characters'),
  body('address.country').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),
  body('address.zipCode').optional().isString().trim().withMessage('Zip code must be a string'),
  
  // Organization details
  body('description').isString().trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('mission').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Mission must be between 10 and 500 characters'),
  body('focusAreas').isArray({ min: 1 }).withMessage('At least one focus area is required'),
  body('focusAreas.*').isIn([
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
  ]).withMessage('Invalid focus area'),
  body('establishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid establishment year is required'),
  body('legalStatus').isIn(['registered', 'non-profit', 'charity', 'foundation', 'trust', 'society', 'other']).withMessage('Invalid legal status'),
  body('registrationNumber').optional().isString().trim().withMessage('Registration number must be a string'),
  body('taxId').optional().isString().trim().withMessage('Tax ID must be a string'),
  
  // Contact person validation
  body('contactPerson.name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Contact person name must be between 2 and 100 characters'),
  body('contactPerson.email').isEmail().withMessage('Valid contact person email is required'),
  body('contactPerson.phone').isString().trim().withMessage('Contact person phone is required'),
  body('contactPerson.position').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Contact person position must be between 2 and 100 characters'),
  
  // Documents (optional)
  body('documents.registrationCertificate').optional().isString().withMessage('Registration certificate must be a string'),
  body('documents.taxExemptionCertificate').optional().isString().withMessage('Tax exemption certificate must be a string'),
  body('documents.annualReport').optional().isString().withMessage('Annual report must be a string'),
  body('documents.otherDocuments').optional().isArray().withMessage('Other documents must be an array'),
  body('documents.otherDocuments.*').optional().isString().withMessage('Other document must be a string'),
  
  // Admin user validation
  body('adminFullName').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Admin full name must be between 2 and 100 characters'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required'),
  body('adminPassword').isString().isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  body('adminPhone').isString().trim().withMessage('Admin phone is required'),
  
  validateRequest,
], registerOrganization);

router.get('/status/:email', getOrganizationStatus);

// Protected routes (require authentication)
router.get('/profile/:organizationId', getOrganizationProfile);
router.put('/profile/:organizationId', [
  body('phone').optional().isString().trim().withMessage('Phone must be a string'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('address.street').optional().isString().trim().isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
  body('address.city').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('address.state').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('State must be between 2 and 100 characters'),
  body('address.country').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters'),
  body('address.zipCode').optional().isString().trim().withMessage('Zip code must be a string'),
  body('description').optional().isString().trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('mission').optional().isString().trim().isLength({ min: 10, max: 500 }).withMessage('Mission must be between 10 and 500 characters'),
  body('focusAreas').optional().isArray({ min: 1 }).withMessage('At least one focus area is required'),
  body('focusAreas.*').optional().isIn([
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
  ]).withMessage('Invalid focus area'),
  body('registrationNumber').optional().isString().trim().withMessage('Registration number must be a string'),
  body('taxId').optional().isString().trim().withMessage('Tax ID must be a string'),
  body('contactPerson.name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Contact person name must be between 2 and 100 characters'),
  body('contactPerson.email').optional().isEmail().withMessage('Valid contact person email is required'),
  body('contactPerson.phone').optional().isString().trim().withMessage('Contact person phone is required'),
  body('contactPerson.position').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Contact person position must be between 2 and 100 characters'),
  body('documents.registrationCertificate').optional().isString().withMessage('Registration certificate must be a string'),
  body('documents.taxExemptionCertificate').optional().isString().withMessage('Tax exemption certificate must be a string'),
  body('documents.annualReport').optional().isString().withMessage('Annual report must be a string'),
  body('documents.otherDocuments').optional().isArray().withMessage('Other documents must be an array'),
  body('documents.otherDocuments.*').optional().isString().withMessage('Other document must be a string'),
  validateRequest,
], updateOrganization);

export default router;
