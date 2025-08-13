// backend/src/routes/orders.routes.js

const express = require('express');
const { getUserOrders, getOrderById } = require('../controllers/orders.controller');
// FIX: Use destructuring { } to import the specific middleware function
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes in this file are for authenticated users
router.use(authMiddleware);

// --- Routes for Buyers ---

// Route for a buyer to get their list of all orders
router.get('/', getUserOrders);

// Route for a buyer to get a single one of their orders by ID
router.get('/:id', getOrderById);

module.exports = router;