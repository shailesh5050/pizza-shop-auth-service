import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the correct .env file
const envPath = path.join(
    __dirname,
    `../../.env.${process.env.NODE_ENV || 'dev'}`,
);
config({ path: envPath });

// Export Config object with default values
export const Config = {
    PORT: process.env.PORT || 5501,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_USERNAME: process.env.DB_USER || 'root', // Changed from DB_USERNAME to DB_USER
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    DB_NAME: process.env.DB_NAME || 'mernstack_auth_service_test',
    REFRESH_TOKEN: process.env.REFRESH_TOKEN, // Added REFRESH_TOKEN
};
