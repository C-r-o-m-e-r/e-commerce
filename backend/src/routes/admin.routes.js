// /backend/src/routes/admin.routes.js
const express = require('express');
const { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getDashboardStats // <-- 1. Import the new function
} = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('ADMIN'));

// --- Dashboard ---
router.get('/dashboard-stats', getDashboardStats); // <-- 2. Add the new route

// --- User Management ---
router.get('/users', getAllUsers);             // Отримати всіх користувачів
router.patch('/users/:id/role', updateUserRole); // Змінити роль
router.delete('/users/:id', deleteUser);        // Видалити користувача

module.exports = router;