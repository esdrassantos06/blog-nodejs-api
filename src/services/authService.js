// services/authService.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import logger from '../config/logger.js';

class AuthService {
    /**
     * Registers a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - User registered (without password)
     */

    async register(userData) {
        try {
            const user = await User.create(userData);
            const userWithoutPassword = user.toJSON();
            delete userWithoutPassword.password;
            return userWithoutPassword;
        } catch (error) {
            logger.error(`Error registering user: ${error.message}`);
            throw error;
        }
    }

    /**
     * Logins a user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} - JWT token and user data
     */
    async login(username, password) {
        try {
            const user = await User.findOne({
                where: {
                    username,
                    isActive: true
                }
            });


            if (!user) {
                throw new Error('User not found or inactive');
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d'
                }
            );

            // Debugging
            console.log('Generated token:', token);



            const userWithoutPassword = user.toJSON();
            delete userWithoutPassword.password;

            return {
                token,
                user: userWithoutPassword
            };
        } catch (error) {
            logger.error(`Error logging in: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify a JWT token
     * @param {string} token - JWT Token
     * @returns {Promise<Object>} - Decoded payload data
     */
    async verifyToken(token) {
        try {

            if (!process.env.JWT_SECRET) {
                throw new Error('JWT Secret is not defined');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            return decoded;

        } catch (error) {
            logger.error(`Error verifying token: ${error.message}`);
            throw error;
        }
    }
}

export default new AuthService();