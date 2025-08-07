// backend/src/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const uploadsPath = path.join(__dirname, '../uploads');
console.log(`[SERVER] Serving static files from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const usersRoutes = require('./routes/users.routes');
const wishlistRoutes = require('./routes/wishlist.routes'); // 1. Import the new wishlist routes

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wishlists', wishlistRoutes); // 2. Register the new wishlist routes

// Root route placeholder
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

module.exports = app;