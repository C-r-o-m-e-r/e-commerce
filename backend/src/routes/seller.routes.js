// backend/src/routes/seller.routes.js

const express = require('express');
const { getDashboardStats, getSellerOrders, getSellerOrderById, updateOrderStatus } = require('../controllers/seller.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// All routes in this file are for sellers only
router.use(authMiddleware, roleMiddleware('SELLER'));

// Route for dashboard statistics
router.get('/dashboard', getDashboardStats);

// Routes for managing sales/orders
router.get('/orders', getSellerOrders);
router.get('/orders/:id', getSellerOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;