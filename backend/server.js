// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoute');
const feesRoutes = require('./routes/feesRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const noticesRoutes = require('./routes/noticesRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const scannerRoutes = require('./routes/scannerRoutes');

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});

// Enable CORS with explicit options
app.use(cors({
  origin: true, // Allow all origins for mobile apps
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));


// Middleware to parse JSON and form data with large limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Log incoming requests (for development) - optimized for high concurrency
app.use((req, res, next) => {
  // Only log scanner requests for performance
  if (req.path.includes('/scanner')) {
    console.log(`📥 ${req.method} ${req.path}`);
  }
  next();
});

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/scanner', scannerRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('🎓 Welcome to the School Mobile App Backend!');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
