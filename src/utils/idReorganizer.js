import sequelize from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Reorganizes blog IDs to maintain a continuous sequence
 * @returns {Promise<boolean>} true if successful
 */


export const reorganizeIds = async () => {
    const transaction = await sequelize.transaction();
    try{
        await sequelize.query(
            'CREATE TABLE "Blogs_temp" AS SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs" ORDER BY "createdAt";',
            { transaction }
        );
        await sequelize.query(`TRUNCATE TABLE "Blogs" RESTART IDENTITY;`, { transaction });
        await sequelize.query(
            `INSERT INTO "Blogs" (title, author, description, age, "createdAt", "updatedAt") SELECT title, author, description, age, "createdAt", "updatedAt" FROM "Blogs_temp";`, {transaction}
        );
        await sequelize.query(`DROP TABLE "Blogs_temp"`, { transaction });
        await transaction.commit();
        logger.info('IDs successfully reorganized');
        return true;
    }
    catch(error){
        await transaction.rollback();
        logger.error('Error reorganizing IDs:', error);
        throw error;
    }
};

export default reorganizeIds;