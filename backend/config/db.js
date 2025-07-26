// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable or fallback to default MongoDB URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-app';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB:`);
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   Solution: Make sure MongoDB is installed and running');
      console.error('   Try: brew services start mongodb/brew/mongodb-community (Mac)');
      console.error('   Or: net start MongoDB (Windows)');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('   Solution: Check your MongoDB username/password');
    }
    
    console.error('\n🚨 Continuing without database - data will not be saved!');
    // Don't exit - let the app run for debugging
  }
};

module.exports = connectDB;
