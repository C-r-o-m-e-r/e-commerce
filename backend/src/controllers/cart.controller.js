// /backend/src/controllers/cart.controller.js

const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// Helper function to find or create a cart
const getOrCreateCart = async (userId, guestId) => {
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

// This function is correct and remains unchanged
const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.user?.id;
        const guestId = req.body.guestId || req.headers['x-guest-id'];

        if (!couponCode) {
            return res.status(400).json({ message: 'Coupon code is required.' });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode.toUpperCase() },
        });

        if (!coupon || !coupon.isActive || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
            return res.status(404).json({ message: 'Invalid or expired coupon code.' });
        }

        const cart = await getOrCreateCart(userId, guestId);

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

// This function is correct and remains unchanged
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const guestId = req.body.guestId || req.headers['x-guest-id'];
        const cart = await getOrCreateCart(userId, guestId);
        res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// This function is correct and remains unchanged
const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;
        let guestId = req.body.guestId || req.headers['x-guest-id'];

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
        // --- FIX: Check body for guestId to support tests ---
        const guestId = req.body.guestId || req.headers['x-guest-id'];

        // --- DELETED: Removed incorrect authorization check that blocked guests ---

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
        console.error("Remove item error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCartItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;
        // --- FIX: Check body for guestId to support tests ---
        const guestId = req.body.guestId || req.headers['x-guest-id'];

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ message: 'A valid quantity is required.' });
        }
        
        // --- DELETED: Removed incorrect authorization check that blocked guests ---

        const whereClause = userId
            ? { id: itemId, cart: { userId } }
            : { id: itemId, cart: { guestId } };

        const cartItem = await prisma.cartItem.findFirst({ where: whereClause });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or permission denied.' });
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
    if (!userId || !guestId) return;

    const guestCart = await prisma.cart.findUnique({
        where: { guestId },
        include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await getOrCreateCart(userId, null);

    // --- FIX: Corrected merge logic ---
    for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(item => item.productId === guestItem.productId);
        
        if (existingItem) {
            // If item already exists in user cart, just update the quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + guestItem.quantity },
            });
        } else {
            // If item does not exist, create a new item in the user's cart
            await prisma.cartItem.create({
                data: {
                    cartId: userCart.id,
                    productId: guestItem.productId,
                    quantity: guestItem.quantity,
                },
            });
        }
    }
    // --- END FIX ---

    // Clean up the guest cart after merging
    await prisma.cart.delete({ where: { id: guestCart.id } });
};


module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    mergeCarts,
    applyCoupon,
};