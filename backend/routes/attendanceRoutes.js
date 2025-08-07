// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getAttendance, 
 getAttendanceStats,
  markAttendance,
  addDayManagement,
  getDayManagement,
  removeDayManagement,
  updateDayManagement,
  getMarkedDays,
  scanMarkAttendance, // Import the new controller function
  markAttendanceForAllUsers // Import the new management function
} = require('../controllers/attendanceController');

// All routes are protected
router.use(protect);

// GET /api/attendance - Get attendance records (with optional month/year query)
router.get('/', getAttendance);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', getAttendanceStats);

// POST /api/attendance/mark - Mark attendance (for staff/admin)
router.post('/mark', markAttendance);

// POST /api/attendance/scan - Mark attendance via scanned ID (protected)
router.post('/scan', scanMarkAttendance);

// Day Management Routes (for management users)
// GET /api/attendance/marked-days - Get marked days for calendar display
router.get('/marked-days', getMarkedDays);

// GET /api/attendance/day-management - Get day management records
router.get('/day-management', getDayManagement);

// POST /api/attendance/day-management - Add new day management record
router.post('/day-management', addDayManagement);

// DELETE /api/attendance/day-management/:date - Remove day management record
router.delete('/day-management/:date', removeDayManagement);

// PUT /api/attendance/day-management/:date - Update day management record
router.put('/day-management/:date', updateDayManagement);

// POST /api/attendance/mark-all-users - Mark attendance for all staff and management users (Management only)
router.post('/mark-all-users', markAttendanceForAllUsers);

module.exports = router; 