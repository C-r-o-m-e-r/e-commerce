// backend/src/routes/orders.routes.js

const express = require('express');
const { createOrder, getUserOrders, getOrderById } = require('../controllers/orders.controller'); // 1. Import getOrderById
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All order routes are protected
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById); // 2. Add the new route for a single order

module.exports = router;