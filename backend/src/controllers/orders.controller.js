// backend/src/controllers/orders.controller.js

const prisma = require('../config/prisma');

// Get all orders for the current BUYER
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
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a single order by its ID for the current BUYER
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id: id,
                buyerId: userId
            },
            include: {
                items: true
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


// --- Functions for SELLERS ---

// Get all orders that contain products sold by the current SELLER
const getSellerOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            sellerId: userId,
                        },
                    },
                },
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid order status.' });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: id,
                items: {
                    some: {
                        product: {
                            sellerId: userId,
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or you are not the seller for any items in this order.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: id },
            data: { status: status },
        });

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    getUserOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
};