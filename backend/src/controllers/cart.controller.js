// backend/src/controllers/cart.controller.js

const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// Helper function to find or create a cart
const getOrCreateCart = async (userId, guestId) => {
    // ... (This helper function remains the same)
    let cart;
    if (userId) {
        cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } }, appliedCoupon: true },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } }, appliedCoupon: true },
            });
        }
    } else if (guestId) {
        cart = await prisma.cart.findUnique({
            where: { guestId },
            include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } }, appliedCoupon: true },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { guestId },
                include: { items: { include: { product: true } }, appliedCoupon: true },
            });
        }
    } else {
        const newGuestId = uuidv4();
        cart = await prisma.cart.create({
            data: { guestId: newGuestId },
            include: { items: { include: { product: true } }, appliedCoupon: true },
        });
    }
    return cart;
};

// --- START: NEW FUNCTION ---
// @desc    Apply a coupon to the cart
// @route   POST /api/cart/apply-coupon
// @access  Public (Guest or User)
const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];

        if (!couponCode) {
            return res.status(400).json({ message: 'Coupon code is required.' });
        }

        // Find the coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode.toUpperCase() },
        });

        // Validate the coupon
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code.' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active.' });
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This coupon has expired.' });
        }

        // Get the user's or guest's cart
        const cart = await getOrCreateCart(userId, guestId);

        // Apply the coupon to the cart
        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: { appliedCouponId: coupon.id },
            include: { items: { include: { product: true } }, appliedCoupon: true },
        });

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Apply coupon error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// --- END: NEW FUNCTION ---


// All other functions (getCart, addItemToCart, etc.) remain the same
// ...

const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];
        const cart = await getOrCreateCart(userId, guestId);
        res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;
        let guestId = req.headers['x-guest-id'];

        if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ message: 'Valid productId and quantity are required.' });
        }

        const cart = await getOrCreateCart(userId, guestId);

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

const mergeCarts = async (userId, guestId) => {
    // ... (This function remains the same)
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
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + guestItem.quantity },
            });
        } else {
            await prisma.cartItem.update({
                where: { id: guestItem.id },
                data: { cartId: userCart.id },
            });
        }
    }
    await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await prisma.cart.delete({ where: { id: guestCart.id } });
};


module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    mergeCarts,
    applyCoupon, // Export the new function
};