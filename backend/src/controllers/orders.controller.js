// backend/src/controllers/orders.controller.js

const prisma = require('../config/prisma');

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

// Get a single order by its ID
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

module.exports = {
    getUserOrders,
    getOrderById,
};