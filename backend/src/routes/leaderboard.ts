import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import {
  getGlobalLeaderboard,
  getCommunityLeaderboard,
  getUserRank,
  getTopPerformers,
  getLeaderboardStats
} from '@/controllers/leaderboardController';

const router = Router();

// Validation rules
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('timeframe')
    .optional()
    .isIn(['all', 'week', 'month'])
    .withMessage('Invalid timeframe'),
  query('category')
    .optional()
    .isIn(['points', 'habits', 'events'])
    .withMessage('Invalid category'),
];

// Public routes
router.get('/global', queryValidation, validateRequest, getGlobalLeaderboard);
router.get('/stats', getLeaderboardStats);
router.get('/top', queryValidation, validateRequest, getTopPerformers);

// Protected routes
router.get('/user/rank', authenticateToken, getUserRank);
router.get('/community/:communityId', authenticateToken, queryValidation, validateRequest, getCommunityLeaderboard);

export default router;
