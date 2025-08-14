// backend/src/routes/cart.routes.js

const express = require('express');
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    applyCoupon // <-- Make sure this is imported
} = require('../controllers/cart.controller');
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(optionalAuthMiddleware);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItemQuantity);
router.delete('/items/:itemId', removeItemFromCart);

// Make sure this line exists
router.post('/apply-coupon', applyCoupon);

module.exports = router;