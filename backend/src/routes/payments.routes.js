// src/routes/payments.routes.js

const express = require('express');
const { createPaymentIntent } = require('../controllers/payments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const router = express.Router();

// All routes in this file are protected and require a user to be logged in.
router.use(authMiddleware);

router.post('/create-intent', createPaymentIntent);

module.exports = router;