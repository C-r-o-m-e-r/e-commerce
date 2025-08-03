// backend/src/routes/cart.routes.js

const express = require('express');
const { 
  getCart, 
  addItemToCart, 
  removeItemFromCart,
  updateCartItemQuantity // 1. Import the new controller function
} = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All cart routes are protected and require a logged-in user
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItemQuantity); // 2. Add the new route for updating
router.delete('/items/:itemId', removeItemFromCart);

module.exports = router;