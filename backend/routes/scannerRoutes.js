// routes/scannerRoutes.js
const express = require('express');
const router = express.Router();
const { scanMarkAttendance } = require('../controllers/attendanceController');

// Public endpoint for barcode scanner (no authentication required)
router.post('/scan', scanMarkAttendance);

module.exports = router; 