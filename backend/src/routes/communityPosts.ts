import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireUser } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import {
  createPost,
  getCommunityPosts,
  getPost,
  toggleLike,
  appreciatePost,
  updatePost,
  deletePost,
  getUserPosts,
} from '@/controllers/communityPostController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireUser);

// Create a new post
router.post('/', [
  body('communityId').isMongoId().withMessage('Valid community ID is required'),
  body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']).withMessage('Invalid category'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  validateRequest,
], createPost);

// Get posts for a community
router.get('/community/:communityId', [
  param('communityId').isMongoId().withMessage('Valid community ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']).withMessage('Invalid category'),
  validateRequest,
], getCommunityPosts);

// Get a single post
router.get('/:postId', [
  param('postId').isMongoId().withMessage('Valid post ID is required'),
  validateRequest,
], getPost);

// Like/Unlike a post
router.post('/:postId/like', [
  param('postId').isMongoId().withMessage('Valid post ID is required'),
  validateRequest,
], toggleLike);

// Appreciate a post with points
router.post('/:postId/appreciate', [
  param('postId').isMongoId().withMessage('Valid post ID is required'),
  body('points').isInt({ min: 1, max: 100 }).withMessage('Points must be between 1 and 100'),
  body('message').optional().isString().trim().isLength({ max: 200 }).withMessage('Message cannot exceed 200 characters'),
  validateRequest,
], appreciatePost);

// Update a post
router.put('/:postId', [
  param('postId').isMongoId().withMessage('Valid post ID is required'),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().isString().trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']).withMessage('Invalid category'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  validateRequest,
], updatePost);

// Delete a post
router.delete('/:postId', [
  param('postId').isMongoId().withMessage('Valid post ID is required'),
  validateRequest,
], deletePost);

// Get user's posts
router.get('/user/:userId', [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validateRequest,
], getUserPosts);

export default router;
