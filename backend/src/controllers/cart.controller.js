// backend/src/controllers/cart.controller.js

const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid'); // We'll need this for guest IDs

// Helper function to find or create a cart for a user or guest
const getOrCreateCart = async (userId, guestId) => {
    let cart;

    if (userId) {
        // Logged-in user logic
        cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }
    } else if (guestId) {
        // Guest user logic
        cart = await prisma.cart.findUnique({
            where: { guestId },
            include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { guestId },
                include: { items: { include: { product: true } } },
            });
        }
    } else {
        // No user and no guest ID - create a new guest cart
        const newGuestId = uuidv4();
        cart = await prisma.cart.create({
            data: { guestId: newGuestId },
            include: { items: { include: { product: true } } },
        });
    }

    return cart;
};

// Get the current user's or guest's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id']; // Frontend will send this header
        const cart = await getOrCreateCart(userId, guestId);
        res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add an item to the cart
const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;
        let guestId = req.headers['x-guest-id'];

        if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ message: 'Valid productId and quantity are required.' });
        }

        const cart = await getOrCreateCart(userId, guestId);

        // If a new guest cart was created, we need to send the new guestId back
        if (!userId && !guestId) {
            guestId = cart.guestId;
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity },
            });
        }

        const updatedCart = await getOrCreateCart(userId, guestId);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Add item error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove an item from the cart
const removeItemFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];

        if (!userId && !guestId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const whereClause = userId
            ? { id: itemId, cart: { userId } }
            : { id: itemId, cart: { guestId } };

        const cartItem = await prisma.cartItem.findFirst({ where: whereClause });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or permission denied' });
        }

        await prisma.cartItem.delete({ where: { id: itemId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an item's quantity in the cart
const updateCartItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ message: 'A valid quantity is required.' });
        }
        if (!userId && !guestId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const whereClause = userId
            ? { id: itemId, cart: { userId } }
            : { id: itemId, cart: { guestId } };

        const cartItem = await prisma.cartItem.findFirst({ where: whereClause });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        if (quantity === 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
        } else {
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity: quantity },
            });
        }

        const updatedCart = await getOrCreateCart(userId, guestId);
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Update quantity error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- NEW FUNCTION TO MERGE CARTS ON LOGIN ---
const mergeCarts = async (userId, guestId) => {
    if (!userId || !guestId) return;

    const guestCart = await prisma.cart.findUnique({
        where: { guestId },
        include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await getOrCreateCart(userId, null);

    for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(item => item.productId === guestItem.productId);

        if (existingItem) {
            // If item exists in user's cart, just add the quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + guestItem.quantity },
            });
        } else {
            // If item does not exist, move it to the user's cart
            await prisma.cartItem.update({
                where: { id: guestItem.id },
                data: { cartId: userCart.id },
            });
        }
    }

    // After merging, delete the now-empty guest cart
    // We must first delete the items that were not moved (if any)
    await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await prisma.cart.delete({ where: { id: guestCart.id } });
};


module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    mergeCarts, // Export the new merge function
};