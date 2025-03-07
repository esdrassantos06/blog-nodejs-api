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

    /**
 * Delete user by ID (soft delete)
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - True if success, false if not found
 */
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) return false;

            // Soft delete - defines isActive = false
            await user.update({ isActive: false });
            logger.info(`User ${id} (${user.username}) marked as inactive`);
            return true;
        } catch (error) {
            logger.error(`Error deleting user ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
 * Restores a user by ID (soft delete)
 * @param {number} id - user ID
 * @returns {Promise<boolean>} - True if success, false if not found
 */
    async restoreUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user || user.isActive) return false;

            await user.update({ isActive: true });
            logger.info(`User ${id} (${user.username}) successfully restored`);
            return true;
        } catch (error) {
            logger.error(`Error restoring user ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
 * List all users (active and inactive)
 * @param {boolean} includeInactive - innclude inactive users
 * @returns {Promise<Array>} - User list
 */
    async getAllUsers(includeInactive = false) {
        try {
            const whereClause = includeInactive ? {} : { isActive: true };

            const users = await User.findAll({
                where: whereClause,
                attributes: { exclude: ['password'] } // Não retorna senhas
            });

            return users;
        } catch (error) {
            logger.error(`Error fetching users: ${error.message}`);
            throw error;
        }
    }

    /**
 * Search for users by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User found or null if not found
 */
    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            return user;
        } catch (error) {
            logger.error(`Error fetching user ${id}: ${error.message}`);
            throw error;
        }

    }
}

export default new AuthService();