// /backend/tests/coupons.test.js

const request = require('supertest');
const { app } = require('../src/index'); // FIX: We only need 'app' now
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

describe('Coupon Endpoints', () => {
    let sellerToken, adminToken, testCoupon;

    beforeAll(async () => {
        await prisma.coupon.deleteMany({});
        await prisma.user.deleteMany({});
        const hashedPassword = await bcrypt.hash('password123', 10);

        await prisma.user.create({
            data: {
                email: 'seller.coupon@example.com',
                password: hashedPassword,
                firstName: 'Coupon',
                lastName: 'Seller',
                role: 'SELLER'
            }
        });
        const sellerLoginRes = await request(app).post('/api/auth/login').send({
            email: 'seller.coupon@example.com',
            password: 'password123'
        });
        sellerToken = sellerLoginRes.body.token;

        await prisma.user.create({
            data: {
                email: 'admin.coupon@example.com',
                password: hashedPassword,
                firstName: 'Coupon',
                lastName: 'Admin',
                role: 'ADMIN'
            }
        });
        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'admin.coupon@example.com',
            password: 'password123'
        });
        adminToken = adminLoginRes.body.token;
    });

    // --- DELETED: The afterAll block is no longer needed here ---

    describe('POST /api/coupons', () => {
        it('should allow a SELLER to create a new coupon', async () => {
            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    code: 'SUMMER25',
                    discountType: 'PERCENTAGE',
                    discountValue: 25,
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.code).toBe('SUMMER25');
            testCoupon = res.body;
        });
    });

    describe('GET /api/coupons', () => {
        it('should allow a SELLER to retrieve their own coupons', async () => {
            const res = await request(app)
                .get('/api/coupons')
                .set('Authorization', `Bearer ${sellerToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body[0].code).toBe('SUMMER25');
        });
    });

    describe('GET /api/admin/coupons', () => {
        it('should allow an ADMIN to retrieve all coupons', async () => {
            const res = await request(app)
                .get('/api/admin/coupons')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/coupons/:id', () => {
        it('should allow a SELLER to update their own coupon', async () => {
            const res = await request(app)
                .put(`/api/coupons/${testCoupon.id}`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({ isActive: false });
            expect(res.statusCode).toEqual(200);
            expect(res.body.isActive).toBe(false);
        });
    });

    describe('DELETE /api/admin/coupons/:id', () => {
        it('should allow an ADMIN to delete any coupon', async () => {
            const res = await request(app)
                .delete(`/api/admin/coupons/${testCoupon.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(204);
        });
    });
});