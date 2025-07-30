// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { userRegister, userLogin } = require('../controllers/authController');

// Register route
router.post('/register', userRegister);

// Login route
router.post('/login', userLogin);

module.exports = router;
