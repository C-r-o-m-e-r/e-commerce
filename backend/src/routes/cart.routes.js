// backend/src/routes/cart.routes.js

const express = require('express');
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity
} = require('../controllers/cart.controller');
// 1. Import the 'optionalAuthMiddleware' from the middleware file
const { optionalAuthMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 2. Use the optional middleware for all cart routes
// This will attach req.user if a token is provided, but won't fail if it's not.
router.use(optionalAuthMiddleware);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItemQuantity);
router.delete('/items/:itemId', removeItemFromCart);

module.exports = router;