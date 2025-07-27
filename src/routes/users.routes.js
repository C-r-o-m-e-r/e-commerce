const express = require('express');
const { updateUserRole } = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// For now, any authenticated user can change a role.
// In a real app, this would be protected for ADMINS only.
router.put('/:id/role', authMiddleware, updateUserRole);

module.exports = router;