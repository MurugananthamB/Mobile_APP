// test_device_image_storage.js
// Test script to verify device-side image storage functionality

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test the new image storage approach
const testImageStorage = async () => {
  try {
    console.log('🧪 Testing device-side image storage...');
    
    // Test base64 image data
    const testBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    console.log('📸 Test base64 image data length:', testBase64Image.length);
    console.log('📸 Test base64 image starts with data:image/:', testBase64Image.startsWith('data:image/'));
    
    // Test user model with base64 image
    const User = require('./models/user');
    
    // Create a test user with base64 image
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      userid: 'test123',
      password: 'hashedpassword',
      role: 'student',
      profileImage: testBase64Image
    });
    
    console.log('✅ Test user created with base64 image');
    console.log('📸 User profile image type:', typeof testUser.profileImage);
    console.log('📸 User profile image starts with data:image/:', testUser.profileImage.startsWith('data:image/'));
    
    // Test saving to database
    await testUser.save();
    console.log('✅ Test user saved to database');
    
    // Test retrieving from database
    const retrievedUser = await User.findById(testUser._id);
    console.log('✅ Test user retrieved from database');
    console.log('📸 Retrieved profile image type:', typeof retrievedUser.profileImage);
    console.log('📸 Retrieved profile image starts with data:image/:', retrievedUser.profileImage.startsWith('data:image/'));
    console.log('📸 Retrieved profile image length:', retrievedUser.profileImage.length);
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user cleaned up');
    
    console.log('🎉 All device-side image storage tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
connectDB().then(() => {
  testImageStorage();
}); 