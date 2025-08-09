// backend/src/controllers/orders.controller.js

const prisma = require('../config/prisma');

// Create an order from the user's cart
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        const total = cart.items.reduce((acc, item) => {
            return acc + item.quantity * item.product.price;
        }, 0);

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    buyerId: userId,
                    total,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            title: item.product.title,
                            price: item.product.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {
                    items: true
                }
            });

            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all orders for the current user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { buyerId: userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- START: New function to get a single order by ID ---
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id: id,
                buyerId: userId // Security check: ensure the user owns this order
            },
            include: {
                items: true // Include the items associated with the order
            },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// --- END: New function ---

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById, // --- Added to exports ---
};