// backend/src/controllers/wishlist.controller.js

const prisma = require('../config/prisma');

// Get all wishlists for the logged-in user
const getWishlists = async (req, res) => {
    try {
        const wishlists = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
                // FIX: Include the actual items to check against on the product page
                items: {
                    select: {
                        productId: true,
                        // Include nested product if your robust check uses `item.product.id`
                        product: {
                            select: { id: true }
                        }
                    }
                },
                _count: {
                    select: { items: true },
                },
            },
        });
        res.status(200).json(wishlists);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a single wishlist by its ID, including its items
const getWishlistById = async (req, res) => {
    try {
        const { id } = req.params;
        const wishlist = await prisma.wishlist.findFirst({
            where: { id, userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Create a new wishlist
const createWishlist = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Wishlist name is required.' });
        }
        const newWishlist = await prisma.wishlist.create({
            data: {
                name,
                userId: req.user.id,
            },
        });
        res.status(201).json(newWishlist);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- START: New function to update a wishlist's name ---
const updateWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Wishlist name cannot be empty.' });
        }

        // First, find the wishlist to ensure it belongs to the user
        const wishlistToUpdate = await prisma.wishlist.findUnique({
            where: { id },
        });

        if (!wishlistToUpdate) {
            return res.status(404).json({ message: 'Wishlist not found.' });
        }

        if (wishlistToUpdate.userId !== userId) {
            // This is a security check to prevent users from editing others' wishlists
            return res.status(403).json({ message: 'You do not have permission to edit this wishlist.' });
        }

        // If all checks pass, update the wishlist
        const updatedWishlist = await prisma.wishlist.update({
            where: { id: id },
            data: { name: name },
        });

        res.status(200).json(updatedWishlist);
    } catch (error) {
        console.error("Error updating wishlist:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// --- END: New function ---


// Delete a wishlist
const deleteWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const wishlist = await prisma.wishlist.findFirst({
            where: { id, userId: req.user.id },
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found or you do not have permission to delete it.' });
        }

        await prisma.wishlist.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a product to a wishlist
const addItemToWishlist = async (req, res) => {
    try {
        const { id: wishlistId } = req.params;
        const { productId } = req.body;

        const wishlist = await prisma.wishlist.findFirst({
            where: { id: wishlistId, userId: req.user.id },
        });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found.' });
        }

        const newItem = await prisma.wishlistItem.create({
            data: {
                wishlistId,
                productId,
            },
        });

        res.status(201).json(newItem);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'This item is already in this wishlist.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove an item from a wishlist using the WishlistItem ID
const removeItemFromWishlist = async (req, res) => {
    try {
        const { itemId } = req.params;

        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                id: itemId,
                wishlist: { userId: req.user.id },
            },
        });

        if (!wishlistItem) {
            return res.status(404).json({ message: 'Wishlist item not found.' });
        }

        await prisma.wishlistItem.delete({ where: { id: itemId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove an item from any of the user's wishlists using the Product ID
const removeItemFromWishlistByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                productId: productId,
                wishlist: { userId: userId },
            },
        });

        if (!wishlistItem) {
            return res.status(204).send();
        }

        await prisma.wishlistItem.delete({
            where: { id: wishlistItem.id },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Remove by product ID error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getWishlists,
    createWishlist,
    deleteWishlist,
    getWishlistById,
    updateWishlist, // --- Added to exports ---
    addItemToWishlist,
    removeItemFromWishlist,
    removeItemFromWishlistByProduct,
};