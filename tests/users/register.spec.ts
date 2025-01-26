import request from 'supertest';
import app from '../../src/app';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { DataSource } from 'typeorm';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
import { Config } from '../../src/config';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        try {
            connection = new DataSource({
                type: 'postgres',
                host: Config.DB_HOST,
                port: Number(Config.DB_PORT),
                username: Config.DB_USERNAME,
                password: Config.DB_PASSWORD,
                database: Config.DB_NAME,
                entities: [User],
                logging: false,
                synchronize: true,
                migrations: [],
                subscribers: [],
            });
            await connection.initialize();
            await connection.synchronize(true); // Force synchronize the database schema
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await truncateTables(connection);
        await connection.destroy();
    });

    const createUser = (overrides = {}) => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
        password: '123456',
        ...overrides,
    });

    describe('Given a valid request', () => {
        it('Should return a 200 status code and persist the user', async () => {
            const userData = createUser();
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Validate response
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                message: 'register',
                user: { email: userData.email },
            });

            // Validate persistence
            const userRepo = connection.getRepository(User);
            const user = await userRepo.findOne({
                where: { email: userData.email },
            });
            expect(user).toBeDefined();
            expect(user?.firstName).toBe(userData.firstName);
            expect(user?.lastName).toBe(userData.lastName);
            expect(user?.email).toBe(userData.email);
        });
    });

    describe('Given an invalid request', () => {
        it('Should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ email: 'john@gmail.com' });
            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                error: 'Required fields missing',
            });
        });

        it('Should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(createUser({ email: 'invalid-email' }));
            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                error: 'Invalid email format',
            });
        });

        it('Should return 400 for weak passwords', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(createUser({ password: '123' }));
            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                error: 'Password too weak',
            });
        });

        it('Should return 409 if email is already registered', async () => {
            const userData = createUser();
            await request(app).post('/auth/register').send(userData); // Register first

            const response = await request(app)
                .post('/auth/register')
                .send(userData); // Attempt to register again
            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                error: 'Email already registered',
            });
        });
    });
});