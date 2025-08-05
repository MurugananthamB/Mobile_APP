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
      // Return empty attendance record if none found
      console.log(`📊 No attendance found for user ${req.user.id} in ${targetMonth}/${targetYear}`);
      return res.json({
        success: true,
        userId: req.user.id,
        month: targetMonth,
        year: targetYear,
        records: [],
        totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, holidayDays: 0, leaveDays: 0, workingDays: 0, percentage: 0
      });
    }
    console.log(`📊 Found attendance for user ${req.user.id} in ${targetMonth}/${targetYear}`);
    console.log(`📊 Records count: ${attendance.records.length}`);
    if (attendance.records.length > 0) {
      console.log(`📊 Sample record:`, attendance.records[0]);
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

    // Recalculate monthly summary after saving the record
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let holidayCount = 0;
    let leaveCount = 0;
    let workingDaysCount = 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    attendance.totalDays = daysInMonth; // Assuming total days in month

    const dayManagementRecords = await DayManagement.find({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month - 1, daysInMonth)
      }
    });
    const markedDaysMap = dayManagementRecords.reduce((acc, day) => {
      acc[day.date.toDateString()] = day.dayType;
      return acc;
    }, {});

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toDateString();
      const record = attendance.records.find(r => r.date.toDateString() === dateStr);

        const markedDayType = markedDaysMap[dateStr];

      if (markedDayType === 'holiday') {
        holidayCount++;
      } else if (markedDayType === 'leave') {
        leaveCount++;
 workingDaysCount++; // Leaves count towards total working days
      } else if (markedDayType === 'working') {
        workingDaysCount++;
        if (record) {
          if (record.status === 'present') {
            presentCount++;
 workingDaysCount++; // Only count as a working day if marked present on an unmarked day
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        } else {
           // If it's a working day but no record, assume absent
          absentCount++;
        }
      } else {
        // Default behavior if not a marked day (consider weekends if applicable)
         if (record) {
          if (record.status === 'present') {
            presentCount++;
 workingDaysCount++; // Only count as a working day if marked present on an unmarked day
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        }
      }
 }

 // Update attendance document with calculated summary
 attendance.presentDays = presentCount;
 attendance.absentDays = absentCount;
 attendance.lateDays = lateCount;
 attendance.holidayDays = holidayCount;
 attendance.leaveDays = leaveCount;
 attendance.workingDays = workingDaysCount;
 attendance.percentage = workingDaysCount > 0 ? ((presentCount + lateCount) / workingDaysCount) * 100 : 0;

 await attendance.save(); // Save the updated summary

 res.json({
 success: true,
 message: 'Attendance marked and summary updated successfully',
      data: attendance
    }
 );
  } catch (error) {
 res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Mark attendance using scanned ID
exports.scanMarkAttendance = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from request body
    console.log('Received userId in backend:', userId); // Log received userId
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    // Create a Date object representing the beginning of the current day
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    // const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
 
    let attendance = await Attendance.findOne({ 
      userId: userId, 
      month: currentMonth, 
      year: currentYear 
    });
 console.log('Attempting to find attendance for userId:', userId); // Log attempt to find attendance

    if (!attendance) {
      attendance = new Attendance({
        userId: userId,
        month: currentMonth,
        year: currentYear,
        records: []
      });
    }
 console.log('Attendance found:', attendance); // Log the found or new attendance document

    // Check if a record for today already exists
    const existingRecordIndex = attendance.records.findIndex(record => 
      record.date.toDateString() === today.toDateString()
    );

    const checkInTime = '09:00';
    const checkOutTime = '16:00';

    if (existingRecordIndex > -1) {
      // Update existing record for subsequent scans (check-out)
      attendance.records[existingRecordIndex].dayType = 'full-day';
      attendance.records[existingRecordIndex].checkOutTime = checkOutTime;
    } else {
      // Add new record for today
      // Create new record for the first scan of the day (check-in)
      attendance.records.push({ date: today, status: 'present', dayType: 'half-day', checkInTime: checkInTime });
    }

 console.log('Attempting to save attendance:', attendance); // Log the attendance document before saving
    await attendance.save();
 console.log('Attendance saved successfully!'); // Log successful save

    // Recalculate monthly summary after saving the record - This section needs review for the new dayType field
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let holidayCount = 0;
    let leaveCount = 0;
    let workingDaysCount = 0;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    attendance.totalDays = daysInMonth; // Assuming total days in month

     const dayManagementRecords = await DayManagement.find({
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lte: new Date(currentYear, currentMonth - 1, daysInMonth)
      }
    });
    const markedDaysMap = dayManagementRecords.reduce((acc, day) => {
      acc[day.date.toDateString()] = day.dayType;
      return acc;
    }, {});

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth - 1, day);
      const dateStr = currentDate.toDateString();
      const record = attendance.records.find(r => r.date.toDateString() === dateStr);
      const markedDayType = markedDaysMap[dateStr];

       if (markedDayType === 'holiday') {
        holidayCount++;
      } else if (markedDayType === 'leave') {
        leaveCount++;
      } else if (markedDayType === 'working') {
 workingDaysCount++;
        if (record) {
          if (record.status === 'present') {
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        } else {
           // If it's a working day but no record, assume absent
          absentCount++;
        }
      } else {
        // Default behavior if not a marked day (consider weekends if applicable)
         if (record) {
          if (record.status === 'present') {
            presentCount++;
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        }
      }
    }

 // Update attendance document with calculated summary
 attendance.presentDays = presentCount;
 attendance.absentDays = absentCount;
 attendance.lateDays = lateCount;
 attendance.holidayDays = holidayCount;
 attendance.leaveDays = leaveCount;
 attendance.workingDays = workingDaysCount;
 attendance.percentage = workingDaysCount > 0 ? ((presentCount + lateCount) / workingDaysCount) * 100 : 0;

 console.log('Attempting to save attendance with updated summary:', attendance);
 await attendance.save(); // Save the updated summary
 console.log('Attendance with updated summary saved successfully!');
    res.json({ success: true, message: `Attendance marked for user ${userId}`, data: attendance });
  } catch (error) {
 console.error('Error in scanMarkAttendance:', error);
 res.status(500).json({ success: false, message: 'Server error', error: error.message });
 console.error('Error details:', error); // Log error details
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

// Mark attendance for all staff and management users (Management only)
exports.markAttendanceForAllUsers = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    
    // Check if user is management
    if (req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only management can mark attendance for all users.' 
      });
    }

    const attendanceDate = new Date(date);
    const month = attendanceDate.getMonth() + 1;
    const year = attendanceDate.getFullYear();

    // Validate attendance data
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance data format'
      });
    }

    const results = [];
    const errors = [];

    // Process each user's attendance
    for (const userAttendance of attendanceData) {
      try {
        const { userId, status } = userAttendance;
        
        if (!userId || !status) {
          errors.push({ userId, error: 'Missing userId or status' });
          continue;
        }

        // Validate status (0=working, 1=present, 2=absent)
        if (![0, 1, 2].includes(status)) {
          errors.push({ userId, error: 'Invalid status. Must be 0 (working), 1 (present), or 2 (absent)' });
          continue;
        }

        // Convert status to string
        let statusString;
        switch (status) {
          case 0:
            statusString = 'working';
            break;
          case 1:
            statusString = 'present';
            break;
          case 2:
            statusString = 'absent';
            break;
          default:
            statusString = 'working';
        }

        // Find or create attendance record for this user
        let attendance = await Attendance.findOne({ 
          userId: userId, 
          month, 
          year 
        });

        if (!attendance) {
          attendance = new Attendance({
            userId: userId,
            month,
            year,
            records: []
          });
        }

        // Check if record for this date already exists
        const existingRecord = attendance.records.find(record => 
          record.date.toDateString() === attendanceDate.toDateString()
        );

        console.log(`📝 Processing attendance for user ${userId} on date ${attendanceDate.toDateString()}`);
        console.log(`📝 Status: ${statusString}`);
        console.log(`📝 Existing record found: ${!!existingRecord}`);

        if (existingRecord) {
          existingRecord.status = statusString;
          existingRecord.updatedAt = new Date();
          console.log(`📝 Updated existing record for ${attendanceDate.toDateString()}`);
        } else {
          attendance.records.push({
            date: attendanceDate,
            status: statusString,
            checkInTime: null,
            checkOutTime: null,
            remarks: `Marked by management on ${new Date().toLocaleDateString()}`
          });
          console.log(`📝 Added new record for ${attendanceDate.toDateString()}`);
        }

        await attendance.save();

        // Recalculate monthly summary for this user
        await recalculateAttendanceSummary(attendance, month, year);

        results.push({ userId, status: statusString, success: true });
      } catch (error) {
        console.error(`Error marking attendance for user ${userAttendance.userId}:`, error);
        errors.push({ userId: userAttendance.userId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Attendance marked for ${results.length} users`,
      data: {
        successful: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error marking attendance for all users:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper function to recalculate attendance summary
async function recalculateAttendanceSummary(attendance, month, year) {
  try {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let holidayCount = 0;
    let leaveCount = 0;
    let workingDaysCount = 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    attendance.totalDays = daysInMonth;

    const dayManagementRecords = await DayManagement.find({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month - 1, daysInMonth)
      }
    });
    
    const markedDaysMap = dayManagementRecords.reduce((acc, day) => {
      acc[day.date.toDateString()] = day.dayType;
      return acc;
    }, {});

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toDateString();
      const record = attendance.records.find(r => r.date.toDateString() === dateStr);
      const markedDayType = markedDaysMap[dateStr];

      if (markedDayType === 'holiday') {
        holidayCount++;
      } else if (markedDayType === 'leave') {
        leaveCount++;
        workingDaysCount++;
      } else if (markedDayType === 'working') {
        workingDaysCount++;
        if (record) {
          if (record.status === 'present') {
            presentCount++;
            workingDaysCount++;
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        } else {
          absentCount++;
        }
      } else {
        if (record) {
          if (record.status === 'present') {
            presentCount++;
            workingDaysCount++;
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        }
      }
    }

    attendance.presentDays = presentCount;
    attendance.absentDays = absentCount;
    attendance.lateDays = lateCount;
    attendance.holidayDays = holidayCount;
    attendance.leaveDays = leaveCount;
    attendance.workingDays = workingDaysCount;
    attendance.percentage = workingDaysCount > 0 ? ((presentCount + lateCount) / workingDaysCount) * 100 : 0;

    await attendance.save();
  } catch (error) {
    console.error('Error recalculating attendance summary:', error);
  }
} 
