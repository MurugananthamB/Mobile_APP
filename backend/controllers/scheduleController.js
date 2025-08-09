// controllers/scheduleController.js
const Schedule = require('../models/schedule');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');

// Get schedules for the current user
exports.getSchedules = async (req, res) => {
  try {
    const { class: userClass, section, department, role } = req.user;
    const { targetAudience, day } = req.query;

    let query = {};

    // Filter by targetAudience if provided
    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    // Filter by day if provided
    if (day) {
      query.day = day;
    }

    // Universal query - show all schedules to everyone
    const schedules = await Schedule.find(query)
      .populate('createdBy', 'name email role')
      .sort({ day: 1, startTime: 1 });

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error in getSchedules:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get specific schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const schedule = await Schedule.findById(id)
      .populate('createdBy', 'name')
      .lean();

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Allow access to ALL schedules for everyone
    let hasAccess = true;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this schedule'
      });
    }

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('❌ Error getting schedule by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule',
      error: error.message
    });
  }
};

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const {
      title,
      description,
      day,
      startTime,
      endTime,
      targetAudience,
      class: scheduleClass,
      section,
      department,
      room,
      teacher
    } = req.body;

    // Validate required fields
    if (!title || !description || !day || !startTime || !endTime || !targetAudience) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Access control
    if (req.user.role === 'staff') {
      if (targetAudience === 'staff' || targetAudience === 'both') {
        return res.status(403).json({ success: false, message: 'Staff cannot assign schedules to staff or both' });
      }
      if (targetAudience === 'students' && (!scheduleClass || !section)) {
        return res.status(400).json({ success: false, message: 'Class and section required for student schedules' });
      }
    }

    if (req.user.role === 'management') {
      if (targetAudience === 'staff' && !department) {
        return res.status(400).json({ success: false, message: 'Department required for staff schedules' });
      }
      if (targetAudience === 'students' && (!scheduleClass || !section)) {
        return res.status(400).json({ success: false, message: 'Class and section required for student schedules' });
      }
    }

    // Create schedule
    const schedule = new Schedule({
      title,
      description,
      day,
      startTime,
      endTime,
      targetAudience,
      class: scheduleClass,
      section,
      department,
      room,
      teacher,
      createdBy: req.user._id
    });

    const savedSchedule = await schedule.save();

    // Send notifications
    try {
      const users = await User.find({});
      for (const user of users) {
        await NotificationService.createNotification({
          userId: user._id,
          title: 'New Schedule',
          message: `New schedule: ${title} on ${day}`,
          type: 'schedule',
          relatedId: savedSchedule._id,
          relatedModel: 'Schedule'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
    }

    res.status(201).json({ success: true, message: 'Schedule created successfully', data: savedSchedule });
  } catch (error) {
    console.error('Error in createSchedule:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update schedule (only creator or management)
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if user has permission to update
    if (req.user.role !== 'management' && schedule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update schedules you created'
      });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });

  } catch (error) {
    console.error('❌ Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// Delete schedule (only creator or management)
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'management' && schedule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete schedules you created'
      });
    }

    await Schedule.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

// Get schedule statistics (for management)
exports.getScheduleStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (req.user.role !== 'management') {
      return res.status(403).json({
        success: false,
        message: 'Only management can view statistics'
      });
    }

    const totalSchedules = await Schedule.countDocuments();
    const studentSchedules = await Schedule.countDocuments({ targetAudience: { $in: ['students', 'both'] } });
    const staffSchedules = await Schedule.countDocuments({ targetAudience: { $in: ['staff', 'both'] } });
    const recentSchedules = await Schedule.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        total: totalSchedules,
        studentSchedules,
        staffSchedules,
        recentSchedules
      }
    });

  } catch (error) {
    console.error('❌ Error getting schedule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule statistics',
      error: error.message
    });
  }
}; 