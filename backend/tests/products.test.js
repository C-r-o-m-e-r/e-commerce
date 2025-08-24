// /backend/tests/products.test.js

const request = require('supertest');
const { app } = require('../src/index');
const prisma = require('../src/config/prisma');

describe('Product Endpoints', () => {
    let sellerToken, adminToken, testCategory, approvedProduct, pendingProduct;

    // Before all tests, set up the database
    beforeAll(async () => {
        // Clean up previous test data
        await prisma.orderItem.deleteMany({});
        await prisma.cartItem.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});

        testCategory = await prisma.category.create({
            data: { name: 'Test Category' },
        });

        // Create and log in as a SELLER
        const sellerRegisterRes = await request(app).post('/api/auth/register').send({
            email: 'seller.product@example.com',
            password: 'password123',
            firstName: 'Product',
            lastName: 'Seller',
            role: 'SELLER'
        });
        sellerToken = sellerRegisterRes.body.token;
        const sellerId = sellerRegisterRes.body.user.id;

        // Create and log in as an ADMIN
        await request(app).post('/api/auth/register').send({
            email: 'admin.product@example.com',
            password: 'password123',
            firstName: 'Product',
            lastName: 'Admin',
            role: 'ADMIN'
        });
        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'admin.product@example.com',
            password: 'password123'
        });
        adminToken = adminLoginRes.body.token;

        // Create one product that is APPROVED and one that is PENDING
        approvedProduct = await prisma.product.create({
            data: { title: 'Approved Product', description: '...', price: 10, stock: 10, status: 'APPROVED', sellerId, categoryId: testCategory.id }
        });
        pendingProduct = await prisma.product.create({
            data: { title: 'Pending Product', description: '...', price: 20, stock: 5, status: 'PENDING', sellerId, categoryId: testCategory.id }
        });
    });

    // --- NEW: Public Product Endpoints ---
    describe('Public Product Endpoints', () => {
        it('should get a list of only APPROVED products', async () => {
            const res = await request(app).get('/api/products');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.products).toBeInstanceOf(Array);
            expect(res.body.products.length).toBe(1); // Should only find the one approved product
            expect(res.body.products[0].title).toBe('Approved Product');
        });

        it('should get a single product by its ID', async () => {
            const res = await request(app).get(`/api/products/${approvedProduct.id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe('Approved Product');
        });
    });


    // --- Existing Seller and Admin Tests (Unchanged) ---
    describe('Seller and Admin Product Endpoints', () => {
        it('should allow a SELLER to create a product', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${sellerToken}`)
                .field('title', 'New Test Product')
                .field('description', 'A great product for testing')
                .field('price', 19.99)
                .field('stock', 100)
                .field('categoryId', testCategory.id);
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('PENDING');
        });
        
        it('should allow an ADMIN to update any product', async () => {
            const res = await request(app)
                .put(`/api/products/${approvedProduct.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('price', 25.99);

            expect(res.statusCode).toEqual(200);
            expect(res.body.price).toBe(25.99);
        });
        
        it('should allow an ADMIN to change a product status', async () => {
            const res = await request(app)
                .patch(`/api/admin/products/${pendingProduct.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'APPROVED' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('APPROVED');
        });

        it('should allow an ADMIN to delete any product', async () => {
            const res = await request(app)
                .delete(`/api/products/${approvedProduct.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(204);
        });
    });
});