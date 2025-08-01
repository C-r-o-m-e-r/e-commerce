const express = require('express');
const cors = require('cors'); // Додаємо імпорт cors
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payments.routes');

// Import the webhook controller directly
const { handleStripeWebhook } = require('./controllers/payments.controller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Дозволяємо запити з фронтенду
app.use(cors()); 

// Main welcome route
app.get('/', (req, res) => { res.send('Hello, E-commerce API!'); });

// Special route for the Stripe webhook with a raw body parser
// This MUST come BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Middleware to parse JSON request bodies for all other routes
app.use(express.json());

// Use the auth and product routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});