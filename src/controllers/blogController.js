import blogService from '../services/blogService.js';
import logger from '../config/logger.js';

/** 
 * Controller for blog operations
 */
class BlogController {
    /**
     * Obtém um blog pelo ID
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
        } catch (err){
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

            if (!success) return res.status(404).json({ message: "Blog not found" });
            res.json({ message: "Blog deleted successfully" });
            
        } catch (err) {
            logger.error(`Controller error deleting blog: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Reorganize blogs by id manually
     */

    async reorganizeIds(req, res) {
        try {
            await blogService.reorganizeAllIds();
            res.status(200).json({ message: "IDs successfully reorganized" });
        } catch (err) {
            logger.error(`Controller error reorganizing IDs: ${err.message}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new BlogController();