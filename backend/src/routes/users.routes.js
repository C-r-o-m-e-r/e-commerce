const express = require('express');
const { 
  updateUserRole,
  updateProfile,      // 1. Import new controllers
  changePassword,
  deleteAccount 
} = require('../controllers/users.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes here are for an authenticated user
router.use(authMiddleware);

// --- New routes for a user to manage their own account ---
router.put('/me', updateProfile);            // Update my first/last name
router.post('/me/change-password', changePassword); // Change my password
router.delete('/me', deleteAccount);          // Delete my account

// --- Existing route (can be admin-only later) ---
router.put('/:id/role', updateUserRole);

module.exports = router;