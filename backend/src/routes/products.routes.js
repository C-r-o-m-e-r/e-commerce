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
    getProductSuggestions,
} = require('../controllers/products.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const { processImages } = require('../middleware/image.middleware');

const router = express.Router();

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

// --- Public routes ---
router.get('/', getAllProducts);
router.get('/suggestions', getProductSuggestions);
router.get('/:id', getProductById);


// --- Protected routes ---
router.post('/', authMiddleware, checkRole('SELLER'), upload.array('images', 5), processImages, createProduct);
router.get('/seller/my-products', authMiddleware, checkRole('SELLER'), getSellerProducts);

// --- FIX: Removed checkRole('SELLER') to allow Admins access. The controller now handles the logic. ---
router.put('/:id', authMiddleware, upload.array('images', 5), processImages, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;