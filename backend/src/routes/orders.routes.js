// backend/src/routes/orders.routes.js

const express = require('express');
// We only import functions for BUYERS from the orders controller
const { getUserOrders, getOrderById } = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes in this file are for authenticated users
router.use(authMiddleware);

// --- Routes for Buyers ---

// Route for a buyer to get their list of all orders
router.get('/', getUserOrders);

// Route for a buyer to get a single one of their orders by ID
router.get('/:id', getOrderById);

/*
NOTE: Seller-related routes (like GET /seller and PATCH /:id/status) 
have been moved to `seller.routes.js` to keep the code organized.
*/

module.exports = router;