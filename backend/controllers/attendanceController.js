// controllers/attendanceController.js
const { Attendance, DayManagement } = require('../models/attendance');

// Get attendance records
exports.getAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    let attendance = await Attendance.findOne({ 
      userId: req.user.id, 
      month: targetMonth, 
      year: targetYear 
    });

    if (!attendance) {
      // Create default attendance record for current month
      const defaultRecords = [];
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth - 1, day);
        const dayOfWeek = date.getDay();
        
        // Skip Sundays (0) for school days
        if (dayOfWeek !== 0 && day <= currentDate.getDate()) {
          let status = 'present';
          
          // Add some realistic attendance pattern
          if (day === 4 || day === 18) status = 'absent';
          if (day === 9) status = 'late';
          if (day === 14 || day === 21) status = 'holiday';
          if (day === 23) status = 'leave';
          if (day === 24) status = 'working';
          
          defaultRecords.push({
            date: new Date(targetYear, targetMonth - 1, day),
            status,
            checkInTime: status === 'present' || status === 'late' ? '08:30' : null,
            checkOutTime: status === 'present' || status === 'late' ? '15:30' : null,
          });
        }
      }

      attendance = new Attendance({
        userId: req.user.id,
        month: targetMonth,
        year: targetYear,
        records: defaultRecords
      });

      await attendance.save();
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const attendance = await Attendance.findOne({ 
      userId: req.user.id, 
      month: currentMonth, 
      year: currentYear 
    });

    if (!attendance) {
      return res.json({ 
        success: true, 
        data: { 
          totalDays: 0, 
          presentDays: 0, 
          absentDays: 0, 
          lateDays: 0,
          holidayDays: 0,
          leaveDays: 0,
          workingDays: 0,
          percentage: 0 
        } 
      });
    }

    res.json({ 
      success: true, 
      data: {
        totalDays: attendance.totalDays,
        presentDays: attendance.presentDays,
        absentDays: attendance.absentDays,
        lateDays: attendance.lateDays,
        holidayDays: attendance.holidayDays,
        leaveDays: attendance.leaveDays,
        workingDays: attendance.workingDays,
        percentage: attendance.percentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark attendance (for staff/admin)
exports.markAttendance = async (req, res) => {
  try {
    const { date, status, checkInTime, checkOutTime, remarks } = req.body;
    const attendanceDate = new Date(date);
    const month = attendanceDate.getMonth() + 1;
    const year = attendanceDate.getFullYear();

    let attendance = await Attendance.findOne({ 
      userId: req.user.id, 
      month, 
      year 
    });

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        month,
        year,
        records: []
      });
    }

    // Check if record for this date already exists
    const existingRecord = attendance.records.find(record => 
      record.date.toDateString() === attendanceDate.toDateString()
    );

    if (existingRecord) {
      existingRecord.status = status;
      existingRecord.checkInTime = checkInTime;
      existingRecord.checkOutTime = checkOutTime;
      existingRecord.remarks = remarks;
    } else {
      attendance.records.push({
        date: attendanceDate,
        status,
        checkInTime,
        checkOutTime,
        remarks
      });
    }

    await attendance.save();

    res.json({ 
      success: true, 
      message: 'Attendance marked successfully',
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Day Management Functions (for management users)

// Add a new day management record
exports.addDayManagement = async (req, res) => {
  try {
    const { date, dayType, holidayType, description } = req.body;
    
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only management can manage days.' 
      });
    }

    const dayDate = new Date(date);
    
    // Check if day already exists
    const existingDay = await DayManagement.findOne({ date: dayDate });
    if (existingDay) {
      return res.status(400).json({ 
        success: false, 
        message: 'This date is already marked.' 
      });
    }

    const dayManagement = new DayManagement({
      date: dayDate,
      dayType,
      holidayType: holidayType || 'both',
      description,
      createdBy: req.user.id
    });

    await dayManagement.save();

    res.json({ 
      success: true, 
      message: 'Day marked successfully',
      data: dayManagement 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all day management records
exports.getDayManagement = async (req, res) => {
  try {
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only management can view day management.' 
      });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const dayManagement = await DayManagement.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('createdBy', 'name email');

    res.json({ 
      success: true, 
      data: dayManagement 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Remove a day management record
exports.removeDayManagement = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only management can remove days.' 
      });
    }

    const dayDate = new Date(date);
    const dayManagement = await DayManagement.findOneAndDelete({ date: dayDate });

    if (!dayManagement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Day management record not found.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Day management record removed successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a day management record
exports.updateDayManagement = async (req, res) => {
  try {
    const { date } = req.params;
    const { dayType, holidayType, description } = req.body;
    
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only management can update days.' 
      });
    }

    const dayDate = new Date(date);
    
    // Find and update the day management record
    const updatedDayManagement = await DayManagement.findOneAndUpdate(
      { date: dayDate },
      { 
        dayType, 
        holidayType, 
        description,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedDayManagement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Day management record not found.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Day management record updated successfully',
      data: updatedDayManagement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all marked days for a specific month (for calendar display)
exports.getMarkedDays = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const markedDays = await DayManagement.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Convert to date string format for frontend
    const markedDaysMap = {};
    markedDays.forEach(day => {
      const dateStr = day.date.toISOString().split('T')[0];
      markedDaysMap[dateStr] = day.dayType;
    });

    res.json({ 
      success: true, 
      data: markedDaysMap 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 