// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAttendance, getAttendanceStats, markAttendance } = require('../controllers/attendanceController');

// All routes are protected
router.use(protect);

// GET /api/attendance - Get attendance records (with optional month/year query)
router.get('/', getAttendance);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', getAttendanceStats);

// POST /api/attendance/mark - Mark attendance (for staff/admin)
router.post('/mark', markAttendance);

module.exports = router; 