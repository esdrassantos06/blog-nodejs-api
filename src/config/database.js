import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URI, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: (msg) => logger.debug(msg)
});

export const initDatabase = async () => {
    try {

        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        await sequelize.sync();
        logger.info("PostgreSQL database & tables created!");

        try {
            const [results] = await sequelize.query(`SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'Blogs'
                );`);


            const tableExists = results[0].exists;

            if (tableExists) {
                const [countResults] = await sequelize.query(`SELECT COUNT(*) FROM "Blogs";`);
                const count = Number(countResults[0].count);

                if (count > 0) {
                    await sequelize.query(`
                            SELECT setval(pg_get_serial_sequence('"Blogs"', 'id'), 
                            (SELECT MAX(id) FROM "Blogs"));
                        `);
                    logger.info('ID sequence updated sucessfully!');
                } else {
                    await sequelize.query(`ALTER SEQUENCE "Blogs_id_seq" RESTART WITH 1;`);
                    logger.info('ID sequence reset to 1!');
                }
            }
        }
        catch (err) {
            logger.error("Error adjusting ID sequence:", err);
        }
    }
    catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
};

export default sequelize;