// backend/src/routes/products.routes.js

const express = require('express');
const multer = require('multer'); // <== 1. Import multer
const path = require('path');   // <== 2. Import path

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

const router = express.Router();

// <== 3. Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files in the 'backend/uploads/' directory
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes for Sellers only
// <== 4. Add the upload middleware to the create and update routes
// 'images' is the field name, 5 is the max number of files
router.post('/', authMiddleware, checkRole('SELLER'), upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, checkRole('SELLER'), upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, checkRole('SELLER'), deleteProduct);

// New route for a seller to get their own products
router.get('/seller/my-products', authMiddleware, checkRole('SELLER'), getSellerProducts);

module.exports = router;