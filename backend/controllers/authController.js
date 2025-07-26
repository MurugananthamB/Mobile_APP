// controllers/authController.js

const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );
};

// Register a new user
exports.userRegister = async (req, res) => {
  const { userid, email, password, role } = req.body;

  try {
    console.log('Registration attempt:', { userid, email, role }); // Debug log

    // Check if user already exists by userid or email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUserByUserid = await User.findOne({ userid });
    if (existingUserByUserid) {
      console.log('User already exists with userid:', userid);
      return res.status(400).json({ message: 'User ID already exists' });
    }

    // Create new user
    const newUser = new User({ 
      userid, 
      email, 
      password, 
      role: role || 'student' // Default to student if no role provided
    });

    // Save to database
    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser._id);

    // Generate token for immediate login after registration
    const token = generateToken(savedUser);

    res.status(201).json({
      message: 'User registered successfully',
      token, // Frontend expects this for auto-login
      user: {
        id: savedUser._id,
        userid: savedUser.userid,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists`,
        error: error.message 
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

// Login user
exports.userLogin = async (req, res) => {
  const { userid, password } = req.body;

  try {
    console.log('Login attempt for userid:', userid); // Debug log

    const user = await User.findOne({ userid });
    if (!user) {
      console.log('User not found:', userid);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', userid);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    console.log('Login successful for user:', userid);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userid: user.userid,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
  }
};
