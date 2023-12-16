import request from 'supertest';
import app from '../../src/app';
describe('POST /auth/register', () => {
    describe('Given a valid request', () => {
        it('Should return a 200 status code', async () => {
            ///AAA
            //Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@gmail.com',
                password: '123456',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.status).toBe(200);
        });

        //validating the response body json data
        it("should return a valid json response body", async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@gmail.com',
                password: '123456',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(response.body).toEqual({ message: 'register' });
        }
        );

        it("should persist the user in the database", async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: '',
                password: '123456',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //Assert
            
        }
        );

    });
    describe('Given an invalid request', () => {});
});
