// backend/src/routes/category.routes.js

const express = require('express');
const { getAllCategories } = require('../controllers/category.controller');

const router = express.Router();

// This route is public, no authentication needed
router.get('/', getAllCategories);

module.exports = router;