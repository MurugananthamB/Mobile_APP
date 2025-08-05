// services/notificationService.js
const Notification = require('../models/notification');
const User = require('../models/user');

class NotificationService {
  // Create notification for a single user
  static async createNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        userId,
        ...notificationData
      });
      
      await notification.save();
      console.log(`📱 Notification created for user ${userId}: ${notificationData.title}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for multiple users
  static async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        ...notificationData
      }));

      const result = await Notification.insertMany(notifications);
      console.log(`📱 Created ${result.length} notifications for ${userIds.length} users`);
      return result;
    } catch (error) {
      console.error('❌ Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Create notifications for all users of specific roles
  static async createNotificationsForRoles(roles, notificationData) {
    try {
      const users = await User.find({ 
        role: { $in: roles },
        isActive: true 
      }).select('_id');

      if (users.length === 0) {
        console.log('⚠️ No users found for roles:', roles);
        return [];
      }

      const userIds = users.map(user => user._id);
      return await this.createBulkNotifications(userIds, notificationData);
    } catch (error) {
      console.error('❌ Error creating notifications for roles:', error);
      throw error;
    }
  }

  // Create notifications for all active users
  static async createNotificationsForAllUsers(notificationData) {
    try {
      const users = await User.find({ isActive: true }).select('_id');
      
      if (users.length === 0) {
        console.log('⚠️ No active users found');
        return [];
      }

      const userIds = users.map(user => user._id);
      return await this.createBulkNotifications(userIds, notificationData);
    } catch (error) {
      console.error('❌ Error creating notifications for all users:', error);
      throw error;
    }
  }

  // Event-specific notification
  static async notifyNewEvent(eventData) {
    const notificationData = {
      title: '🎉 New Event',
      message: `New event: ${eventData.title} on ${new Date(eventData.date).toLocaleDateString()}`,
      type: 'event',
      relatedId: eventData._id,
      relatedModel: 'Event',
      priority: 'medium'
    };

    return await this.createNotificationsForAllUsers(notificationData);
  }

  // Notice/Circular-specific notification
  static async notifyNewNotice(noticeData) {
    const notificationData = {
      title: '📢 New Circular',
      message: `New circular: ${noticeData.title}`,
      type: 'notice',
      relatedId: noticeData._id,
      relatedModel: 'Notice',
      priority: 'high'
    };

    return await this.createNotificationsForAllUsers(notificationData);
  }

  // Homework-specific notification
  static async notifyNewHomework(homeworkData) {
    const notificationData = {
      title: '📚 New Homework',
      message: `New homework assigned: ${homeworkData.title} for ${homeworkData.subject}`,
      type: 'homework',
      relatedId: homeworkData._id,
      relatedModel: 'Homework',
      priority: 'high'
    };

    // Notify students and staff
    return await this.createNotificationsForRoles(['student', 'staff'], notificationData);
  }

  // Schedule-specific notification
  static async notifyScheduleUpdate(scheduleData) {
    const notificationData = {
      title: '📅 Schedule Updated',
      message: `Schedule has been updated for ${scheduleData.class || 'your class'}`,
      type: 'schedule',
      relatedId: scheduleData._id,
      relatedModel: 'Schedule',
      priority: 'medium'
    };

    return await this.createNotificationsForAllUsers(notificationData);
  }

  // Get notifications for a user
  static async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 20, skip = 0, unreadOnly = false } = options;
      
      const query = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return notifications;
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      
      return notification;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false
      });
      
      return count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId, type = null) {
    try {
      const query = { userId };
      if (type) {
        query.type = type;
      }

      const [total, unread, read] = await Promise.all([
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, isRead: false }),
        Notification.countDocuments({ ...query, isRead: true })
      ]);

      return {
        total,
        unread,
        read,
        readPercentage: total > 0 ? Math.round((read / total) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 