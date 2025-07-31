// src/routes/payments.routes.js

const express = require('express');
const { createPaymentIntent } = require('../controllers/payments.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All other payment routes are protected
router.use(authMiddleware);

router.post('/create-intent', createPaymentIntent);

module.exports = router;