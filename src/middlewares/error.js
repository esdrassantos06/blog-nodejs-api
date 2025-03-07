import logger from '../config/logger.js';

// Global middleware to handle errors

const errorMiddleWare = (err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, {stack: err.stack});
    res.status(500).json({messsage: "Internal server error"});
};

// Middleware to handle not found routes
export const notFoundMiddleware = (req, res) => {
    res.status(404).json({message: "Route not found"});
}

export default errorMiddleWare;