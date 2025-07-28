const express = require('express');
const { createOrder, getUserOrders } = require('../controllers/orders.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All order routes are protected
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getUserOrders);

module.exports = router;