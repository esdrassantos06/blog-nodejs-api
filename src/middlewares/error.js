import logger from '../config/logger.js';

// Global middleware to handle errors
const errorMiddleware = (err, req, res, next) => {
    // Log the full error details
    logger.error(`Unhandled error: ${err.message}`, { 
        stack: err.stack,
        method: req.method,
        path: req.path
    });

    // Determine the appropriate status code
    const statusCode = err.status || err.statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Middleware to handle not found routes
export const notFoundMiddleware = (req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
};

export default errorMiddleware;