// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.userLogin);

// Get staff and management users (protected route)
router.get('/staff-management-users', protect, authController.getStaffAndManagementUsers);

module.exports = router;
