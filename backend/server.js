// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoute');
const feesRoutes = require('./routes/feesRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const noticesRoutes = require('./routes/noticesRoutes');

dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ✅ Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies with increased limit for attachments
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, req.body);
  next();
});

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes (individual routes handle their own authentication)
app.use('/api/protected', protectedRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notices', noticesRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the School Mobile App Backend!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
