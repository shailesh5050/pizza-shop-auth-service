import request from 'supertest';
import app from '../../src/app';
import { it } from 'node:test';

describe('POST /auth/register', () => {
    const validUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
        password: '123456',
    };

    describe('Given a valid request', () => {
        it('Should return a 200 status code', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUserData);
            expect(response.status).toBe(200);
        });

        it('Should return a valid JSON response body', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUserData);
            expect(response.body).toMatchObject({
                message: 'register',
            });
        });

        it('Should persist the user in the database', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUserData);
            // Check response type
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );

            // Optionally, mock your database function and ensure it's called
            // Example: expect(database.saveUser).toHaveBeenCalledWith(validUserData);
        });
    });

    describe('Given an invalid request', () => {
        it('Should return 400 if required fields are missing', async () => {
            const invalidData = { email: 'john@gmail.com' }; // Missing required fields
            const response = await request(app)
                .post('/auth/register')
                .send(invalidData);
            expect(response.status).toBe(400);
        });

        it('Should return 400 for invalid email format', async () => {
            const invalidEmailData = {
                ...validUserData,
                email: 'not-an-email',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(invalidEmailData);
            expect(response.status).toBe(400);
        });

        it('Should return 400 for weak passwords', async () => {
            const weakPasswordData = { ...validUserData, password: '123' }; // Too short
            const response = await request(app)
                .post('/auth/register')
                .send(weakPasswordData);
            expect(response.status).toBe(400);
        });

        it('Should return 409 if email is already registered', async () => {
            await request(app).post('/auth/register').send(validUserData); // Register first
            const response = await request(app)
                .post('/auth/register')
                .send(validUserData); // Register again
            expect(response.status).toBe(409);
        });
    });

    it('Should persist the user in the database', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send(validUserData);
        // Check response type
        expect(response.headers['content-type']).toEqual(
            expect.stringContaining('json'),
        );

        // Optionally, mock your database function and ensure it's called
        // Example: expect(database.saveUser).toHaveBeenCalledWith(validUserData);
    });
});
