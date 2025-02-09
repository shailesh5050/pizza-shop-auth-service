import request from 'supertest';
import app from '../../src/app';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { DataSource } from 'typeorm';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
import { Config } from '../../src/config';
import { verify } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';

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

        it('Should set proper cookies with correct attributes', async () => {
            const userData = createUser({ email: 'cookie.test@gmail.com' });
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.length).toBe(2);

            // Validate access token cookie
            const accessTokenCookie = (cookies as unknown as string[]).find(c => c.startsWith('accessToken='));
            expect(accessTokenCookie).toBeDefined();
            expect(accessTokenCookie).toContain('Domain=localhost');
            expect(accessTokenCookie).toContain('SameSite=Strict');
            expect(accessTokenCookie).toContain('Max-Age=3600');

            // Validate refresh token cookie
            const refreshTokenCookie = (cookies as unknown as string[]).find(c => c.startsWith('refreshToken='));
            expect(refreshTokenCookie).toBeDefined();
            expect(refreshTokenCookie).toContain('Domain=localhost');
            expect(refreshTokenCookie).toContain('SameSite=Strict');
            expect(refreshTokenCookie).toContain('Max-Age=31536000');
        });

        it('Should generate valid JWT tokens', async () => {
            const userData = createUser({ email: 'token.test@gmail.com' });
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const cookies = response.headers['set-cookie'];
            const accessTokenCookie = (cookies as unknown as string[]).find(c => c.startsWith('accessToken='));
            const refreshTokenCookie = (cookies as unknown as string[]).find(c => c.startsWith('refreshToken='));

            // Extract tokens
            const accessToken = accessTokenCookie?.split(';')[0].split('=')[1];
            const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];

            // Verify access token
            const publicKey = readFileSync(
                path.join(__dirname, '../../certs/public.pem'),
                'utf-8'
            );
            const decodedAccessToken = verify(accessToken!, publicKey);
            expect(decodedAccessToken).toBeDefined();
            expect((decodedAccessToken as { email: string }).email).toBe(userData.email);
            expect((decodedAccessToken as { role: string }).role).toBe('customer');

            // Verify refresh token
            const decodedRefreshToken = verify(refreshToken!, Config.REFRESH_TOKEN!);
            expect(decodedRefreshToken).toBeDefined();
            expect((decodedRefreshToken as { email: string }).email).toBe(userData.email);
            expect((decodedRefreshToken as { role: string }).role).toBe('customer');
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

        it('Should handle database connection errors gracefully', async () => {
            // Temporarily break the database connection
            await connection.destroy();

            const response = await request(app)
                .post('/auth/register')
                .send(createUser({ email: 'db.error@test.com' }));

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');

            // Restore the connection for other tests
            await connection.initialize();
        });
    });
});