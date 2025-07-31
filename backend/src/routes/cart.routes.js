const express = require('express');
const { getCart, addItemToCart, removeItemFromCart } = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All cart routes are protected and require a logged-in user
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.delete('/items/:itemId', removeItemFromCart);

module.exports = router;