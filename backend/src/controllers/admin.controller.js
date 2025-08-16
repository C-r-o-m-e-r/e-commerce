// /backend/src/controllers/admin.controller.js

const prisma = require('../config/prisma');

/**
 * @description Get a list of all users (for Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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

    res.status(204).send(); // 204 No Content
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
      _sum: {
        total: true,
      },
      where: {
        status: 'COMPLETED', 
      },
    });
    
    const totalSales = salesData._sum.total || 0;
    
    // 4. Get the 5 most recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // --- FIX: Renamed 'user' to 'buyer' based on your error log ---
        buyer: { 
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // We need to rename 'buyer' back to 'user' for the frontend
    const ordersWithUser = recentOrders.map(order => ({
        ...order,
        user: order.buyer, // Create a 'user' property
    }));


    res.status(200).json({
      totalUsers,
      totalProducts,
      totalSales,
      recentOrders: ordersWithUser, // Send the modified array
    });

  } catch (error) {
    console.error('Admin get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
};