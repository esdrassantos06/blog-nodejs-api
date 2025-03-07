import authService from '../services/authService.js';
import logger from '../config/logger.js';

class AuthController {
    /**
     * Register
     */
    async register(req, res) {
        try {
            const user = await authService.register({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role || 'user'
            });
            
            res.status(201).json(user);
        } catch (err) {
            logger.error(`Controller error registering user: ${err.message}`);
            
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ 
                    message: "Username or email already exists" 
                });
            }
            
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Login
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            
            res.json(result);
        } catch (err) {
            logger.error(`Controller error logging in: ${err.message}`);
            
            if (err.message === 'User not found or inactive' || 
                err.message === 'Invalid password') {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new AuthController();