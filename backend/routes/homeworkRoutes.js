// routes/homeworkRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getHomework, getHomeworkById, submitHomework, markHomeworkComplete } = require('../controllers/homeworkController');

// All routes are protected
router.use(protect);

// GET /api/homework - Get all homework for user's class
router.get('/', getHomework);

// GET /api/homework/:id - Get specific homework by ID
router.get('/:id', getHomeworkById);

// POST /api/homework/:id/submit - Submit homework
router.post('/:id/submit', submitHomework);

// PUT /api/homework/:id/complete - Mark homework as complete
router.put('/:id/complete', markHomeworkComplete);

module.exports = router; 