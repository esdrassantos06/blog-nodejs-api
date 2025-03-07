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
            // Se não houver esquema, apenas continue
            if (!schema) {
                return next();
            }

            // Lista de rotas especiais que não precisam seguir o padrão de ID numérico
            const specialRoutes = [
                'docs',
                'favicon.ico',
                'all',        // Rota /users/all
                'register',   // Rota /auth/register
                'login'       // Rota /auth/login
                // Adicione outras rotas especiais aqui
            ];

            // Antes da validação, verificar se o ID do parâmetro é uma rota especial
            if (req.params && req.params.id && specialRoutes.includes(req.params.id)) {
                // Se for uma rota especial, permitimos passar sem validação
                return next();
            }

            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params
            });

            if (!result.success) {
                // Loga o erro
                logger.warn('Validation error', result.error.format());

                // Verificar se o erro é apenas sobre o ID não ser numérico
                const errors = result.error.format();
                
                // Se o erro for relacionado ao ID e o caminho parecer uma rota real (não apenas um ID inválido)
                // permitimos que continue para o middleware correto
                if (errors.params && 
                    errors.params.id && 
                    errors.params.id._errors.includes("ID must be a numeric value")) {
                    
                    const idValue = req.params.id;
                    
                    // Se o ID parece ser um nome de rota (não começa com número e não contém caracteres especiais)
                    if (idValue && 
                        isNaN(parseInt(idValue)) && 
                        /^[a-zA-Z0-9_-]+$/.test(idValue)) {
                        return next();
                    }
                }

                // Caso contrário, retorna erro de validação
                return res.status(400).json({
                    message: 'Validation error',
                    errors: errors
                });
            }

            // Atualiza os dados validados
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

// Scheme for blog validation
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
            sortOrder: z.enum(['ASC', 'DESC']).optional()
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