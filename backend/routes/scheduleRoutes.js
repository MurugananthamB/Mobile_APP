// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getSchedules, 
  getScheduleById, 
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleStats
} = require('../controllers/scheduleController');

// All routes are protected
router.use(protect);

// GET /api/schedules - Get all schedules for user
router.get('/', getSchedules);

// GET /api/schedules/stats - Get schedule statistics (management only)
router.get('/stats', getScheduleStats);

// POST /api/schedules - Create new schedule (staff/management only)
router.post('/', createSchedule);

// GET /api/schedules/:id - Get specific schedule by ID
router.get('/:id', getScheduleById);

// PUT /api/schedules/:id - Update schedule (creator or management only)
router.put('/:id', updateSchedule);

// DELETE /api/schedules/:id - Delete schedule (creator or management only)
router.delete('/:id', deleteSchedule);

module.exports = router; 