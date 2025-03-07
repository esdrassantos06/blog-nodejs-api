import authService from '../services/authService.js';
import logger from '../config/logger.js';

class UserController {
    /**
     * List all users
     */
    async getAllUsers(req, res) {
        try {

            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            
            const includeInactive = req.user.role === 'admin' && req.query.inactive === 'true';
            const users = await authService.getAllUsers(includeInactive);
            res.json(users);
        } catch (err) {
            logger.error(`Controller error fetching users: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Search user by ID
     */
    async getUser(req, res) {
        try {
            const user = await authService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json(user);
        } catch (err) {
            logger.error(`Controller error fetching user: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Delete (soft delete)
     */
    async deleteUser(req, res) {
        try {
            // User cannot delete their own account
            if (parseInt(req.params.id) === req.user.id) {
                return res.status(403).json({ 
                    message: "Cannot delete your own account" 
                });
            }
            
            const success = await authService.deleteUser(req.params.id);
            if (!success) return res.status(404).json({ 
                message: "User not found or already deleted" 
            });
            
            res.json({ message: "User deleted successfully" });
        } catch (err) {
            logger.error(`Controller error deleting user: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Restores a soft-deleted user
     */
    async restoreUser(req, res) {
        try {
            const success = await authService.restoreUser(req.params.id);
            if (!success) return res.status(404).json({ 
                message: "User not found or not deleted" 
            });
            
            res.json({ message: "User restored successfully" });
        } catch (err) {
            logger.error(`Controller error restoring user: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new UserController();