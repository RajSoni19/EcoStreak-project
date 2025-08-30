import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken, requireUser, requireNGO } from '@/middleware/auth';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  joinEvent,
  leaveEvent,
  deleteEvent,
  getUserEvents,
  getOrganizerEvents
} from '@/controllers/eventController';

const router = Router();

// Validation rules
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  body('location.address')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Address must be between 3 and 200 characters'),
  body('location.city')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('location.state')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('location.country')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('location.isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  body('location.virtualLink')
    .optional()
    .isURL()
    .withMessage('Virtual link must be a valid URL'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max participants must be between 1 and 1000'),
  body('pointsForAttendance')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Points for attendance must be between 0 and 1000'),
  body('pointsForCompletion')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Points for completion must be between 0 and 1000'),
  body('category')
    .isIn(['workshop', 'cleanup', 'tree-planting', 'awareness', 'fundraiser', 'meeting', 'volunteer', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
];

const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  body('location.address')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Address must be between 3 and 200 characters'),
  body('location.city')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('location.state')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('location.country')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('location.isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  body('location.virtualLink')
    .optional()
    .isURL()
    .withMessage('Virtual link must be a valid URL'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max participants must be between 1 and 1000'),
  body('pointsForAttendance')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Points for attendance must be between 0 and 1000'),
  body('pointsForCompletion')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Points for completion must be between 0 and 1000'),
  body('category')
    .optional()
    .isIn(['workshop', 'cleanup', 'tree-planting', 'awareness', 'fundraiser', 'meeting', 'volunteer', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
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
    .isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'education', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
];

// Public routes
router.get('/', queryValidation, validateRequest, getEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', authenticateToken, requireNGO, createEventValidation, validateRequest, createEvent);
router.put('/:id', authenticateToken, requireNGO, updateEventValidation, validateRequest, updateEvent);
router.delete('/:id', authenticateToken, requireNGO, deleteEvent);

// Event participation
router.post('/:id/join', authenticateToken, requireUser, joinEvent);
router.post('/:id/leave', authenticateToken, requireUser, leaveEvent);

// User-specific routes
router.get('/user', authenticateToken, requireUser, getUserEvents);
router.get('/registrations', authenticateToken, requireUser, getUserEvents);
router.get('/organizer/events', authenticateToken, requireNGO, getOrganizerEvents);

export default router;
