// backend/tests/e2e/products.test.js

const request = require('supertest');
const app = require('../../src/app'); // Import your Express app

describe('Products API', () => {
    // Test case for GET /api/products
    it('should return a list of products with a 200 status code', async () => {
        const response = await request(app)
            .get('/api/products')
            .expect('Content-Type', /json/)
            .expect(200);

        // Check that the response body has the structure we expect
        expect(response.body).toHaveProperty('products');
        expect(Array.isArray(response.body.products)).toBe(true);
    });

    // You can add more tests here later, e.g., for getting a single product
});