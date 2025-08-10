// backend/src/controllers/seller.controller.js

const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const orders = await prisma.order.findMany({
            where: {
                status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
                items: {
                    some: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                },
            },
            include: {
                items: {
                    where: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                },
            },
        });

        let totalRevenue = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                totalRevenue += item.price * item.quantity;
            });
        });

        const salesCount = orders.length;

        const lowStockProducts = await prisma.product.findMany({
            where: {
                sellerId: sellerId,
                stock: {
                    gt: 0,
                    lt: 5,
                },
            },
            orderBy: {
                stock: 'asc',
            },
            take: 5,
        });

        const recentOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 5,
            include: {
                items: {
                    where: {
                        product: {
                            sellerId: sellerId
                        }
                    }
                }
            }
        });

        res.status(200).json({
            totalRevenue: totalRevenue.toFixed(2),
            salesCount,
            lowStockProducts,
            recentOrders,
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getSellerOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id: id,
                items: {
                    some: {
                        product: {
                            sellerId: sellerId,
                        },
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                buyer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or you are not the seller for any items in this order.' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Get seller order by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
    getDashboardStats,
    getSellerOrderById,
    getSellerOrders,
    updateOrderStatus,
};