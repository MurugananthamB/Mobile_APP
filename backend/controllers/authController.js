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
  try {
    const {
      userid, 
      name, 
      email, 
      password, 
      role,
      qualification,
      subject,
      department,
      position,
      experience 
    } = req.body;

    console.log('Registration attempt:', { userid, email, role, name }); // Debug log

    // Basic validation
    if (!userid || !name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: userid, name, email, password, and role' 
      });
    }

    // Role-specific validation
    if (role === 'staff') {
      if (!qualification || !subject) {
        return res.status(400).json({ 
          message: 'Staff registration requires qualification and subject' 
        });
      }
    } else if (role === 'management') {
      if (!qualification || !department || !position || !experience) {
        return res.status(400).json({ 
          message: 'Management registration requires qualification, department, position, and experience' 
        });
      }
    }

    // Check if user already exists by userid or email
    const existingUser = await User.findOne({ 
      $or: [{ email }, { userid }] 
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'userid';
      console.log(`User already exists with ${conflictField}:`, existingUser[conflictField]);
      return res.status(400).json({ 
        message: `${conflictField.charAt(0).toUpperCase() + conflictField.slice(1)} already exists` 
      });
    }

    // Create user object with role-specific fields
    const userData = {
      userid,
      name,
      email,
      password,
      role
    };

    // Add role-specific fields
    if (role === 'staff') {
      userData.qualification = qualification;
      userData.subject = subject;
    } else if (role === 'management') {
      userData.qualification = qualification;
      userData.department = department;
      userData.position = position;
      userData.experience = experience;
    }

    console.log('User data before creating newUser:', userData); // Debug log userData

    // Create new user
    const newUser = new User(userData);

    // Save to database
    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser._id);

    // Generate the barcode (which also serves as roll number)
    const generatedIdentifier = 'MAPH' + savedUser._id;
    savedUser.barcode = generatedIdentifier;
    // Assign the same value to rollNo as per the new requirement
    await savedUser.save();

    // Generate token for immediate login after registration
    const token = generateToken(savedUser);

    // Return safe user data
    const safeUserData = savedUser.getSafeData();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: safeUserData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        error: error.message 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: messages
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

    // Basic validation
    if (!userid || !password) {
      return res.status(400).json({ message: 'Please provide userid and password' });
    }

    const user = await User.findOne({ userid });
    if (!user) {
      console.log('User not found:', userid);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', userid);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    console.log('Login successful for user:', userid);

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
