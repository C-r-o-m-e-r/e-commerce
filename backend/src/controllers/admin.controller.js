// /backend/src/controllers/admin.controller.js

const prisma = require('../config/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- USER MANAGEMENT FUNCTIONS ---

const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const where = {};
    if (role && ['BUYER', 'SELLER', 'ADMIN'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        _count: user._count,
    }));
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['BUYER', 'SELLER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account from the admin panel." });
    }
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const salesData = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED' },
    });
    const totalSales = salesData._sum.total || 0;
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { 
          select: { firstName: true, lastName: true },
        },
      },
    });
    const ordersWithUser = recentOrders.map(order => ({
        ...order,
        user: order.buyer,
    }));
    res.status(200).json({
      totalUsers,
      totalProducts,
      totalSales,
      recentOrders: ordersWithUser,
    });
  } catch (error) {
    console.error('Admin get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified' });
    }
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own status." });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUniqueOrThrow({
            where: { id },
            include: {
                orders: { 
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                products: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        res.status(200).json(user);
    } catch (error) {
        console.error('Admin get user by ID error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


// --- PRODUCT MANAGEMENT FUNCTIONS ---

const adminGetAllProducts = async (req, res) => {
    try {
        const { search, status, categoryId } = req.query;
        const where = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const products = await prisma.product.findMany({
            where,
            include: {
                seller: { select: { id: true, firstName: true, lastName: true } },
                category: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Admin get all products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminGetProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUniqueOrThrow({
            where: { id },
            include: {
                seller: { select: { id: true, firstName: true, lastName: true } },
                category: true,
            },
        });
        res.status(200).json(product);
    } catch (error) {
        console.error('Admin get product by ID error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminUpdateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, stock, categoryId } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: { title, description, price, stock, categoryId },
        });
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Admin update product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminUpdateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status specified' });
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Admin update product status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminDeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Admin delete product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- ORDER MANAGEMENT FUNCTIONS ---

const adminGetAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status && ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }
        
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [totalOrders, orders] = await prisma.$transaction([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit, 10),
                include: {
                    buyer: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            })
        ]);

        res.status(200).json({
            orders,
            totalOrders,
            totalPages: Math.ceil(totalOrders / parseInt(limit, 10)),
        });
    } catch (error) {
        console.error('Admin get all orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminGetOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUniqueOrThrow({
            where: { id },
            include: {
                buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
                items: {
                    include: {
                        product: { select: { id: true, title: true, images: true } }
                    }
                }
            }
        });
        res.status(200).json(order);
    } catch (error) {
        console.error('Admin get order by ID error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminUpdateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status specified' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });
        
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Admin update order status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminCreateRefund = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.paymentIntentId) {
            return res.status(400).json({ message: 'This order has no payment ID and cannot be refunded.' });
        }
        if (order.status === 'REFUNDED') {
            return res.status(400).json({ message: 'This order has already been refunded.' });
        }

        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
        });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: 'REFUNDED' },
        });

        res.status(200).json({ message: 'Refund successful', order: updatedOrder, refundDetails: refund });

    } catch (error) {
        console.error('Admin create refund error:', error);
        if (error.type === 'StripeInvalidRequestError') {
             return res.status(400).json({ message: `Stripe Error: ${error.message}` });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- REVIEW MANAGEMENT FUNCTIONS ---

const adminGetAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [totalReviews, reviews] = await prisma.$transaction([
            prisma.review.count(),
            prisma.review.findMany({
                skip,
                take: parseInt(limit, 10),
                include: {
                    user: { select: { id: true, firstName: true, lastName: true } },
                    product: { select: { id: true, title: true } }
                },
                orderBy: { createdAt: 'desc' },
            })
        ]);

        res.status(200).json({
            reviews,
            totalReviews,
            totalPages: Math.ceil(totalReviews / parseInt(limit, 10)),
        });
    } catch (error) {
        console.error('Admin get all reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const adminDeleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Admin delete review error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- NEW: COUPON MANAGEMENT FUNCTIONS ---

/**
 * @description Get all coupons from all sellers.
 */
const adminGetAllCoupons = async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                seller: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Admin get all coupons error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @description Delete a coupon by its ID.
 */
const adminDeleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.coupon.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Admin delete coupon error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
  // User functions
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  updateUserStatus,
  getUserById,
  // Product functions
  adminGetAllProducts,
  adminGetProductById,
  adminUpdateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
  // Order functions
  adminGetAllOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminCreateRefund,
  // Review functions
  adminGetAllReviews,
  adminDeleteReview,
  // New Coupon functions
  adminGetAllCoupons,
  adminDeleteCoupon,
};