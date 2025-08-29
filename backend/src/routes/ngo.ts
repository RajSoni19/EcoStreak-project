import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, requireNGO } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import {
  getNGODashboard,
  getNGOProfile,
  updateNGOProfile,
  getNGOEvents,
  getNGOCommunities,
  getNGOAnalytics,
  getNGOMembers,
  getNGOStoreProducts,
} from '@/controllers/ngoController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireNGO);

// NGO Dashboard
router.get('/dashboard', getNGODashboard);

// NGO Profile
router.get('/profile', getNGOProfile);
router.put('/profile', [
  body('fullName').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('organizationName').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().isString().trim().isLength({ max: 500 }),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().isString().trim().isLength({ max: 200 }),
  validateRequest,
], updateNGOProfile);

// NGO Events
router.get('/events', [
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOEvents);

// NGO Communities
router.get('/communities', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOCommunities);

// NGO Analytics
router.get('/analytics', [
  query('period').optional().isIn(['week', 'month', 'year']),
  validateRequest,
], getNGOAnalytics);

// NGO Members
router.get('/members', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOMembers);

// NGO Store Products
router.get('/store/products', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOStoreProducts);

export default router;
