// routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
<<<<<<< HEAD
const { getEvents, getEventById, registerForEvent, createEvent, clearAllEvents } = require('../controllers/eventsController');
=======
const { getEvents, getEventById, registerForEvent, createEvent } = require('../controllers/eventsController');
>>>>>>> 08d5d5a (attendance page maual push working)

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

<<<<<<< HEAD
// DELETE /api/events/clear - Clear all events (management only)
router.delete('/clear', clearAllEvents);
=======

>>>>>>> 08d5d5a (attendance page maual push working)

module.exports = router; 