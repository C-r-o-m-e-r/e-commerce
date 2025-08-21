// /backend/src/routes/admin.routes.js

const express = require('express');
const { 
  // User Management
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getDashboardStats,
  updateUserStatus,
  getUserById,
  // Product Management
  adminGetAllProducts,
  adminGetProductById,
  adminUpdateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
  // Order Management
  adminGetAllOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminCreateRefund,
  // Review Management
  adminGetAllReviews,
  adminDeleteReview,
  // Coupon Management - Added new imports
  adminGetAllCoupons,
  adminDeleteCoupon
} = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// This middleware protects all routes in this file
router.use(authMiddleware, roleMiddleware('ADMIN'));

// --- Dashboard ---
router.get('/dashboard-stats', getDashboardStats);

// --- User Management ---
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// --- Product Management ---
router.get('/products', adminGetAllProducts);
router.get('/products/:id', adminGetProductById);
router.put('/products/:id', adminUpdateProduct);
router.patch('/products/:id/status', adminUpdateProductStatus);
router.delete('/products/:id', adminDeleteProduct);

// --- Order Management ---
router.get('/orders', adminGetAllOrders);
router.get('/orders/:id', adminGetOrderById);
router.patch('/orders/:id/status', adminUpdateOrderStatus);
router.post('/orders/:id/refund', adminCreateRefund);

// --- Review Management ---
router.get('/reviews', adminGetAllReviews);
router.delete('/reviews/:id', adminDeleteReview);

// --- NEW: Coupon Management ---
router.get('/coupons', adminGetAllCoupons);      // Get all coupons
router.delete('/coupons/:id', adminDeleteCoupon);  // Delete a coupon

module.exports = router;