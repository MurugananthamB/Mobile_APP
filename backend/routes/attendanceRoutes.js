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
<<<<<<< HEAD
  scanMarkAttendance // Import the new controller function
=======
  scanMarkAttendance, // Import the new controller function
  markAttendanceForAllUsers // Import the new management function
>>>>>>> 08d5d5a (attendance page maual push working)
} = require('../controllers/attendanceController');

// All routes are protected
router.use(protect);

// GET /api/attendance - Get attendance records (with optional month/year query)
router.get('/', getAttendance);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', getAttendanceStats);

// POST /api/attendance/mark - Mark attendance (for staff/admin)
router.post('/mark', markAttendance);

<<<<<<< HEAD
// POST /api/attendance/scan-mark - Mark attendance via scanned ID
router.post('/scan-mark', scanMarkAttendance);
=======
// POST /api/attendance/scan - Mark attendance via scanned ID (protected)
router.post('/scan', scanMarkAttendance);
>>>>>>> 08d5d5a (attendance page maual push working)

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

<<<<<<< HEAD
=======
// POST /api/attendance/mark-all-users - Mark attendance for all staff and management users (Management only)
router.post('/mark-all-users', markAttendanceForAllUsers);

>>>>>>> 08d5d5a (attendance page maual push working)
module.exports = router; 