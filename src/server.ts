import app from './app';
import { Config } from './config';
import logger from './config/logger';
const startServer = () => {
    try {
        app.listen(Config.PORT, () => {
            logger.info(`Server is running on port ${Config.PORT}`);
        });
    } catch (error) {
        if(error instanceof Error) {
            logger.error(`Error: ${error.message}`);

            process.exit(1);
        }
    }
};

startServer();
