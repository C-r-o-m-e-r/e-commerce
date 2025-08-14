// backend/src/controllers/coupons.controller.js

const prisma = require('../config/prisma');

// @desc    Create a new coupon for the logged-in seller
// @route   POST /api/coupons
// @access  Private (Seller)
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiresAt } = req.body;
        const sellerId = req.user.id;

        // --- Validation ---
        if (!code || !discountType || !discountValue) {
            return res.status(400).json({ message: 'Code, discount type, and value are required.' });
        }
        if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
            return res.status(400).json({ message: 'Discount type must be either PERCENTAGE or FIXED.' });
        }
        const value = parseFloat(discountValue);
        if (isNaN(value) || value <= 0) {
            return res.status(400).json({ message: 'Discount value must be a positive number.' });
        }
        if (discountType === 'PERCENTAGE' && value > 100) {
            return res.status(400).json({ message: 'Percentage discount cannot exceed 100.' });
        }

        // Check if coupon code already exists
        const existingCode = await prisma.coupon.findUnique({ where: { code } });
        if (existingCode) {
            return res.status(409).json({ message: 'A coupon with this code already exists.' });
        }

        const data = {
            code: code.toUpperCase(),
            discountType,
            discountValue: value,
            sellerId,
        };

        if (expiresAt) {
            data.expiresAt = new Date(expiresAt);
        }

        const newCoupon = await prisma.coupon.create({ data });

        res.status(201).json(newCoupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Get all coupons for the logged-in seller
// @route   GET /api/coupons
// @access  Private (Seller)
const getSellerCoupons = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const coupons = await prisma.coupon.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Get seller coupons error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Update one of the seller's coupons
// @route   PUT /api/coupons/:id
// @access  Private (Seller)
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;
        const { code, expiresAt, isActive } = req.body; // Only allow updating these fields

        const coupon = await prisma.coupon.findUnique({ where: { id } });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        // Security check: ensure the user owns this coupon
        if (coupon.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own coupons.' });
        }

        const dataToUpdate = {};
        if (code) dataToUpdate.code = code.toUpperCase();
        if (expiresAt) dataToUpdate.expiresAt = new Date(expiresAt);
        if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive;

        const updatedCoupon = await prisma.coupon.update({
            where: { id },
            data: dataToUpdate,
        });

        res.status(200).json(updatedCoupon);
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Delete one of the seller's coupons
// @route   DELETE /api/coupons/:id
// @access  Private (Seller)
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user.id;

        const coupon = await prisma.coupon.findUnique({ where: { id } });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found.' });
        }
        // Security check: ensure the user owns this coupon
        if (coupon.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own coupons.' });
        }

        await prisma.coupon.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    createCoupon,
    getSellerCoupons,
    updateCoupon,
    deleteCoupon,
};