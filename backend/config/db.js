// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable or fallback to default MongoDB URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-app';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`🚀 Ready State: ${conn.connection.readyState}`);
    
    // Test the connection with a simple ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful - Database is responsive!');
    
    // Log connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 MongoDB connection established');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
    });
    
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed:`);
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 SOLUTION: MongoDB is not running locally');
      console.error('   📋 Quick Setup Options:');
      console.error('   \n   🔹 Option 1: Install MongoDB locally');
      console.error('     • Mac: brew install mongodb-community');
      console.error('     • Windows: Download from https://www.mongodb.com/try/download/community');
      console.error('     • Then run: brew services start mongodb/brew/mongodb-community (Mac)');
      console.error('     • Or: net start MongoDB (Windows)');
      console.error('   \n   🔹 Option 2: Use MongoDB Atlas (Cloud - Recommended)');
      console.error('     • Visit: https://www.mongodb.com/atlas');
      console.error('     • Create free account and get connection string');
      console.error('     • Update MONGO_URI in .env file');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 SOLUTION: Check your MongoDB credentials');
      console.error('   • Verify username/password in connection string');
      console.error('   • Make sure user has proper permissions');
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 SOLUTION: Network timeout - check connectivity');
      console.error('   • Verify MongoDB server is accessible');
      console.error('   • Check firewall settings');
      console.error('   • Try increasing timeout values');
    }
    
    console.error('\n🚨 CRITICAL: Database not connected - Registration will fail!');
    console.error('🔄 Please fix database connection and restart server\n');
    
    // Exit process to force fix
    process.exit(1);
  }
};

module.exports = connectDB;
