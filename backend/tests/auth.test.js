// /backend/tests/auth.test.js

const request = require('supertest');
const { app } = require('../src/index'); // FIX: We only need 'app' now, not 'server'
const prisma = require('../src/config/prisma');

// We run tests in a describe block to group them
describe('Auth Endpoints', () => {

    // Before all tests, we can clean the database to ensure a fresh start
    beforeAll(async () => {
        await prisma.user.deleteMany({});
    });
    
    // --- DELETED: The afterAll block is no longer needed here ---

    // Test Case 1: User Registration
    describe('POST /api/auth/register', () => {
        it('should register a new user and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                });
            
            // Assertions: We check if the server responded correctly
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('testuser@example.com');
        });

        it('should fail to register a user with an existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@example.com', // Using the same email as the test above
                    password: 'password123',
                    firstName: 'Another',
                    lastName: 'User'
                });

            expect(res.statusCode).toEqual(409); // 409 Conflict
            expect(res.body.message).toBe('User with this email already exists');
        });
    });

    // Test Case 2: User Login
    describe('POST /api/auth/login', () => {
        it('should log in an existing user and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('testuser@example.com');
        });

        it('should fail to log in with incorrect credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401); // 401 Unauthorized
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});