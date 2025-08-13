// backend/src/routes/auth.routes.js

const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
// FIX: Use destructuring { } to import the specific middleware function
const { authMiddleware } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authMiddleware, getMe);

module.exports = router;