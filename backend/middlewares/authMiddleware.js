// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify JWT token and attach user to request
const protect = async (req, res, next) => {
  console.log('🔐 Auth middleware called for:', req.method, req.path);
  console.log('📋 Headers:', req.headers);
  
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔑 Token found:', token ? 'Present' : 'Missing');
  } else {
    console.log('❌ No authorization header or invalid format');
    console.log('📋 Authorization header:', req.headers.authorization);
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    console.log('✅ Token verified, user ID:', decoded.id);

    // Attach user info to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User attached to request:', req.user.name, req.user.role);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check user role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
