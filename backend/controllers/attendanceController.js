// backend/controllers/attendanceController.js
const { Attendance, DayManagement } = require('../models/attendance');
const User = require('../models/user'); // Import User model

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
      } else if (markedDayType === 'working') {
        workingDaysCount++;
        if (record) {
          if (record.status === 'present') {
            presentCount++; // Count present days only on working days or unmarked days with records
          } else if (record.status === 'late') {
            lateCount++;
          } else if (record.status === 'half_present_morning' || record.status === 'half_present_afternoon') {
 presentCount += 0.5;
          } else if (record.status === 'half_absent') {
 absentCount += 0.5;
          }
        } else { // If it's a marked working day but no record exists, it's an absence
           // If it's a working day but no record, assume absent
          absentCount++;
        }
      } else {
        // Default behavior if not a marked day (consider weekends if applicable)
         if (record) {
          if (record.status === 'present') {
            presentCount++; // Count present days only on working days or unmarked days with records
          } else if (record.status === 'late') {
            lateCount++;
          }
        }
      }
 }

 // Total working days should be the count of marked 'working' days plus any unmarked days with attendance records.
 // Recalculate working days based on attendance records that are not marked as 'holiday' or 'leave'
 workingDaysCount = attendance.records.filter(record => markedDaysMap[record.date.toDateString()] !== 'holiday' && markedDaysMap[record.date.toDateString()] !== 'leave').length;

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

// Mark attendance using scanned ID - Optimized for high-speed concurrent scanning
exports.scanMarkAttendance = async (req, res) => {
  try {
    const { barcode } = req.body; // Extract barcode from request body

    if (!barcode) {
      return res.status(400).json({ success: false, message: 'Barcode not provided' });
    }
    if (!barcode.startsWith('MAPH')) {
      return res.status(400).json({ success: false, message: 'Invalid barcode format. Must start with MAPH.' });
    }
    const userId = barcode.substring(4);
    if (!userId) {
       return res.status(400).json({ success: false, message: 'Invalid barcode format. User ID missing.' });
    }

    // Try to find user by userid field first, then by barcode
    let user = await User.findOne({ userid: userId });
    if (!user) {
      // If not found by userid, try to find by barcode
      user = await User.findOne({ barcode: barcode });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    // Create a Date object representing the beginning of the current day
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Use findOneAndUpdate for atomic operations to prevent race conditions

    // Check if a record for today already exists using atomic operation
    const existingRecord = await Attendance.findOne({
      userId: user._id,
      month: currentMonth,
      year: currentYear,
      'records.date': {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingRecord) {
      // Update existing record for subsequent scans (check-out) - atomic operation
      const result = await Attendance.updateOne(
        {
          userId: user._id,
          month: currentMonth,
          year: currentYear,
          'records.date': {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        {
          $set: {
            'records.$.checkOutTime': currentTime
          }
        }
      );

      if (result.modifiedCount > 0) {
        return res.json({ success: true, message: `Checkout time recorded for user ${user.name}.` });
      } else {
        return res.json({ success: false, message: 'Failed to update checkout time.' });
      }
    } else {
      // Determine status based on scan time for the first scan of the day
      let statusString = null; // Start with null
      let message = 'Scan recorded.';

      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      // Define time windows in minutes
      const morningStart = 8 * 60;  // 8:00 AM
      const morningEnd = 9 * 60 + 30; // 9:30 AM
      const afternoonStart = 12 * 60 + 30; // 12:30 PM
      const afternoonEnd = 14 * 60; // 2:00 PM
      const eveningStart = 15 * 60 + 30; // 3:30 PM
      const eveningEnd = 19 * 60; // 7:00 PM

      if (totalMinutes >= morningStart && totalMinutes <= morningEnd) {
        statusString = 'half_present_morning';
        message = 'Attendance marked as Half Day Present (Morning)';
      } else if (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd) {
        statusString = 'half_present_afternoon';
        message = 'Attendance marked as Half Day Present (Afternoon)';
      } else if (totalMinutes >= eveningStart && totalMinutes <= eveningEnd) {
        statusString = 'present'; // Full day present
        message = 'Attendance marked as Full Day Present';
      }

      // Add new record for today if a valid status was determined - atomic operation
      if (statusString) {
        // Use findOneAndUpdate with upsert for atomic operation
        const result = await Attendance.findOneAndUpdate(
          {
            userId: user._id,
            month: currentMonth,
            year: currentYear
          },
          {
            $push: {
              records: {
                date: today,
                status: statusString,
                checkInTime: currentTime,
                checkOutTime: null
              }
            }
          },
          {
            upsert: true,
            new: true
          }
        );

        // Recalculate summary asynchronously to not block the response
        recalculateAttendanceSummary(result, currentMonth, currentYear).catch(err => {
          console.error('Error recalculating summary:', err);
        });

        res.json({ success: true, message: `${message} for user ${user.name}.` });
      } else {
        // If statusString is null, it means the scan was outside valid windows.
        return res.json({ success: false, message: message + ' No attendance status marked.' });
      }
    }

  } catch (error) {
    console.error('Error in scanMarkAttendance:', error);
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

        // Validate status (0=working, 1=present, 2=absent, 3=half_present, 4=half_absent)
        if (![0, 1, 2, 3, 4].includes(status)) {
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
 case 3:
 statusString = 'half_present';
            break;
 case 4:
 statusString = 'half_absent';
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
 const markedDayType = markedDaysMap[dateStr];
      const record = attendance.records.find(r => r.date.toDateString() === dateStr);

      if (markedDayType === 'holiday') {
        holidayCount++;
      } else if (markedDayType === 'leave') {
        leaveCount++;
      } else if (markedDayType === 'working') {
        workingDaysCount++;
        if (record) {
          if (record.status === 'present') {
            presentCount++;
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
            lateCount++;
          }
        } else { // If it's a marked working day but no record exists, it's an absence
          absentCount++;
        }
      } else { // Default behavior for unmarked days (consider as working if attendance recorded)
        if (record) {
          if (record.status === 'present') {
 presentCount++;
          } else if (record.status === 'absent') {
            absentCount++;
          } else if (record.status === 'late') {
 lateCount++;
          } else if (record.status === 'half_present_morning' || record.status === 'half_present_afternoon') {
            presentCount += 0.5;
          } else if (record.status === 'half_absent') {
            absentCount += 0.5;
          } 
        }
      }
    }

    attendance.presentDays = presentCount;
    attendance.absentDays = absentCount;
    attendance.lateDays = lateCount;
    attendance.holidayDays = holidayCount;
 attendance.leaveDays = leaveCount;

    // Calculate working days based on records that are not holiday or leave
    workingDaysCount = attendance.records.filter(record => record.status !== 'holiday' && record.status !== 'leave').length;

    attendance.workingDays = workingDaysCount;
    attendance.percentage = workingDaysCount > 0 ? ((presentCount + lateCount) / workingDaysCount) * 100 : 0;

    await attendance.save();
  } catch (error) {
    console.error('Error recalculating attendance summary:', error);
  }
} 
