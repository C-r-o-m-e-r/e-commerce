const prisma = require('../config/prisma');

// --- USER MANAGEMENT FUNCTIONS (Unchanged) ---

/**
 * @description MODIFIED: Get a list of all users, with search and filtering
 */
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Update a user's role (Admin action)
 */
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
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, status: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Delete a user (Admin action)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account from the admin panel." });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * @description Get statistics for the admin dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    
    const salesData = await prisma.order.aggregate({
      _sum: { total: true, },
      where: { status: 'COMPLETED', },
    });
    
    const totalSales = salesData._sum.total || 0;
    
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc', },
      include: {
        buyer: { 
          select: { firstName: true, lastName: true, },
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

/**
 * @description Update a user's status (Block/Unblock)
 */
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
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, status: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Get a single user's details by ID
 */
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

// --- NEW: PRODUCT MANAGEMENT FUNCTIONS ---

/**
 * @description Get all products with filtering for the admin panel.
 */
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

/**
 * @description Get a single product by ID for editing.
 */
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

/**
 * @description Update product details (e.g., title, price, etc.)
 */
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

/**
 * @description Update a product's status (Approve/Reject)
 */
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

/**
 * @description Delete a product from the marketplace.
 */
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


module.exports = {
  // User functions
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  updateUserStatus,
  getUserById,
  // New Product functions
  adminGetAllProducts,
  adminGetProductById,
  adminUpdateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
};