import { config } from 'dotenv';
import path from 'path';
config({path:path.join(__dirname, `../../.env/${process.env.NODE_ENV}.env`)});

const { PORT, NODE_ENV,DB_HOST,DB_PORT,DB_NAME,DB_USERNAME,DB_PASSWORD } = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
};
