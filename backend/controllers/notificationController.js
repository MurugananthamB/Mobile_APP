// controllers/notificationController.js
const NotificationService = require('../services/notificationService');

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const notifications = await NotificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Get specific notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    console.log(`🔍 Getting notification by ID: ${notificationId} for user: ${userId}`);

    const notification = await NotificationService.getNotificationById(notificationId, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('❌ Error getting notification by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    const stats = await NotificationService.getNotificationStats(userId, type);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const result = await NotificationService.deleteNotification(notificationId, userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
}; 