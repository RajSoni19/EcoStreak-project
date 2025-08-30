import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, requireNGO } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import {
  getNGODashboard,
  getNGODashboardExtended,
  getNGOProfile,
  updateNGOProfile,
  getNGOEvents,
  createNGOEvent,
  updateNGOEvent,
  deleteNGOEvent,
  getNGOEventDetails,
  getNGOCommunities,
  createNGOCommunity,
  updateNGOCommunity,
  deleteNGOCommunity,
  getNGOAnalytics,
  getNGOMembers,
  getNGOStoreProducts,
  createNGOStoreProduct,
  updateNGOStoreProduct,
  deleteNGOStoreProduct,
  getNGOEventParticipants,
  awardPointsToParticipants,
  getNGOCommunityPosts,
  createNGOCommunityPost,
  updateNGOCommunityPost,
  deleteNGOCommunityPost,
  getNGOCommunityEngagement,
  manageNGOCommunityMembers,
  createNGOReward,
  getNGORewards,
  updateNGOReward,
  deleteNGOReward,
  getNGOUserPointsAnalytics,
  awardPointsToUsers,
  createNGONotification,
  getNGONotifications,
  getNGONotificationAnalytics,
} from '@/controllers/ngoController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireNGO);

// NGO Dashboard
router.get('/dashboard', getNGODashboard);

// NGO Dashboard Extended
router.get('/dashboard/extended', getNGODashboardExtended);

