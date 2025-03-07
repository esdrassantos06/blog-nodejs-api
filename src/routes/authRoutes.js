import { Router } from 'express';
import { param } from 'express-validator';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All user routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(['admin']));

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: inactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include inactive users (admin only)
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/all', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', 
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.getUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deactivate a user (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or attempt to delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/restore:
 *   post:
 *     summary: Restore a deactivated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found or not deactivated
 */
router.post('/:id/restore',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.restoreUser
);

export default router;