import logger from '../config/logger.js';

const errorMiddleware = (err, req, res) => {
    logger.error(`Unhandled error: ${err.message}`, {
        stack: err.stack,
        method: req.method,
        path: req.path
    });

    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFoundMiddleware = (req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
};

export default errorMiddleware;