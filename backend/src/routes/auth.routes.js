const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller'); // Make sure getMe is imported
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authMiddleware, getMe); // Make sure this line exists

module.exports = router;