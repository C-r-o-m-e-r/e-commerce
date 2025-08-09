// backend/src/routes/orders.routes.js

const express = require('express');
// We no longer import createOrder here
const { getUserOrders, getOrderById } = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All order routes are protected
router.use(authMiddleware);

// The POST route is removed because orders are now created via the payment webhook
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;