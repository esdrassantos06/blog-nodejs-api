import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
});
app.use(limiter);


const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const sequelize = new Sequelize(process.env.DATABASE_URI, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: true // True se estiver em produção
        } : false
    },
    logging: (msg) => logger.debug(msg)
});


const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 200]
        }
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        validate: {
            len: [0, 5000]
        }
    },
    age: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: true,
            min: 0,
            max: 150
        }
    }
}, {
    timestamps: true
});

 
async function reorganizeIds() {
    const transaction = await sequelize.transaction();
    try {
        await sequelize.query(
            'CREATE TABLE "Blogs_temp" AS SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs" ORDER BY "createdAt";',
            { transaction }
        );
        await sequelize.query('TRUNCATE TABLE "Blogs" RESTART IDENTITY;', { transaction });
        await sequelize.query(
            'INSERT INTO "Blogs" (title, author, description, age, "createdAt", "updatedAt") SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs_temp";',
            { transaction }
        );
        await sequelize.query('DROP TABLE "Blogs_temp";', { transaction });
        await transaction.commit();
        logger.info('IDs reorganizados sequencialmente');
        return true;
    } catch (error) {
        await transaction.rollback();
        logger.error('Erro ao reorganizar IDs:', error);
        throw error;
    }
}

sequelize.sync()
    .then(async () => {
        logger.info("PostgreSQL database & tables created!");
        try {
            const count = await Blog.count();
            if (count > 0) {
                await sequelize.query(`
          SELECT setval(pg_get_serial_sequence('"Blogs"', 'id'), 
          (SELECT MAX(id) FROM "Blogs"));
        `);
                logger.info("Sequência de IDs atualizada com sucesso!");
            } else {
                await sequelize.query(`ALTER SEQUENCE "Blogs_id_seq" RESTART WITH 1;`);
                logger.info("Sequência de IDs reiniciada para 1!");
            }
        } catch (err) {
            logger.error("Erro ao ajustar sequência de IDs:", err);
        }
    })
    .catch(err => logger.error("Error syncing database:", err));


const authenticateApiKey = (req, res, next) => {
    if (req.method === 'GET' && !req.path.includes('/admin/')) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(`Tentativa de acesso não autorizado: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
            message: "Unauthorized. Missing or invalid token."
        });
    }

    const token = authHeader.split(' ')[1];

    if (token !== API_KEY) {
        logger.warn(`Tentativa de acesso com token inválido: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
            message: "Unauthorized. Invalid token."
        });
    }

    next();
};
app.use(authenticateApiKey);

app.use((err, req, res, next) => {
    logger.error(`Erro não tratado: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Erro interno do servidor' });
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};



//GET pelo ID
app.get('/:id',
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not Found" });
            res.json(blog);
        } catch (err) {
            logger.error(`Erro ao buscar blog: ${err.message}`);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });

// GET ALL
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['id', 'ASC']] });
        res.json(blogs);
    } catch (err) {
        logger.error(`Erro ao buscar blogs: ${err.message}`);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});

// Rota DELETE
app.delete('/:id',
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not Found" });

            await blog.destroy();
            await reorganizeIds();
            logger.info(`Blog ${req.params.id} deletado com sucesso`);
            res.json({ message: "Blog deleted successfully" });
        } catch (err) {
            logger.error(`Erro ao deletar blog: ${err.message}`);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });

// Rota PUT (atualizar)
app.put('/:id',
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Título deve ter entre 1 e 200 caracteres'),
    body('author').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Autor deve ter entre 1 e 100 caracteres'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Descrição deve ter no máximo 5000 caracteres'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Idade deve ser entre 0 e 150'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog não encontrado" });

            await blog.update({
                title: req.body.title || blog.title,
                author: req.body.author || blog.author,
                description: req.body.description || blog.description,
                age: req.body.age !== undefined ? req.body.age : blog.age
            });

            logger.info(`Blog ${req.params.id} atualizado com sucesso`);
            res.json(blog);
        } catch (err) {
            logger.error(`Erro ao atualizar blog: ${err.message}`);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });


// Rota POST (criar)
app.post('/',
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Título deve ter entre 1 e 200 caracteres'),
    body('author').isString().isLength({ min: 1, max: 100 }).withMessage('Autor deve ter entre 1 e 100 caracteres'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Descrição deve ter no máximo 5000 caracteres'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Idade deve ser entre 0 e 150'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.create({
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
                age: req.body.age
            });

            logger.info(`Novo blog criado com ID ${blog.id}`);
            res.status(201).json(blog);
        } catch (err) {
            logger.error(`Erro ao criar blog: ${err.message}`);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    });

app.post('/admin/reorganize-ids', async (req, res) => {
    try {
        await reorganizeIds();
        logger.info('IDs reorganizados manualmente');
        res.status(200).json({ message: "IDs reorganizados com sucesso" });
    } catch (err) {
        logger.error(`Erro ao reorganizar IDs: ${err.message}`);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(port, () => {
    logger.info(`🚀 Server running on Port ${port}`);
});

process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promessa rejeitada não tratada:', reason);
});


