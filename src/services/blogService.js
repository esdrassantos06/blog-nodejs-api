import Blog from '../models/blog.js';
import { reorganizeIds } from '../utils/idReorganizer.js';
import logger from '../config/logger.js';

// Service class for blog operations

class BlogService {
    /**
 * Retrieves a blog by ID
 * @param {number} id - Blog ID
 * @returns {Promise<Object>} - Blog found or null
 */

    async getBlogById(id) {
        try {
            return await Blog.findByPk(id);
        }
        catch (error) {
            logger.error(`Error fetching blog ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
 * Get all blogs
 * @returns {Promise<Array>} - Lista de blogs
 */

    async getAllBlogs() {
        try {
            return await Blog.findAll({ order: [['id', 'ASC']] });
        }
        catch (error) {
            logger.error(`Error fetching blogs: ${error.message}`);
            throw error;
        }
    }

    /**
     * Creates a new blog
     * @param {Object} data - Blog data
     * @returns {Promise<Object>} - Created blog
     */

    async createBlog(blogData) {
        try {
            const blog = await Blog.create(blogData);
            logger.info(`New Blog created with ID ${blog.id}`);
            return blog;
        }
        catch (error) {
            logger.error(`Error creating blog: ${error.message}`);
            throw error;
        }
    }

    /**
     * Updates a blog by ID
     * @param {number} id - Blog ID
     * @param {Object} data - Updated blog data
     * @returns {Promise<Object>} - Updated blog or null
     */

    async updateBlog(id, blogData) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog) return null;

            await blog.update({
                title: blogData.title || blog.title,
                author: blogData.author || blog.author,
                description: blogData.description || blog.description,
                age: blogData.age !== undefined ? blogData.age : blog.age
            });


            logger.info(`Blog with ID ${id} updated`);
            return blog;
        }
        catch (error) {
            logger.error(`Error updating blog ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes a blog by ID
     * @param {number} id - Blog ID
     * @returns {Promise<boolean>} - True if deleted, false if not found
     */

    async deleteBlog(id) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog) return false;

            await blog.destroy();
            await reorganizeIds();
            logger.info(`Blog with ID ${id} deleted`);
            return true;
        }
        catch (error) {
            logger.error(`Error deleting blog ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Reorganizes blog IDs manually
     * @returns {Promise<boolean>}
     */

    async reorganizeAllIds(){
        try{
            await reorganizeIds();
            logger.info(`All blog IDs reorganized`);
            return true;
        }
        catch(error){
            logger.error(`Error reorganizing blog IDs: ${error.message}`);
            throw error;
        }
    }
}
export default new BlogService();