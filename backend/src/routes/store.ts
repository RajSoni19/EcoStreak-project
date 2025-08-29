import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '@/middleware/validation';
import { authenticateToken, requireUser, requireNGO } from '@/middleware/auth';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  purchaseProduct,
  getSellerProducts,
  getCategories
} from '@/controllers/storeController';

const router = Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['eco-friendly', 'sustainable', 'renewable', 'organic', 'recycled', 'energy-efficient', 'water-saving', 'other'])
    .withMessage('Invalid category'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('pointsCost')
    .isInt({ min: 0 })
    .withMessage('Points cost must be a non-negative integer'),
  body('ecoRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Eco rating must be between 1 and 5'),
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['eco-friendly', 'sustainable', 'renewable', 'organic', 'recycled', 'energy-efficient', 'water-saving', 'other'])
    .withMessage('Invalid category'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('pointsCost')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points cost must be a non-negative integer'),
  body('ecoRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Eco rating must be between 1 and 5'),
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
    .isIn(['eco-friendly', 'sustainable', 'renewable', 'organic', 'recycled', 'energy-efficient', 'water-saving', 'other'])
    .withMessage('Invalid category'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('sortBy')
    .optional()
    .isIn(['price', 'createdAt', 'ecoRating', 'pointsCost'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
];

// Public routes
router.get('/', queryValidation, validateRequest, getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes
router.post('/', authenticateToken, requireNGO, createProductValidation, validateRequest, createProduct);
router.put('/:id', authenticateToken, requireNGO, updateProductValidation, validateRequest, updateProduct);
router.delete('/:id', authenticateToken, requireNGO, deleteProduct);

// Purchase route
router.post('/:id/purchase', authenticateToken, requireUser, purchaseProduct);

// Seller routes
router.get('/seller/products', authenticateToken, requireNGO, getSellerProducts);

export default router;
