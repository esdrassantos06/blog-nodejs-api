import { z } from 'zod';
import logger from '../config/logger.js';

/**
 * Creates a middleware to validate request data using Zod
 * @param {Object} schema - Scheme Zod for data validation
 * @returns {Function} - Middleware Express
 */
export const validateWith = (schema) => {
    return (req, res, next) => {
        try {
            if (!schema) {
                return next();
            }

            const specialRoutes = [
                'docs',
                'favicon.ico',
                'all',        // /users/all
                'register',   // /auth/register
                'login'       // /auth/login
            ];

            if (req.params && req.params.id && specialRoutes.includes(req.params.id)) {
                return next();
            }

            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params
            });

            if (!result.success) {
                logger.warn('Validation error', result.error.format());

                const errors = result.error.format();

                if (errors.params &&
                    errors.params.id &&
                    errors.params.id._errors.includes("ID must be a numeric value")) {

                    const idValue = req.params.id;

                    if (idValue &&
                        isNaN(parseInt(idValue)) &&
                        /^[a-zA-Z0-9_-]+$/.test(idValue)) {
                        return next();
                    }
                }

                return res.status(400).json({
                    message: 'Validation error',
                    errors: errors
                });
            }

            req.safeBody = result.data.body;
            req.safeQuery = result.data.query;
            req.safeParams = result.data.params;

            next();
        } catch (error) {
            logger.error(`Zod validation error: ${error.message}`);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

const flexibleIdSchema = z.string().refine(
    (val) => {
        if (!isNaN(parseInt(val))) {
            return true;
        }

        const validRoutes = ['all', 'register', 'login', 'docs', 'favicon.ico'];
        if (validRoutes.includes(val)) {
            return true;
        }

        return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(val);
    },
    { message: "ID must be a numeric value or a valid route name" }
);

export const blogSchemas = {

    create: z.object({
        body: z.object({
            title: z.string().min(1).max(200),
            author: z.string().min(1).max(100),
            description: z.string().max(5000).optional(),
            age: z.number().int().min(0).max(150).optional()
        }),
        query: z.object({}).optional(),
        params: z.object({})
    }),


    update: z.object({
        body: z.object({
            title: z.string().min(1).max(200).optional(),
            author: z.string().min(1).max(100).optional(),
            description: z.string().max(5000).optional(),
            age: z.number().int().min(0).max(150).optional()
        }),
        query: z.object({}).optional(),
        params: z.object({
            id: flexibleIdSchema
        })
    }),


    getAll: z.object({
        body: z.object({}).optional(),
        query: z.object({
            page: z.string().optional().transform(val => val ? parseInt(val) : 1),
            limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
            search: z.string().optional(),
            author: z.string().optional(),
            title: z.string().optional(),
            minAge: z.string().optional().transform(val => val ? parseInt(val) : undefined),
            maxAge: z.string().optional().transform(val => val ? parseInt(val) : undefined),
            sortBy: z.enum(['id', 'title', 'author', 'age', 'createdAt', 'updatedAt']).optional(),
            sortOrder: z.enum(['ASC', 'DESC']).optional(),
            inactive: z.string().optional()
        }),
        params: z.object({})
    }),

    getById: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: flexibleIdSchema
        })
    }),

    delete: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: flexibleIdSchema
        })
    }),

    restore: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: flexibleIdSchema
        })
    })
};