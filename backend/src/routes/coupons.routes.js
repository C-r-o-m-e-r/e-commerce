// backend/src/routes/coupons.routes.js

const express = require('express');
const {
    createCoupon,
    getSellerCoupons,
    updateCoupon,
    deleteCoupon
} = require('../controllers/coupons.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Protect all coupon routes and ensure only sellers can access them
router.use(authMiddleware, roleMiddleware('SELLER'));

// Route to get all coupons for the current seller and create a new one
router.route('/')
    .get(getSellerCoupons)
    .post(createCoupon);

// Routes to update and delete a specific coupon by its ID
router.route('/:id')
    .put(updateCoupon)
    .delete(deleteCoupon);

module.exports = router;