import app from './app';
import { Config } from './config';

const startServer = () => {
    try {
        app.listen(Config.PORT, () => {});
    } catch (error) {
        process.exit(1);
    }
};

startServer();
