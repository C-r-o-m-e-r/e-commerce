const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById); // New public route

// Protected routes for Sellers only
router.post('/', authMiddleware, checkRole('SELLER'), createProduct);
router.put('/:id', authMiddleware, checkRole('SELLER'), updateProduct);
router.delete('/:id', authMiddleware, checkRole('SELLER'), deleteProduct);

module.exports = router;