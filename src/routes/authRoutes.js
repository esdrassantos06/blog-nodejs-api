import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import validate from '../middlewares/validator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();


// Login route
router.post('/login',
    [
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

// Registration route (admin only)
router.post('/register',
    authenticate,
    authorize('admin'),
    [
        body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['user', 'editor', 'admin']).withMessage('Invalid role')
    ],
    validate,
    authController.register
);

export default router;