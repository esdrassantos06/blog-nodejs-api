import Blog from '../models/blog.js';
import { Op } from 'sequelize';
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
            return await Blog.findOne({
                where: {
                    id,
                    isDeleted: false
                }
            });
        }
        catch (error) {
            logger.error(`Error fetching blog ${id}: ${error.message}`);
            throw error;
        }
    }


    /**
     * Retrieves blogs with pagination and filtering
     * @param {Object} options - consulting options
     * @param {Promise<Object>} - Paginated results
     */

    async getBlogs(options = {}) {
        try {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const offset = (page - 1) * limit;
            const whereClause = { isDeleted: false };

            if (options.author) {
                whereClause.author = { [Op.iLike]: `%${options.author}%` };
            }

            if (options.title) {
                whereClause.title = { [Op.iLike]: `%${options.title}%` };
            }

            if (options.minAge !== undefined) {
                whereClause.age = { ...whereClause.age, [Op.gte]: options.minAge };
            }

            if (options.maxAge !== undefined) {
                whereClause.age = { ...whereClause.age, [Op.lte]: options.maxAge };
            }

            if (options.search) {
                whereClause[Op.or] = [
                    { title: { [Op.iLike]: `%${options.search}%` } },
                    { author: { [Op.iLike]: `%${options.search}%` } },
                    { description: { [Op.iLike]: `%${options.search}%` } }
                ];
            }

            const { count, rows } = await Blog.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [options.sortBy ? [options.sortBy, options.sortOrder || 'ASC'] : ['id', 'ASC']]
            });

            return {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                items: rows
            }
        } catch (error) {
            logger.error(`Error fetching blogs: ${error.message}`);
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
            const blog = await Blog.findOne({
                where: { id, isDeleted: false }
            });
            if (!blog) return null;

            await blog.update({
                title: blogData.title !== undefined ? blogData.title : blog.title,
                author: blogData.author !== undefined ? blogData.author : blog.author,
                description: blogData.description !== undefined ? blogData.description : blog.description,
                age: blogData.age !== undefined ? blogData.age : blog.age
            });


            logger.info(`Blog ${id} updated`);
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
            if (!blog || blog.isDeleted) return false;


            await blog.update({ isDeleted: true });
            logger.info(`Blog ${id} deleted`);
            return true;
        }
        catch (error) {
            logger.error(`Error deleting blog ${id}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Restore excluded blogs
     * @param {number} id - Blog ID
     * @returns {Promise<boolean>} - True if restored, false if not found
     */

    async restoreBlog(id) {
        try {
            const blog = await Blog.findByPk(id);
            if (!blog || !blog.isDeleted) return false;

            await blog.update({ isDeleted: false });
            logger.info(`Blog ${id} successfully restored`);
            return true;
        } catch (error) {
            logger.error(`Error restoring blog ${id}: ${error.message}`);
            throw error;
        }
    }
}
export default new BlogService();