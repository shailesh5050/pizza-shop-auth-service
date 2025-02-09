import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from './index';
import logger from './logger';
import { RefreshToken } from '../entity/RefreshToken';

export const AppDataSource = new DataSource({
    // Database configuration
    type: 'postgres',
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,

    // dont use synchronize in production  - otherwise you can lose production data
    synchronize: Config.NODE_ENV === 'dev' || Config.NODE_ENV === 'test',
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        logger.info('Database connection established successfully');
    })
    .catch((error) => {
        logger.error('Error connecting to database:', error);
    });
