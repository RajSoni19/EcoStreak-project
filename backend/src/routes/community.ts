import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken, requireUser } from '@/middleware/auth';
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity
} from '@/controllers/communityController';

const router = Router();

// Validation rules
const createCommunityValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Community name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('location.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('location.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('location.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('rules')
    .isArray({ min: 0, max: 20 })
    .withMessage('Rules must be an array with maximum 20 items'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const updateCommunityValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Community name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('rules')
    .optional()
    .isArray({ min: 0, max: 20 })
    .withMessage('Rules must be an array with maximum 20 items'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
];

// Routes - Order matters! More specific routes first
router.get('/', queryValidation, validateRequest, getCommunities);
router.post('/', authenticateToken, requireUser, createCommunityValidation, validateRequest, createCommunity);

// Action routes (must come before :id routes)
router.post('/join/:id', authenticateToken, requireUser, joinCommunity);
router.post('/leave/:id', authenticateToken, requireUser, leaveCommunity);

// ID-based routes (must come last)
router.get('/:id', authenticateToken, getCommunityById);
router.put('/:id', authenticateToken, requireUser, updateCommunityValidation, validateRequest, updateCommunity);
router.delete('/:id', authenticateToken, requireUser, deleteCommunity);

export default router;
