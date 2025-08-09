// routes/protectedRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Only logged-in users (any role)
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'User profile', user: req.user });
});

// Update profile information
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('📝 Profile update request received');
    console.log('📝 Request body:', req.body);
    console.log('📝 User ID:', req.user.id);
    
    const User = require('../models/user');
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('📝 Current user data:', currentUser.getSafeData());

    // Update allowed fields
    const allowedUpdates = [
      'name', 'email', 'phone', 'address',
      // Hostel fields
      'hostelRoom', 'hostelBlock', 'hostelFloor', 'hostelWarden', 
      'hostelWardenPhone', 'hostelCheckInDate', 'hostelCheckOutDate', 'isHostelResident',
      // Student fields
      'rollNo', 'assignedClass', 'assignedSection', 'dateOfBirth', 'bloodGroup',
      'parentName', 'parentPhone', 'emergencyContact',
      // Staff fields
      'qualification', 'subject',
      // Management fields
      'department', 'position', 'experience'
    ];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
        console.log(`📝 Field "${field}" will be updated to:`, req.body[field]);
      }
    });

    console.log('📝 Updates to apply:', updates);
    
    if (Object.keys(updates).length === 0) {
      console.log('⚠️ No valid fields to update');
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields to update' 
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found for update');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile updated successfully');
    console.log('✅ Updated user data:', updatedUser.getSafeData());
    
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

// Update profile image (store as base64 in database)
router.post('/profile/image', protect, async (req, res) => {
  try {
    console.log('📸 Profile image update request received');
    console.log('📸 Request body keys:', Object.keys(req.body));
    
    const { imageData } = req.body;
    
    if (!imageData) {
      console.log('❌ No image data provided');
      return res.status(400).json({ 
        success: false, 
        message: 'No image data provided' 
      });
    }

    console.log('📸 Image data received (length):', imageData ? imageData.length : 0);

    const User = require('../models/user');
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update user's profile image (store as base64)
    console.log('📸 Updating user profile image for user ID:', req.user.id);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageData },
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
    console.log('✅ Image data stored (length):', updatedUser.profileImage ? updatedUser.profileImage.length : 0);
    
    res.json({ 
      success: true, 
      message: 'Profile image updated successfully',
      user: updatedUser.getSafeData()
    });
  } catch (error) {
    console.error('❌ Profile image update error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating image',
      error: error.message 
    });
  }
});

// Delete profile image
router.delete('/profile/image', protect, async (req, res) => {
  try {
    console.log('🗑️ Profile image deletion request received');
    
    const User = require('../models/user');
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove profile image from user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { profileImage: 1 } },
      { new: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found for update');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile image deleted successfully');
    
    res.json({ 
      success: true, 
      message: 'Profile image deleted successfully',
      user: updatedUser.getSafeData()
    });
  } catch (error) {
    console.error('❌ Profile image deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting image',
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
