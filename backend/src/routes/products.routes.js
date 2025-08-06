// backend/src/routes/products.routes.js

const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} = require('../controllers/products.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const { processImages } = require('../middleware/image.middleware'); // 1. Import the new image processor

const router = express.Router();

// Configure Multer to save original files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes for Sellers only
// 2. Add the processImages middleware after the upload
router.post('/', authMiddleware, checkRole('SELLER'), upload.array('images', 5), processImages, createProduct);
router.put('/:id', authMiddleware, checkRole('SELLER'), upload.array('images', 5), processImages, updateProduct);
router.delete('/:id', authMiddleware, checkRole('SELLER'), deleteProduct);

// Route for a seller to get their own products
router.get('/seller/my-products', authMiddleware, checkRole('SELLER'), getSellerProducts);

module.exports = router;