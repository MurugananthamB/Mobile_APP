// controllers/scheduleController.js
const Schedule = require('../models/schedule');
const User = require('../models/user');
const NotificationService = require('../services/notificationService');

// Get all schedules for the user based on their role and class
// Everyone can fetch created data, but filtered based on their role and assignments
exports.getSchedules = async (req, res) => {
  try {
    console.log('📅 Getting schedules for user:', req.user._id);
    console.log('👤 User role:', req.user.role);
    console.log('👤 User class:', req.user.class);
    console.log('👤 User section:', req.user.section);
    console.log('👤 User department:', req.user.department);

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    let query = {};

    // Show ALL schedules to everyone (no filtering)
    query = {};
    console.log('🌐 Universal query - showing ALL schedules to everyone');
    console.log('👤 User role:', req.user.role);
    console.log('👤 User ID:', req.user._id);

    console.log('🔍 Query:', JSON.stringify(query));

    const schedules = await Schedule.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📅 Found ${schedules.length} schedules for ${req.user.role} user`);
    
    // Debug: Show details of returned schedules
    if (req.user.role === 'staff') {
      console.log('📋 Returned schedules for staff:');
      schedules.forEach(schedule => {
        console.log(`  - ${schedule.title} (${schedule.targetAudience}) - Created by: ${schedule.createdBy?.name || 'Unknown'}`);
      });
    }

    res.json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('❌ Error getting schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedules',
      error: error.message
    });
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

// Create new schedule with role-based access control
exports.createSchedule = async (req, res) => {
  try {
    console.log('📅 Creating new schedule');
    console.log('👤 User:', req.user._id, req.user.role);
    console.log('📝 Request body:', req.body);

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Check if user has permission to create schedules
    if (req.user.role !== 'staff' && req.user.role !== 'management') {
      return res.status(403).json({
        success: false,
        message: 'Only staff and management can create schedules'
      });
    }

    const {
      title,
      description,
      scheduleType,
      subject,
      studyHours,
      toDate,
      targetAudience,
      assignedClass,
      assignedSection,
      assignedDepartment,
      attachments
    } = req.body;

    // Validate required fields
    console.log('🔍 Validating fields:', {
      title: !!title,
      description: !!description,
      scheduleType: !!scheduleType,
      subject: !!subject,
      studyHours: !!studyHours,
      toDate: !!toDate,
      targetAudience: !!targetAudience
    });
    
    if (!title || !description || !scheduleType || !subject || !studyHours || !toDate || !targetAudience) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Role-based access control for target audience
    console.log('🔍 Access control check:', {
      userRole: req.user.role,
      targetAudience,
      assignedClass: !!assignedClass,
      assignedSection: !!assignedSection,
      assignedDepartment: !!assignedDepartment
    });

    // Staff can only assign to students
    if (req.user.role === 'staff') {
      if (targetAudience === 'staff' || targetAudience === 'both') {
        console.log('❌ Staff cannot assign schedules to staff or both');
        return res.status(403).json({
          success: false,
          message: 'Staff can only assign schedules to students'
        });
      }
      
      if (targetAudience !== 'students') {
        console.log('❌ Staff can only assign to students');
        return res.status(403).json({
          success: false,
          message: 'Staff can only assign schedules to students'
        });
      }
    }

    // Management can assign to anyone (no restrictions)

    // Validate target audience specific fields
    if ((targetAudience === 'students' || targetAudience === 'both') && (!assignedClass || !assignedSection)) {
      console.log('❌ Missing class/section for student schedule');
      return res.status(400).json({
        success: false,
        message: 'Class and section are required for student schedules'
      });
    }

    if ((targetAudience === 'staff' || targetAudience === 'both') && !assignedDepartment) {
      console.log('❌ Missing department for staff schedule');
      return res.status(400).json({
        success: false,
        message: 'Department is required for staff schedules'
      });
    }

    // Create new schedule
    const newSchedule = new Schedule({
      title,
      description,
      scheduleType,
      subject,
      studyHours,
      toDate: new Date(toDate),
      targetAudience,
      assignedClass,
      assignedSection,
      assignedDepartment,
      attachments: attachments || [],
      createdBy: req.user._id,
      createdByRole: req.user.role,
      teacher: req.user.name
    });

    const savedSchedule = await newSchedule.save();

    console.log('✅ Schedule created successfully:', savedSchedule._id);

    // Send notifications to relevant users
    try {
      await NotificationService.notifyScheduleUpdate(savedSchedule);
      console.log('📱 Notifications sent for new schedule');
    } catch (notificationError) {
      console.error('⚠️ Error sending notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: savedSchedule
    });

  } catch (error) {
    console.error('❌ Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message
    });
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