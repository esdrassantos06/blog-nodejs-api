import { Router } from 'express';
import blogController from '../controllers/blogController.js';
import { validateWith, blogSchemas } from '../middlewares/zodValidator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/',
    validateWith(blogSchemas.getAll),
    blogController.getBlogs
);

router.get('/:id',
    validateWith(blogSchemas.getById),
    blogController.getBlog
);

router.post('/',
    authenticate,
    authorize(['admin', 'editor']),
    validateWith(blogSchemas.create),
    blogController.createBlog
);

router.put('/:id',
    authenticate,
    authorize(['admin', 'editor']),
    validateWith(blogSchemas.update),
    blogController.updateBlog
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    validateWith(blogSchemas.delete),
    blogController.deleteBlog
);

router.post('/:id/restore',
    authenticate,
    authorize('admin'),
    validateWith(blogSchemas.restore),
    blogController.restoreBlog
);

export default router;