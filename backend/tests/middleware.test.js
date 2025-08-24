// /backend/tests/middleware.test.js

const request = require('supertest');
const express = require('express');
const { authMiddleware } = require('../src/middleware/auth.middleware');
const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');

// Create a small, temporary Express app just for testing the middleware
const app = express();
// A dummy protected route that our middleware will guard
app.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ user: req.user });
});

describe('Auth Middleware', () => {

    it('should return 401 if no token is provided', async () => {
        const res = await request(app).get('/protected');
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Unauthorized: No token provided');
    });

    it('should return 401 if the token is invalid or malformed', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer an-invalid-token');
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Unauthorized: Invalid token');
    });

    it('should return 401 if the user in the token does not exist', async () => {
        // Create a token for a user ID that we know doesn't exist
        const fakeUserId = 'cl_fake_user_id_12345';
        const nonExistentUserToken = jwt.sign({ userId: fakeUserId }, process.env.JWT_SECRET);

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${nonExistentUserToken}`);

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Unauthorized: User not found');
    });

    it('should call next() if the token is valid and user exists', async () => {
        // Create a real user and a valid token
        const user = await prisma.user.create({
            data: {
                email: 'middleware.test@example.com',
                password: 'password',
                role: 'BUYER'
            }
        });
        const validToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${validToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.id).toBe(user.id);

        // Clean up the user
        await prisma.user.delete({ where: { id: user.id } });
    });
});