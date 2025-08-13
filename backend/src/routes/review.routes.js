// backend/src/routes/review.routes.js

const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { getProductReviews, createReview } = require('../controllers/review.controller');

const router = express.Router();

// Get reviews for a product (publicly accessible)
router.get('/:productId', getProductReviews);

// Create a new review (requires user to be logged in)
router.post('/:productId', authMiddleware, createReview);

module.exports = router;