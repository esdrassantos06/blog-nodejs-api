import authService from '../services/authService.js';
import logger from '../config/logger.js';

/**
 * JWT Auth middleware
 */

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Unauthorized. Authentication required."
            });
        }
        
        const token = authHeader.split(' ')[1];
        

        try {
            const userData = await authService.verifyToken(token);
            req.user = userData;
            next();
        } catch (error) {
            logger.warn(`Token verification failed: ${error.message}`);
            next();
        }

    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        next(error);
    }
};

/**
 * Authentication based on user role
 * @param {string|Array} roles - Allowed Roles
 */
export const authorize = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Unauthorized. Authentication required."
                });
            }
            
            const userRole = req.user.role;
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            
            if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
                logger.warn(`Authorization failure: User ${req.user.username} (${userRole}) attempted to access ${req.method} ${req.path}`);
                return res.status(403).json({
                    message: "Forbidden. Insufficient permissions."
                });
            }
            
            next();
        } catch (error) {
            logger.error(`Authorization error: ${error.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};