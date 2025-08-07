const prisma = require('../config/prisma');

// Get all wishlists for the logged-in user
const getWishlists = async (req, res) => {
    try {
        const wishlists = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
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

        await prisma.wishlistItem.create({
            data: {
                wishlistId,
                productId,
            },
        });

        res.status(201).json({ message: 'Item added to wishlist.' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'This item is already in your wishlist.' });
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

// --- START: New function added ---
// Remove an item from any of the user's wishlists using the Product ID
const removeItemFromWishlistByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Find the specific wishlist item that connects this user and product
        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                productId: productId,
                wishlist: { userId: userId },
            },
        });

        // If it doesn't exist, it's not an error, the action is complete.
        if (!wishlistItem) {
            return res.status(204).send();
        }

        // If it exists, delete it
        await prisma.wishlistItem.delete({
            where: { id: wishlistItem.id },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Remove by product ID error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// --- END: New function added ---

module.exports = {
    getWishlists,
    createWishlist,
    deleteWishlist,
    getWishlistById,
    addItemToWishlist,
    removeItemFromWishlist,
    removeItemFromWishlistByProduct, // --- Added to exports ---
};