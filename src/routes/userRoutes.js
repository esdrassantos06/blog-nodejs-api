import { Router } from 'express';
import { param } from 'express-validator';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/all', userController.getAllUsers);


router.get('/:id', 
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.getUser
);


router.delete('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.deleteUser
);


router.post('/:id/restore',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    userController.restoreUser
);

export default router;