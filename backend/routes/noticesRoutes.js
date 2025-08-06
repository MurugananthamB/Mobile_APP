// routes/noticesRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotices, getNoticeById, markNoticeAsRead, createNotice } = require('../controllers/noticesController');

// All routes are protected
router.use(protect);

// GET /api/notices - Get all notices
router.get('/', getNotices);

// POST /api/notices - Create new notice
router.post('/', createNotice);

// GET /api/notices/:id - Get specific notice by ID
router.get('/:id', getNoticeById);

// PUT /api/notices/:id/read - Mark notice as read
router.put('/:id/read', markNoticeAsRead);

module.exports = router; 