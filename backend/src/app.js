// backend/src/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import controllers and routes
const { handleStripeWebhook } = require('./controllers/payments.controller');
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const usersRoutes = require('./routes/users.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');
const sellerRoutes = require('./routes/seller.routes');
const couponRoutes = require('./routes/coupons.routes'); // 1. Import the new coupon routes

const app = express();

// --- START: Stripe Webhook Route ---
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
// --- END: Stripe Webhook Route ---

// Middleware
app.use(express.json());
app.use(cors());

const uploadsPath = path.join(__dirname, '../uploads');
console.log(`[SERVER] Serving static files from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// Register all other API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/coupons', couponRoutes); // 2. Register the new coupon routes

// Root route placeholder
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

module.exports = app;