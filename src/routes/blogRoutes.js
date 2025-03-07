import { Router } from 'express';
import { body, param } from 'express-validator';
import blogController from '../controllers/blogController.js';
import validate from '../middlewares/validator.js';
import authenticateApiKey from '../middlewares/auth.js';

const router = Router();

router.use(authenticateApiKey);

router.get('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    blogController.getBlog
);

router.get('/', blogController.getAllBlogs);

router.post('/',
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('author').isString().isLength({ min: 1, max: 100 }).withMessage('Author must be between 1 and 100 characters'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    validate,
    blogController.createBlog
);

router.put('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('author').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Author must be between 1 and 100 characters'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    validate,
    blogController.updateBlog
);

router.delete('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    blogController.deleteBlog
);

router.post('/admin/reorganize-ids', blogController.reorganizeIds);

export default router;