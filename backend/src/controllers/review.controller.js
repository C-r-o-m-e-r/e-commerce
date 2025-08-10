// backend/src/controllers/review.controller.js

const prisma = require('../config/prisma');

// Get all reviews for a specific product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: { // Include user's first name to display with the review
                    select: {
                        firstName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Show newest reviews first
            },
        });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new review for a product
const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // --- START: FIX for Security Check ---
        // Now checks if the order has been paid, shipped, or completed.
        const hasPurchased = await prisma.order.findFirst({
            where: {
                buyerId: userId,
                status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
                items: {
                    some: {
                        productId: productId,
                    },
                },
            },
        });
        // --- END: FIX ---

        if (!hasPurchased) {
            return res.status(403).json({ message: 'You can only review products you have purchased.' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
        }

        const newReview = await prisma.review.upsert({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
            update: {
                rating,
                comment,
            },
            create: {
                rating,
                comment,
                productId,
                userId,
            },
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Create review error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'You have already reviewed this product.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getProductReviews,
    createReview,
};