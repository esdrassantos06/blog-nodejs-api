import { Router } from 'express';
import blogController from '../controllers/blogController.js';
import { validateWith, blogSchemas } from '../middlewares/zodValidator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use((req, res, next) => {
    if ((req.method === 'GET' && !req.path.includes('/admin/'))) {
        return next();
    }
    authenticate(req, res, next);
});


router.get('/',
    validateWith(blogSchemas.getAll),
    blogController.getBlogs
);

router.get('/:id',
    validateWith(blogSchemas.getById),
    blogController.getBlog
);

router.post('/',
    validateWith(blogSchemas.create),
    blogController.createBlog
);

router.put('/:id',
    validateWith(blogSchemas.update),
    blogController.updateBlog
);

router.delete('/:id',
    validateWith(blogSchemas.delete),
    blogController.deleteBlog
);

router.post('/:id/restore',
    validateWith(blogSchemas.restore),
    authorize('admin'),
    blogController.restoreBlog
);


export default router;