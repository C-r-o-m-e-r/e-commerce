// /backend/src/routes/category.routes.js

const express = require('express');
const { 
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory 
} = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// --- Public Route ---
// This route is for everyone (buyers, sellers, guests) to see the categories.
router.get('/', getAllCategories);

// --- Admin-Only Routes ---
// These routes are protected and can only be accessed by an ADMIN.
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteCategory);

module.exports = router;