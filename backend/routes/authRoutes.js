// routes/authRoutes.js

const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { userRegister, userLogin } = require('../controllers/authController');

// Register route
router.post('/register', userRegister);

// Login route
router.post('/login', userLogin);
=======
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Register route
router.post('/register', authController.userRegister);

// Login route
router.post('/login', authController.userLogin);

// Get staff and management users (protected route)
router.get('/staff-management-users', protect, authController.getStaffAndManagementUsers);
>>>>>>> 08d5d5a (attendance page maual push working)

module.exports = router;
