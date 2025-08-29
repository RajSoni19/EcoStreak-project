import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken, requireUser } from '@/middleware/auth';
import {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  completeHabit,
  deleteHabit,
  getHabitStats
} from '@/controllers/habitController';

const router = Router();

// Validation rules
const createHabitValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Habit title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['recycling', 'energy-conservation', 'water-conservation', 'sustainable-transport', 'waste-reduction', 'sustainable-shopping', 'biodiversity', 'other'])
    .withMessage('Invalid category'),
  body('points')
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  body('frequency')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('reminderTime')
    .optional()
    .isISO8601()
    .withMessage('Reminder time must be a valid ISO date'),
];

const updateHabitValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Habit title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['recycling', 'energy-conservation', 'water-conservation', 'sustainable-transport', 'waste-reduction', 'sustainable-shopping', 'biodiversity', 'other'])
    .withMessage('Invalid category'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('reminderTime')
    .optional()
    .isISO8601()
    .withMessage('Reminder time must be a valid ISO date'),
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['recycling', 'energy-conservation', 'water-conservation', 'sustainable-transport', 'waste-reduction', 'sustainable-shopping', 'biodiversity', 'other'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'completed'])
    .withMessage('Invalid status'),
];

// All routes require authentication
router.use(authenticateToken);
router.use(requireUser);

// Habit management
router.post('/', createHabitValidation, validateRequest, createHabit);
router.get('/', queryValidation, validateRequest, getUserHabits);
router.get('/stats', getHabitStats);
router.get('/:id', getHabitById);
router.put('/:id', updateHabitValidation, validateRequest, updateHabit);
router.delete('/:id', deleteHabit);

// Habit completion
router.post('/:id/complete', completeHabit);

export default router;
