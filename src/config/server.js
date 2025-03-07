import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import errorMiddleware from '../middlewares/error.js';

const configureServer = () =>{
    const app = express();

    app.use(helmet());

    app.use(express.json({limit: '1mb'}));

    app.use(xss());

    app.use(mongoSanitize()); //NoSQL Injection Protection

    const corsOptions = {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET','POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use(cors(corsOptions));

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 mins
        max: 100, // 100 requests per ip
        message: 'Too many requests from this IP, please try again later'
    })
    app.use(limiter);

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 mins
        max: 10, // 10 tries per ip
        message: 'Too many login attempts from this IP, please try again later'
    });
    app.use('/auth/login', authLimiter);

    // Global Error Middleware
    app.use(errorMiddleware);

    return app;
}

export default configureServer;