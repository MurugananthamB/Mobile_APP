// routes/protectedRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('📸 Multer fileFilter called');
    console.log('📸 File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname
    });
    console.log('📸 Request headers in fileFilter:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ File type accepted');
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Only logged-in users (any role)
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'User profile', user: req.user });
});

// Update profile data
router.put('/profile', protect, async (req, res) => {
  try {
    const User = require('../models/user');
    const { 
      name, 
      email, 
      phone, 
      address, 
      dateOfBirth, 
      bloodGroup, 
      parentName, 
      parentPhone, 
      emergencyContact,
      rollNo,
      assignedClass,
      assignedSection,
      qualification,
      subject,
      department,
      position,
      experience,
      profileImage,
      // Hostel information fields
      hostelRoom,
      hostelBlock,
      hostelFloor,
      hostelWarden,
      hostelWardenPhone,
      hostelCheckInDate,
      hostelCheckOutDate,
      isHostelResident
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required fields' 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: req.user.id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already taken by another user' 
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        phone,
        address,
        dateOfBirth,
        bloodGroup,
        parentName,
        parentPhone,
        emergencyContact,
        rollNo,
        assignedClass,
        assignedSection,
        qualification,
        subject,
        department,
        position,
        experience,
        profileImage,
        // Hostel information
        hostelRoom,
        hostelBlock,
        hostelFloor,
        hostelWarden,
        hostelWardenPhone,
        hostelCheckInDate,
        hostelCheckOutDate,
        isHostelResident
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser.getSafeData()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating profile',
      error: error.message 
    });
  }
});

// Upload profile image
router.post('/profile/image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('📸 Profile image upload request received');
    console.log('📸 Request method:', req.method);
    console.log('📸 Request URL:', req.url);
    console.log('📸 Request headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Present' : 'Missing',
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent']
    });
    console.log('📸 Request body keys:', Object.keys(req.body));
    console.log('📸 Request file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path
    } : 'No file');

    if (!req.file) {
      console.log('❌ No file uploaded');
      console.log('❌ Multer error:', req.multerError);
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    console.log('📸 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Check if file exists on disk
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      console.log('✅ File exists on disk');
      const stats = fs.statSync(req.file.path);
      console.log('📸 File stats:', {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    } else {
      console.log('❌ File does not exist on disk');
    }

    const User = require('../models/user');
    
    // Update user's profile image
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    console.log('📸 Image URL:', imageUrl);
    
    console.log('📸 Updating user profile image for user ID:', req.user.id);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found for update');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile image updated successfully');
    console.log('✅ Updated user profile image:', updatedUser.profileImage);
    
    res.json({ 
      success: true, 
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl,
      user: updatedUser.getSafeData()
    });
  } catch (error) {
    console.error('❌ Profile image upload error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error uploading image',
      error: error.message 
    });
  }
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
