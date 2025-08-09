// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  deleteNotification,
  getNotificationById
} = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

// GET /api/notifications - Get user's notifications
router.get('/', getUserNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', getNotificationStats);

// GET /api/notifications/:notificationId - Get specific notification by ID
router.get('/:notificationId', getNotificationById);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', markAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router; 