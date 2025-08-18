const express = require('express');
const { 
  // User Management
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getDashboardStats,
  updateUserStatus,
  getUserById,
  // Product Management - Added new imports
  adminGetAllProducts,
  adminGetProductById,
  adminUpdateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct
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

// --- NEW: Product Management ---
router.get('/products', adminGetAllProducts);          // Get all products (with filtering)
router.get('/products/:id', adminGetProductById);      // Get a single product
router.put('/products/:id', adminUpdateProduct);       // Update product details
router.patch('/products/:id/status', adminUpdateProductStatus); // Approve/Reject a product
router.delete('/products/:id', adminDeleteProduct);    // Delete a product

module.exports = router;