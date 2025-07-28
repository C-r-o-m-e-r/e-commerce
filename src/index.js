const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes'); // 1. Import product routes
const userRoutes = require('./routes/users.routes'); // 1. Import user routes
const cartRoutes = require('./routes/cart.routes'); // 1. Import cart routes
const orderRoutes = require('./routes/orders.routes'); // 1. Import order routes



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => { res.send('Hello, E-commerce API!'); });

// Use the auth and product routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // 2. Use product routes
app.use('/api/users', userRoutes); // 2. Use user routes
app.use('/api/cart', cartRoutes); // 2. Use cart routes
app.use('/api/orders', orderRoutes); // 2. Use order routes


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});