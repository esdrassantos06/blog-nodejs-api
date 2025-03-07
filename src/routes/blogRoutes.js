import { Router } from 'express';
import blogController from '../controllers/blogController.js';
import { validateWith, blogSchemas } from '../middlewares/zodValidator.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: List blogs with pagination and filtering
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (title, author or description)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *         description: Minimum age
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *         description: Maximum age
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, title, author, age, createdAt, updatedAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Paginated list of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 */
router.get('/',
    validateWith(blogSchemas.getAll),
    blogController.getBlogs
);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a specific blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
    validateWith(blogSchemas.getById),
    blogController.getBlog
);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               author:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/',
    authenticate,
    authorize(['admin', 'editor']),
    validateWith(blogSchemas.create),
    blogController.createBlog
);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update an existing blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               author:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */
router.put('/:id',
    authenticate,
    authorize(['admin', 'editor']),
    validateWith(blogSchemas.update),
    blogController.updateBlog
);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Remove a blog (soft delete)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog removed successfully
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
 *         description: Blog not found
 */
router.delete('/:id',
    authenticate,
    authorize('admin'),
    validateWith(blogSchemas.delete),
    blogController.deleteBlog
);

/**
 * @swagger
 * /{id}/restore:
 *   post:
 *     summary: Restore a removed blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog restored successfully
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
 *         description: Blog not found or not removed
 */
router.post('/:id/restore',
    authenticate,
    authorize('admin'),
    validateWith(blogSchemas.restore),
    blogController.restoreBlog
);

export default router;