// NGO Profile
router.get('/profile', getNGOProfile);
router.put('/profile', [
  body('fullName').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('organizationName').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().isString().trim().isLength({ max: 500 }),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
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

router.post('/events', [
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('location.address').isString().trim().notEmpty().withMessage('Address is required'),
  body('location.city').isString().trim().notEmpty().withMessage('City is required'),
  body('location.state').isString().trim().notEmpty().withMessage('State is required'),
  body('location.country').isString().trim().notEmpty().withMessage('Country is required'),
  body('category').isIn(['workshop', 'cleanup', 'tree-planting', 'awareness', 'fundraiser', 'meeting', 'volunteer', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('pointsForAttendance').optional().isInt({ min: 0 }).withMessage('Points for attendance cannot be negative'),
  body('pointsForCompletion').optional().isInt({ min: 0 }).withMessage('Points for completion cannot be negative'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('community').optional().isMongoId().withMessage('Invalid community ID'),
  validateRequest,
], createNGOEvent);

router.get('/events/:eventId', getNGOEventDetails);

router.put('/events/:eventId', [
  body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description').optional().isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('location.address').optional().isString().trim().notEmpty().withMessage('Address cannot be empty'),
  body('location.city').optional().isString().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().isString().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.country').optional().isString().trim().notEmpty().withMessage('Country cannot be empty'),
  body('category').optional().isIn(['workshop', 'cleanup', 'tree-planting', 'awareness', 'fundraiser', 'meeting', 'volunteer', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('pointsForAttendance').optional().isInt({ min: 0 }).withMessage('Points for attendance cannot be negative'),
  body('pointsForCompletion').optional().isInt({ min: 0 }).withMessage('Points for completion cannot be negative'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('community').optional().isMongoId().withMessage('Invalid community ID'),
  validateRequest,
], updateNGOEvent);

router.delete('/events/:eventId', deleteNGOEvent);

// NGO Event Participants
router.get('/events/:eventId/participants', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOEventParticipants);

router.post('/events/:eventId/award-points', [
  body('participantIds').isArray({ min: 1 }).withMessage('At least one participant ID is required'),
  body('participantIds.*').isMongoId().withMessage('Invalid participant ID'),
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('reason').optional().isString().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters'),
  validateRequest,
], awardPointsToParticipants);

// NGO Communities
router.get('/communities', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
], getNGOCommunities);

router.post('/communities', [
  body('name').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Community name must be between 3 and 100 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('location.city').optional().isString().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().isString().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.country').optional().isString().trim().notEmpty().withMessage('Country cannot be empty'),
  body('rules').optional().isArray().withMessage('Rules must be an array'),
  validateRequest,
], createNGOCommunity);

router.put('/communities/:communityId', [
  body('name').optional().isString().trim().isLength({ min: 3, max: 100 }).withMessage('Community name must be between 3 and 100 characters'),
  body('description').optional().isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['environmental', 'sustainability', 'conservation', 'renewable-energy', 'waste-reduction', 'biodiversity', 'climate-action', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('location.city').optional().isString().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().isString().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.country').optional().isString().trim().notEmpty().withMessage('Country cannot be empty'),
  body('rules').optional().isArray().withMessage('Rules must be an array'),
  validateRequest,
], updateNGOCommunity);

router.delete('/communities/:communityId', deleteNGOCommunity);

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

router.post('/store/products', [
  body('name').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['eco-products', 'sustainable-fashion', 'organic-food', 'renewable-energy', 'zero-waste', 'fair-trade', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pointsCost').isInt({ min: 0 }).withMessage('Points cost must be a non-negative integer'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('location.address').isString().trim().notEmpty().withMessage('Address is required'),
  body('location.city').isString().trim().notEmpty().withMessage('City is required'),
  body('location.state').isString().trim().notEmpty().withMessage('State is required'),
  body('location.country').isString().trim().notEmpty().withMessage('Country is required'),
  body('contact.email').isEmail().withMessage('Valid contact email is required'),
  body('contact.phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('contact.website').optional().isURL().withMessage('Invalid website URL'),
  body('socialMedia.facebook').optional().isURL().withMessage('Invalid Facebook URL'),
  body('socialMedia.instagram').optional().isURL().withMessage('Invalid Instagram URL'),
  body('socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  validateRequest,
], createNGOStoreProduct);

router.put('/store/products/:productId', [
  body('name').optional().isString().trim().isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
  body('description').optional().isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['eco-products', 'sustainable-fashion', 'organic-food', 'renewable-energy', 'zero-waste', 'fair-trade', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pointsCost').optional().isInt({ min: 0 }).withMessage('Points cost must be a non-negative integer'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('location.address').optional().isString().trim().notEmpty().withMessage('Address cannot be empty'),
  body('location.city').optional().isString().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().isString().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.country').optional().isString().trim().notEmpty().withMessage('Country cannot be empty'),
  body('contact.email').optional().isEmail().withMessage('Valid contact email is required'),
  body('contact.phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('contact.website').optional().isURL().withMessage('Invalid website URL'),
  body('socialMedia.facebook').optional().isURL().withMessage('Invalid Facebook URL'),
  body('socialMedia.instagram').optional().isURL().withMessage('Invalid Instagram URL'),
  body('socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  validateRequest,
], updateNGOStoreProduct);

router.delete('/store/products/:productId', deleteNGOStoreProduct);

// NGO Community Posts
router.get('/community-posts', [
  query('communityId').optional().isMongoId().withMessage('Invalid community ID'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']),
  validateRequest,
], getNGOCommunityPosts);

router.post('/community-posts', [
  body('communityId').isMongoId().withMessage('Valid community ID is required'),
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('content').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']),
  validateRequest,
], createNGOCommunityPost);

router.put('/community-posts/:postId', [
  body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('content').optional().isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('category').optional().isIn(['achievement', 'idea', 'question', 'event', 'general']),
  validateRequest,
], updateNGOCommunityPost);

router.delete('/community-posts/:postId', deleteNGOCommunityPost);

// NGO Community Engagement Analytics
router.get('/community-engagement', [
  query('period').optional().isIn(['week', 'month', 'year']),
  validateRequest,
], getNGOCommunityEngagement);

// NGO Community Member Management
router.post('/communities/:communityId/members', [
  body('action').isIn(['add_member', 'remove_member', 'add_moderator', 'remove_moderator']).withMessage('Invalid action'),
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  validateRequest,
], manageNGOCommunityMembers);

// NGO Rewards Management
router.get('/rewards', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isActive').optional().isIn(['true', 'false']),
  validateRequest,
], getNGORewards);

router.post('/rewards', [
  body('name').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Reward name must be between 3 and 100 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pointsCost').isInt({ min: 1 }).withMessage('Points cost must be at least 1'),
  body('category').optional().isIn(['eco-products', 'sustainable-fashion', 'organic-food', 'renewable-energy', 'zero-waste', 'fair-trade', 'other']),
  body('image').optional().isString().trim().isURL().withMessage('Invalid image URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('maxRedemptions').optional().isInt({ min: -1 }).withMessage('Max redemptions must be -1 (unlimited) or a positive number'),
  validateRequest,
], createNGOReward);

router.put('/rewards/:rewardId', [
  body('name').optional().isString().trim().isLength({ min: 3, max: 100 }).withMessage('Reward name must be between 3 and 100 characters'),
  body('description').optional().isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pointsCost').optional().isInt({ min: 1 }).withMessage('Points cost must be at least 1'),
  body('category').optional().isIn(['eco-products', 'sustainable-fashion', 'organic-food', 'renewable-energy', 'zero-waste', 'fair-trade', 'other']),
  body('image').optional().isString().trim().isURL().withMessage('Invalid image URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('maxRedemptions').optional().isInt({ min: -1 }).withMessage('Max redemptions must be -1 (unlimited) or a positive number'),
  validateRequest,
], updateNGOReward);

router.delete('/rewards/:rewardId', deleteNGOReward);

// NGO User Points Analytics
router.get('/user-points-analytics', [
  query('period').optional().isIn(['week', 'month', 'year']),
  validateRequest,
], getNGOUserPointsAnalytics);

// Award Points to Users
router.post('/award-points', [
  body('userIds').isArray({ min: 1 }).withMessage('At least one user ID is required'),
  body('userIds.*').isMongoId().withMessage('Invalid user ID'),
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('reason').optional().isString().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters'),
  body('eventId').optional().isMongoId().withMessage('Invalid event ID'),
  validateRequest,
], awardPointsToUsers);

// NGO Notifications
router.get('/notifications', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['event_reminder', 'community_update', 'achievement', 'general']),
  query('status').optional().isIn(['sent', 'read', 'failed']),
  validateRequest,
], getNGONotifications);

router.post('/notifications', [
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('message').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('type').isIn(['event_reminder', 'community_update', 'achievement', 'general']).withMessage('Invalid notification type'),
  body('targetUsers').optional().isArray().withMessage('Target users must be an array'),
  body('targetUsers.*').optional().isMongoId().withMessage('Invalid user ID'),
  body('communityId').optional().isMongoId().withMessage('Invalid community ID'),
  body('eventId').optional().isMongoId().withMessage('Invalid event ID'),
  body('isUrgent').optional().isBoolean().withMessage('isUrgent must be a boolean'),
  body('scheduledFor').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
  validateRequest,
], createNGONotification);

// NGO Notification Analytics
router.get('/notification-analytics', [
  query('period').optional().isIn(['week', 'month', 'year']),
  validateRequest,
], getNGONotificationAnalytics);

export default router;
