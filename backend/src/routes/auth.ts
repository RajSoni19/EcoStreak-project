import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} from '@/controllers/authController';

const router = Router();

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['user', 'ngo', 'admin'])
    .withMessage('Role must be user, ngo, or admin'),
  body('organizationName')
    .if(body('role').equals('ngo'))
    .notEmpty()
    .withMessage('Organization name is required for NGO accounts')
    .isLength({ max: 200 })
    .withMessage('Organization name cannot exceed 200 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('organizationName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name cannot exceed 200 characters'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/refresh-token', refreshTokenValidation, validateRequest, refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, validateRequest, changePassword);

export default router;
