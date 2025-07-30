// routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getEvents, getEventById, registerForEvent, createEvent, clearAllEvents } = require('../controllers/eventsController');

// All routes are protected
router.use(protect);

// GET /api/events - Get all events
router.get('/', getEvents);

// POST /api/events - Create new event
router.post('/', createEvent);

// GET /api/events/:id - Get specific event by ID
router.get('/:id', getEventById);

// POST /api/events/:id/register - Register for event
router.post('/:id/register', registerForEvent);

// DELETE /api/events/clear - Clear all events (management only)
router.delete('/clear', clearAllEvents);

module.exports = router; 