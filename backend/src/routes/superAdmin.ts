import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import {
  getSuperAdminDashboard,
  getAllOrganizations,
  getOrganizationDetails,
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  reactivateOrganization,
  getPlatformAnalytics,
  getAllUsers,
  updateUserStatus,
} from '@/controllers/superAdminController';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Super Admin Dashboard
router.get('/dashboard', getSuperAdminDashboard);

// Platform Analytics
router.get('/analytics', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  validateRequest,
], getPlatformAnalytics);

// Organization Management
router.get('/organizations', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'suspended']),
  query('search').optional().isString().trim(),
  query('focusArea').optional().isString().trim(),
  query('sortBy').optional().isIn(['createdAt', 'name', 'status', 'establishedYear']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  validateRequest,
], getAllOrganizations);

router.get('/organizations/:organizationId', [
  query('organizationId').isMongoId().withMessage('Invalid organization ID'),
  validateRequest,
], getOrganizationDetails);

router.post('/organizations/:organizationId/approve', [
  body('approvalNotes').optional().isString().trim().isLength({ max: 500 }),
  validateRequest,
], approveOrganization);

router.post('/organizations/:organizationId/reject', [
  body('rejectionReason').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Rejection reason must be between 10 and 1000 characters'),
  validateRequest,
], rejectOrganization);

router.post('/organizations/:organizationId/suspend', [
  body('suspensionReason').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Suspension reason must be between 10 and 1000 characters'),
  validateRequest,
], suspendOrganization);

router.post('/organizations/:organizationId/reactivate', reactivateOrganization);

// User Management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'ngo', 'admin']),
  query('search').optional().isString().trim(),
  query('isActive').optional().isBoolean(),
  query('sortBy').optional().isIn(['createdAt', 'fullName', 'email', 'role']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  validateRequest,
], getAllUsers);

router.put('/users/:userId/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
  validateRequest,
], updateUserStatus);

export default router;
