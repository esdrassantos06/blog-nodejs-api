import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import expressMongoSanitize from '@exortek/express-mongo-sanitize';

const xssMiddleware = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return xss(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            const sanitized = {};
            for (let key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    next();
};

const configureServer = () => {
    const app = express();

    app.use(helmet());
    app.use(express.json({ limit: '1mb' }));
    app.use(xssMiddleware);

    app.use(expressMongoSanitize());

    const corsOptions = {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };

    app.use(cors(corsOptions));

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later'
    })
    app.use(limiter);

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 mins
        max: 10, // 10 tries per ip
        message: 'Too many login attempts from this IP, please try again later'
    });
    app.use('/auth/login', authLimiter);

    return app;
}

export default configureServer;