// /backend/tests/cart.test.js

const request = require('supertest');
const { app } = require('../src/index');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

describe('Cart Endpoints', () => {
    let buyerToken, testProduct, sellerUser;

    beforeAll(async () => {
        // Clean up all relevant tables
        await prisma.cartItem.deleteMany({});
        await prisma.cart.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create a SELLER to own the product
        sellerUser = await prisma.user.create({
            data: {
                email: 'seller.cart@example.com', password: hashedPassword, role: 'SELLER',
                firstName: 'Cart', lastName: 'Seller'
            }
        });

        // Create a BUYER and get their token
        await prisma.user.create({
            data: {
                email: 'buyer.cart@example.com', password: hashedPassword, role: 'BUYER',
                firstName: 'Cart', lastName: 'Buyer'
            }
        });
        const buyerLoginRes = await request(app).post('/api/auth/login').send({
            email: 'buyer.cart@example.com', password: 'password123'
        });
        buyerToken = buyerLoginRes.body.token;

        // Create a Category and a Product
        const category = await prisma.category.create({ data: { name: 'Cart Test Category' } });
        testProduct = await prisma.product.create({
            data: {
                title: 'Cart Test Product', description: 'desc', price: 50,
                stock: 20, status: 'APPROVED',
                sellerId: sellerUser.id,
                categoryId: category.id
            }
        });
    });

    describe('Guest Cart Functionality', () => {
        let guestId = uuidv4();
        let cartItemId;

        it('should add an item to a guest cart', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .send({
                    guestId: guestId,
                    productId: testProduct.id,
                    quantity: 2
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.items[0].productId).toBe(testProduct.id);
            expect(res.body.items[0].quantity).toBe(2);
            cartItemId = res.body.items[0].id; // Save for next tests
        });

        it('should update an item quantity in a guest cart', async () => {
            const res = await request(app)
                .put(`/api/cart/items/${cartItemId}`)
                .send({
                    guestId: guestId,
                    quantity: 5
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.items[0].quantity).toBe(5);
        });

        it('should remove an item from a guest cart', async () => {
            const res = await request(app)
                .delete(`/api/cart/items/${cartItemId}`)
                .send({ guestId: guestId });

            expect(res.statusCode).toEqual(204);
        });
    });

    describe('Authenticated User Cart & Merging', () => {
        it('should add an item to an authenticated user cart', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    productId: testProduct.id,
                    quantity: 1
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.items.length).toBe(1);
        });

        it('should merge a guest cart with a user cart upon login', async () => {
            // 1. Create a new guest cart with a unique item
            const guestId = uuidv4();
            const anotherProduct = await prisma.product.create({
                data: { title: 'Guest Cart Product', description: '...', price: 10, stock: 10, status: 'APPROVED', sellerId: sellerUser.id, categoryId: testProduct.categoryId }
            });
            await request(app).post('/api/cart/items').send({
                guestId: guestId,
                productId: anotherProduct.id,
                quantity: 3
            });

            // 2. Log in as the buyer, passing the guestId to trigger the merge
            await request(app).post('/api/auth/login').send({
                email: 'buyer.cart@example.com',
                password: 'password123',
                guestId: guestId
            });

            // 3. Get the authenticated user's cart and check if it has both items
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${buyerToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.items.length).toBe(2); // Should have the original item AND the merged guest item
        });
    });
});