const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    getWishlists,
    createWishlist,
    deleteWishlist,
    getWishlistById,
    addItemToWishlist,
    removeItemFromWishlist,
    removeItemFromWishlistByProduct, // 1. Import the new controller
} = require('../controllers/wishlist.controller');

const router = express.Router();

router.use(authMiddleware);

// --- Wishlist Management ---
router.get('/', getWishlists);
router.post('/', createWishlist);
router.delete('/:id', deleteWishlist);
router.get('/:id', getWishlistById);

// --- Wishlist Item Management ---
router.post('/:id/items', addItemToWishlist);
router.delete('/:id/items/:itemId', removeItemFromWishlist);
// 2. Add the new route for removing by Product ID
router.delete('/items/by-product/:productId', removeItemFromWishlistByProduct);

module.exports = router;