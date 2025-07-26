const express = require('express');
const { register } = require('../controllers/auth.controller');

const router = express.Router();

// Define the registration route
// POST /api/auth/register
router.post('/register', register);

module.exports = router;
