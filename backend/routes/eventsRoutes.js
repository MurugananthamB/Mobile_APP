// routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getEvents, getEventById, registerForEvent } = require('../controllers/eventsController');

// All routes are protected
router.use(protect);

// GET /api/events - Get all events
router.get('/', getEvents);

// GET /api/events/:id - Get specific event by ID
router.get('/:id', getEventById);

// POST /api/events/:id/register - Register for event
router.post('/:id/register', registerForEvent);

module.exports = router; 