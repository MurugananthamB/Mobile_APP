// controllers/authController.js

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Added missing import

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { userid, email, password, role, name, department, phone, address, hostelRoom, hostelBlock, hostelFloor, hostelWarden, hostelWardenPhone, hostelCheckInDate, hostelCheckOutDate, isHostelResident } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { userid }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or userid' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      userid,
      email,
      password: hashedPassword,
      role,
      name,
      department,
      phone,
      address,
      hostelRoom,
      hostelBlock,
      hostelFloor,
      hostelWarden,
      hostelWardenPhone,
      hostelCheckInDate,
      hostelCheckOutDate,
      isHostelResident
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          userid: user.userid,
          email: user.email,
          role: user.role,
          name: user.name,
          department: user.department,
          phone: user.phone,
          address: user.address,
          hostelRoom: user.hostelRoom,
          hostelBlock: user.hostelBlock,
          hostelFloor: user.hostelFloor,
          hostelWarden: user.hostelWarden,
          hostelWardenPhone: user.hostelWardenPhone,
          hostelCheckInDate: user.hostelCheckInDate,
          hostelCheckOutDate: user.hostelCheckOutDate,
          isHostelResident: user.isHostelResident
        }
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Login user
exports.userLogin = async (req, res) => {
  const { userid, password } = req.body;

  try {
    // Basic validation
    if (!userid || !password) {
      return res.status(400).json({ message: 'Please provide userid and password' });
    }

    const user = await User.findOne({ userid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    // Return safe user data
    const safeUserData = user.getSafeData();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUserData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

// Get all staff and management users (for management attendance)
exports.getStaffAndManagementUsers = async (req, res) => {
  try {
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        message: 'Access denied. Only management users can view this data.' 
      });
    }

    // Find all staff and management users
    const users = await User.find({ 
      role: { $in: ['staff', 'management'] },
      isActive: true 
    }).select('userid name role department position subject qualification experience');

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user._id,
      userid: user.userid,
      name: user.name,
      role: user.role,
      department: user.department || '',
      position: user.position || '',
      subject: user.subject || '',
      qualification: user.qualification || '',
      experience: user.experience || ''
    }));

    res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching staff and management users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users', 
      error: error.message 
    });
  }
};
