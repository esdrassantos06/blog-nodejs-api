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

            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params
            });

            if (!result.success) {
                // Loga o erro mas não para a execução para rotas que não precisam de validação
                logger.warn('Validation error', result.error.format());

                const errors = result.error.format();
                if (errors.params &&
                    errors.params.id &&
                    errors.params.id._errors.includes("ID must be a numeric value")) {
                    const path = req.path;
                    if (path === '/docs' || path.startsWith('/api-docs') || path === '/favicon.ico') {
                        // Para rotas conhecidas, permitimos continuar
                        return next();
                    }
                }

                return res.status(400).json({
                    message: 'Validation error',
                    errors: result.error.format()
                });
            }


            req.body = result.data.body;
            req.query = result.data.query;
            req.params = result.data.params;

            next();
        } catch (error) {
            logger.error(`Zod validation error: ${error.message}`);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

const betterIdSchema = z.string().refine(
    (val) => {
        if (!isNaN(parseInt(val))) {
            return true;
        }
        return ['docs', 'api-docs', 'favicon.ico'].includes(val);
    },
    { message: "ID must be a numeric value" }
);

// Scheme for blog validation
export const blogSchemas = {
    
    // Scheme for creation
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

    // Scheme for update
    update: z.object({
        body: z.object({
            title: z.string().min(1).max(200).optional(),
            author: z.string().min(1).max(100).optional(),
            description: z.string().max(5000).optional(),
            age: z.number().int().min(0).max(150).optional()
        }),
        query: z.object({}).optional(),
        params: z.object({
            id: betterIdSchema
        })
    }),
    // Scheme for search with pagination and filtering
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
            sortOrder: z.enum(['ASC', 'DESC']).optional()
        }),
        params: z.object({})
    }),

    // Scheme for search by ID
    getById: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: betterIdSchema
        })
    }),

    // Scheme for delete
    delete: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: betterIdSchema
        })
    }),

    // Schema for restore
    restore: z.object({
        body: z.object({}).optional(),
        query: z.object({}).optional(),
        params: z.object({
            id: betterIdSchema
        })
    })
};