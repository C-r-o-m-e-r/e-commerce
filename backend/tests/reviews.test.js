// /backend/tests/reviews.test.js

const request = require('supertest');
const { app } = require('../src/index');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

describe('Review Endpoints', () => {
    let purchasingBuyerToken, nonPurchasingBuyerToken, testProduct;

    beforeAll(async () => {
        // Clean up database
        await prisma.review.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create a Seller to own the product
        const seller = await prisma.user.create({
            data: { email: 'seller.review@example.com', password: hashedPassword, role: 'SELLER' }
        });

        // 2. Create a Buyer who will "purchase" the product
        const purchasingBuyer = await prisma.user.create({
            data: { email: 'buyer.review@example.com', password: hashedPassword, role: 'BUYER' }
        });
        const buyerLoginRes = await request(app).post('/api/auth/login').send({
            email: 'buyer.review@example.com', password: 'password123'
        });
        purchasingBuyerToken = buyerLoginRes.body.token;
        
        // 3. Create another Buyer who will NOT purchase the product
        await prisma.user.create({
            data: { email: 'buyer.no-purchase@example.com', password: hashedPassword, role: 'BUYER' }
        });
        const nonBuyerLoginRes = await request(app).post('/api/auth/login').send({
            email: 'buyer.no-purchase@example.com', password: 'password123'
        });
        nonPurchasingBuyerToken = nonBuyerLoginRes.body.token;

        // 4. Create a Category and Product
        const category = await prisma.category.create({ data: { name: 'Review Test Category' } });
        testProduct = await prisma.product.create({
            data: { title: 'Review Test Product', description: 'desc', price: 10, stock: 5, status: 'APPROVED', sellerId: seller.id, categoryId: category.id }
        });

        // 5. Create an Order to simulate a purchase by the first buyer
        await prisma.order.create({
            data: {
                buyerId: purchasingBuyer.id,
                total: 10,
                status: 'COMPLETED', // The user has completed the purchase
                items: {
                    create: { productId: testProduct.id, title: testProduct.title, price: 10, quantity: 1 }
                }
            }
        });
    });

    it('should allow a user who purchased the item to leave a review', async () => {
        const res = await request(app)
            .post(`/api/reviews/${testProduct.id}`)
            .set('Authorization', `Bearer ${purchasingBuyerToken}`)
            .send({ rating: 5, comment: 'Great product!' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.rating).toBe(5);
        expect(res.body.comment).toBe('Great product!');
    });

    it('should NOT allow a user who has not purchased the item to leave a review', async () => {
        const res = await request(app)
            .post(`/api/reviews/${testProduct.id}`)
            .set('Authorization', `Bearer ${nonPurchasingBuyerToken}`)
            .send({ rating: 4, comment: 'Looks good but I cannot buy it.' });
            
        expect(res.statusCode).toEqual(403);
        // --- FIX: Updated the expected error message to match the actual server response ---
        expect(res.body.message).toBe('You can only review products you have purchased.');
    });

    it('should get all reviews for a product', async () => {
        const res = await request(app).get(`/api/reviews/${testProduct.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].rating).toBe(5);
    });

    it('should not allow a guest to leave a review', async () => {
        const res = await request(app)
            .post(`/api/reviews/${testProduct.id}`)
            .send({ rating: 1, comment: 'Guest review' });

        expect(res.statusCode).toEqual(401); // Unauthorized
    });
});