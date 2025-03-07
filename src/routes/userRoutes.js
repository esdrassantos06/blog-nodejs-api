import { Router } from 'express';
import { param } from 'express-validator';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);
router.use(authorize(['admin']));

// List all users (admin can see inactive ones with ?inactive=true)
router.get('/all', userController.getAllUsers);

// Get a specific user by ID
router.get('/:id', 
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.getUser
);

// Delete a user (soft delete - just sets isActive to false)
router.delete('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.deleteUser
);

// Restore a deleted user
router.post('/:id/restore',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.restoreUser
);

export default router;