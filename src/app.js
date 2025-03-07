import dotenv from 'dotenv';
import configureServer from './config/server.js';
import { initDatabase } from './config/database.js';
import logger from './config/logger.js';
import blogRoutes from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFoundMiddleware } from './middlewares/error.js';
import swaggerConfig from './config/swagger.js';


dotenv.config();

const startServer = async () => {
    try {
        await initDatabase();

        const app = configureServer();

        app.use('/api-docs', swaggerConfig.serve, swaggerConfig.setup);

        app.get('/docs', (req, res) => {
            res.redirect('https://blog-api.apidocumentation.com/guide/getting-started-with-the-blog-api');
        });

        app.use('/auth', authRoutes);
        app.use('/users', userRoutes);
        app.use('/', blogRoutes);

        app.use(notFoundMiddleware);

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
            logger.info(`✨ Hosted API Documentation available at http://localhost:${PORT}/docs`);

        })

        process.on('uncaughtException', (error) => {
            logger.error(`Uncaught Exception: ${error.message}`);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
            process.exit(1);
        })
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }

}
startServer();