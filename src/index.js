const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes'); // Import the auth router

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Main welcome route
app.get('/', (req, res) => {
  res.send('Hello, E-commerce API!');
});

// Use the auth routes for any requests to /api/auth
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
