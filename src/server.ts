import app from './app';
import {Config} from './config';


const startServer = async () => {
    try {
        app.listen(Config.PORT, () => {
            console.log(`Server is listening on port ${Config.PORT}`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);    
    }
}

startServer();