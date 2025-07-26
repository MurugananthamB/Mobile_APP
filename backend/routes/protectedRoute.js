// routes/protectedRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Only logged-in users (any role)
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'User profile', user: req.user });
});

// Only staff and management
router.get('/staff-area', protect, authorizeRoles('staff', 'management'), (req, res) => {
  res.json({ message: 'Welcome staff or management!' });
});

// Only management
router.get('/admin-dashboard', protect, authorizeRoles('management'), (req, res) => {
  res.json({ message: 'Welcome to management dashboard' });
});

module.exports = router;
