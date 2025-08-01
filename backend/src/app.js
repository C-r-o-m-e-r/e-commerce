const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json()); // Дозволяє Express обробляти JSON-тіла запитів
app.use(cors()); // Дозволяє запити з фронтенду

// Імпорт маршрутів
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const usersRoutes = require('./routes/users.routes');

// Реєстрація маршрутів
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);

// Заглушка для головного маршруту
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

module.exports = app;