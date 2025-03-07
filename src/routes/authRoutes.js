import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import validate from '../middlewares/validator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/register',
    body('username').isString().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'editor', 'admin']).withMessage('Role must be user, editor, or admin'),
    validate,
    authenticate, 
    authorize('admin'), // Only Admin can register users
    authController.register
);

router.post('/login',
    body('username').isString().withMessage('Username is required'),
    body('password').isString().withMessage('Password is required'),
    validate,
    authController.login
);

export default router;