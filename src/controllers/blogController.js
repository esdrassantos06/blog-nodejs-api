import blogService from '../services/blogService.js';
import logger from '../config/logger.js';

/** 
 * Controller for blog operations
 */
class BlogController {
    /**
     * Get Blog by ID
     */
    async getBlog(req, res) {
        try {
            const blog = await blogService.getBlogById(req.params.id);
            if (!blog) return res.status(404).json({ message: "Blog not found" });
            res.json(blog);
        } catch (err) {
            logger.error(`Controller error fetching blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
 * Lista blogs com paginação e filtragem
 */
    async getBlogs(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                author: req.query.author,
                title: req.query.title,
                search: req.query.search,
                minAge: req.query.minAge !== undefined ? parseInt(req.query.minAge) : undefined,
                maxAge: req.query.maxAge !== undefined ? parseInt(req.query.maxAge) : undefined,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder
            };

            const result = await blogService.getBlogs(options);
            res.json(result);
        } catch (err) {
            logger.error(`Controller error fetching blogs: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * List all blogs
     */
    async getAllBlogs(req, res) {
        try {
            const blogs = await blogService.getAllBlogs();
            res.json(blogs);
        } catch (err) {
            logger.error(`Controller error fetching blogs: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }


    /**
     * Create a new blog
     */
    async createBlog(req, res) {
        try {
            const blog = await blogService.createBlog({
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
                age: req.body.age
            });
            res.status(201).json(blog);
        } catch (err) {
            logger.error(`Controller error creating blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Update a existing blog
     */
    async updateBlog(req, res) {
        try {
            const blog = await blogService.updateBlog(req.params.id, {
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
                age: req.body.age
            });

            if (!blog) return res.status(404).json({ message: "Blog not found" });
            res.json(blog);
        } catch (err) {
            logger.error(`Controller error updating blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Delete a blog
     */

    async deleteBlog(req, res) {
        try {
            const success = await blogService.deleteBlog(req.params.id);
            if (!success) return res.status(404).json({ message: "Blog not found or already deleted" });
            res.json({ message: "Blog deleted successfully" });
        } catch (err) {
            logger.error(`Controller error deleting blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Restore a deleted blog
     */

    async restoreBlog(req, res) {
        try {
            const success = await blogService.restoreBlog(req.params.id);
            if (!success) return res.status(404).json({ message: "Blog not found or not deleted" });
            res.json({ message: "Blog restored successfully" });
        } catch (err) {
            logger.error(`Controller error restoring blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }


}

export default new BlogController();