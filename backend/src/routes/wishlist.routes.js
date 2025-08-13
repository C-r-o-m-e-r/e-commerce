// backend/src/routes/wishlist.routes.js

const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
    getWishlists,
    createWishlist,
    deleteWishlist,
    getWishlistById,
    updateWishlist, // 1. Import the new controller function
    addItemToWishlist,
    removeItemFromWishlist,
    removeItemFromWishlistByProduct,
} = require('../controllers/wishlist.controller');

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// --- Wishlist Management ---
router.get('/', getWishlists);
router.post('/', createWishlist);
router.get('/:id', getWishlistById);
router.patch('/:id', updateWishlist); // 2. Add the new PATCH route for updating
router.delete('/:id', deleteWishlist);


// --- Wishlist Item Management ---
router.post('/:id/items', addItemToWishlist);
router.delete('/:id/items/:itemId', removeItemFromWishlist);
router.delete('/items/by-product/:productId', removeItemFromWishlistByProduct);

module.exports = router;