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
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
})

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);


const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const sequelize = new Sequelize(process.env.DATABASE_URI, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
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
        logger.info('IDs reorganized sequentially');
        return true;
    } catch (error) {
        await transaction.rollback();
        logger.error('Error reorganizing IDs:', error);
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
                logger.info("ID sequence updated successfully!");
            } else {
                await sequelize.query(`ALTER SEQUENCE "Blogs_id_seq" RESTART WITH 1;`);
                logger.info("ID sequence reset to 1!");
            }
        } catch (err) {
            logger.error("Error adjusting ID sequence:", err);
        }
    })
    .catch(err => logger.error("Error syncing database:", err));


const authenticateApiKey = (req, res, next) => {
    if (req.method === 'GET' && !req.path.includes('/admin/')) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(`Unauthorized access attempt: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
            message: "Unauthorized. Missing or invalid token."
        });
    }

    const token = authHeader.split(' ')[1];

    if (token !== API_KEY) {
        logger.warn(`Access attempt with invalid token: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
            message: "Unauthorized. Invalid token."
        });
    }

    next();
};
app.use(authenticateApiKey);

app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Internal server error' });
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};



//GET by ID
app.get('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not Found" });
            res.json(blog);
        } catch (err) {
            logger.error(`Error fetching blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    });

// GET ALL
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['id', 'ASC']] });
        res.json(blogs);
    } catch (err) {
        logger.error(`Error fetching blogs: ${err.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE Route
app.delete('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not Found" });

            await blog.destroy();
            await reorganizeIds();
            logger.info(`Blog ${req.params.id} successfully deleted`);
            res.json({ message: "Blog deleted successfully" });
        } catch (err) {
            logger.error(`Error deleting blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    });

// PUT Route (update)
app.put('/:id',
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('author').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Author must be between 1 and 100 characters'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.findByPk(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not found" });

            await blog.update({
                title: req.body.title || blog.title,
                author: req.body.author || blog.author,
                description: req.body.description || blog.description,
                age: req.body.age !== undefined ? req.body.age : blog.age
            });

            logger.info(`Blog ${req.params.id} updated successfully`);
            res.json(blog);
        } catch (err) {
            logger.error(`Error updating blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    });


// POST Route (create)
app.post('/',
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('author').isString().isLength({ min: 1, max: 100 }).withMessage('Author must be between 1 and 100 characters'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    validate,
    async (req, res) => {
        try {
            const blog = await Blog.create({
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
                age: req.body.age
            });

            logger.info(`New blog created with ID ${blog.id}`);
            res.status(201).json(blog);
        } catch (err) {
            logger.error(`Error creating blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    });

app.post('/admin/reorganize-ids', async (req, res) => {
    try {
        await reorganizeIds();
        logger.info('IDs manually reorganized');
        res.status(200).json({ message: "IDs successfully reorganized" });
    } catch (err) {
        logger.error(`Error reorganizing IDs: ${err.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
    logger.info(`🚀 Server running on Port ${port}`);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
});