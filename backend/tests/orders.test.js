// /backend/tests/orders.test.js

const request = require('supertest');

const mockRefundCreate = jest.fn();

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => {
        return {
            refunds: {
                create: mockRefundCreate,
            },
        };
    });
});

const { app } = require('../src/index');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');


describe('Admin Order Endpoints', () => {
    let adminToken, testProduct, testBuyer, testOrder;

    beforeAll(async () => {
        // Clean up database
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await prisma.user.create({
            data: {
                email: 'admin.order@example.com', password: hashedPassword, role: 'ADMIN',
                firstName: 'Order', lastName: 'Admin'
            }
        });
        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'admin.order@example.com', password: 'password123'
        });
        adminToken = adminLoginRes.body.token;

        testBuyer = await prisma.user.create({
            data: {
                email: 'buyer.order@example.com', password: hashedPassword, role: 'BUYER',
                firstName: 'Order', lastName: 'Buyer'
            }
        });

        const category = await prisma.category.create({ data: { name: 'Order Test Category' }});
        testProduct = await prisma.product.create({
            data: {
                title: 'Order Test Product', description: 'desc', price: 100,
                stock: 10, status: 'APPROVED',
                sellerId: testBuyer.id,
                categoryId: category.id
            }
        });

        testOrder = await prisma.order.create({
            data: {
                buyer: { connect: { id: testBuyer.id } },
                total: 100,
                status: 'PAID',
                paymentIntentId: "pi_test_123456",
                items: {
                    create: {
                        productId: testProduct.id,
                        title: testProduct.title,
                        price: testProduct.price,
                        quantity: 1
                    }
                }
            }
        });
    });

    beforeEach(() => {
        // Reset the mock before each test
        mockRefundCreate.mockClear();
        // Set the mock's return value for this test
        mockRefundCreate.mockResolvedValue({ id: 're_mock_123', status: 'succeeded' });
    });

    it('should allow an ADMIN to get a list of all orders', async () => {
        const res = await request(app)
            .get('/api/admin/orders')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.orders[0].id).toBe(testOrder.id);
    });

    it('should allow an ADMIN to get a single order by ID', async () => {
        const res = await request(app)
            .get(`/api/admin/orders/${testOrder.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(testOrder.id);
    });

    it('should allow an ADMIN to update an order status', async () => {
        const res = await request(app)
            .patch(`/api/admin/orders/${testOrder.id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'SHIPPED' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('SHIPPED');
    });

    it('should allow an ADMIN to refund an order', async () => {
        const res = await request(app)
            .post(`/api/admin/orders/${testOrder.id}/refund`)
            .set('Authorization', `Bearer ${adminToken}`);
            
        expect(res.statusCode).toEqual(200);
        expect(res.body.order.status).toBe('REFUNDED');
        expect(mockRefundCreate).toHaveBeenCalledWith({
            payment_intent: 'pi_test_123456'
        });
    });
});