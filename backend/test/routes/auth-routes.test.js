const express = require('express');
const request = require('supertest');
const authRoutes = require('../../src/routes/v1/auth-routes');
const authController = require('../../src/controllers/auth-controller');
jest.mock('../../src/controllers/auth-controller');
const app = express();
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
describe('Auth Routes', () => {
    test('should call authController.signup on POST /signup', async () => {
        authController.signup.mockImplementation((req, res) => res.status(200).json({
                success: true,
                message: 'User signed up successfully',
                data: { id: 1, email: 'I5BZP@example.com', name: 'John Doe' },
                err: {} 
            }));
        const response = await request(app)
            .post('/api/v1/auth/signup')
            .send({
                email: 'I5BZP@example.com',
                password: 'password123',
                name: 'John Doe'
            });
        expect(response.status).toBe(200);
        expect(authController.signup).toHaveBeenCalled();
    });
});