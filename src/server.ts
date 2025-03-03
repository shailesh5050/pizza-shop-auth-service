import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');
        app.listen(Config.PORT, () => {
            logger.info(`Server is running on port ${Config.PORT}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error: ${error.message}`);

            process.exit(1);
        }
    }
};

startServer().catch((err: unknown) => {
    if (err instanceof Error) {
        logger.error(`Failed to start server: ${err.message}`);
    } else {
        logger.error('An unknown error occurred while starting the server');
    }
    process.exit(1);
});
