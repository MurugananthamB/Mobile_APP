// backend/controllers/attendanceController.js
const { Attendance, DayManagement } = require('../models/attendance');
const User = require('../models/user'); // Import User model
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

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
      return res.json({ success: true, data: { records: [], month: targetMonth, year: targetYear } });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error in getAttendance:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      month: targetMonth,
      year: targetYear
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
          halfPresentDays: 0,
          halfAbsentDays: 0,
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
        halfPresentDays: attendance.halfPresentDays || 0,
        halfAbsentDays: attendance.halfAbsentDays || 0,
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

    // Clean the barcode
    const cleanBarcode = barcode.trim();
    
    // Validate barcode format - accept multiple formats
    if (cleanBarcode.length < 2 || cleanBarcode.length > 20) {
      return res.status(400).json({ success: false, message: 'Invalid barcode format. Length must be between 2-20 characters.' });
    }

    let user = null;
    let userId = null;

    // Try to find user by barcode field first (for new formats like A03, MPH642, MH03, AP642M603)
    user = await User.findOne({ barcode: cleanBarcode });
    
    if (!user && cleanBarcode.startsWith('MAPH')) {
      // If not found and it's MAPH format, try the original logic
      userId = cleanBarcode.substring(4);
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Invalid MAPH barcode format. User ID missing.' });
      }
      
      // Try to find user by userid field
      user = await User.findOne({ userid: userId });
      
      if (!user) {
        // If not found by userid, try to find by _id (for cases where barcode contains the full _id)
        try {
          if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
          }
        } catch (error) {
          // Invalid ObjectId format
        }
      }
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: `User not found for barcode: ${cleanBarcode}` });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    // Create a Date object representing the beginning of the current day
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

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
      // User already has a record for today, check if we need to update status
      const existingRecordData = existingRecord.records.find(r => 
        r.date.toDateString() === today.toDateString()
      );
      
      if (existingRecordData) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const currentMinutes = totalMinutes; // Calculate current minutes from time
        
        // Define time windows
        const morningStart = currentMinutes;
        const morningEnd = currentMinutes + 2;

        // Afternoon slot: now + 3 minutes to now + 5 minutes
        const afternoonStart = currentMinutes + 3;
        const afternoonEnd = currentMinutes + 5;

        // Evening slot: now + 6 minutes to now + 8 minutes
        const eveningStart = currentMinutes + 6;
        const eveningEnd = currentMinutes + 8;
        
        let newStatus = existingRecordData.status;
        let message = 'Scan recorded.';
        
        // Check if user already has both half present and half absent records for today
        const todayRecords = existingRecord.records.filter(r => 
          r.date.toDateString() === today.toDateString()
        );
        
        const hasHalfPresent = todayRecords.some(r => r.status === 'half_present_morning' || r.status === 'half_present_afternoon');
        const hasHalfAbsent = todayRecords.some(r => r.status === 'half_absent');
        const hasPresent = todayRecords.some(r => r.status === 'present');
        
        // Update status based on current scan time
        if (totalMinutes >= morningStart && totalMinutes <= morningEnd) {
          if (hasPresent) {
            message = 'Already marked as Full Day Present';
          } else if (hasHalfPresent && todayRecords.some(r => r.status === 'half_present_afternoon')) {
            // Update to full present
            newStatus = 'present';
            message = 'Attendance updated to Full Day Present (Morning + Afternoon)';
          } else if (hasHalfPresent && todayRecords.some(r => r.status === 'half_present_morning')) {
            message = 'Already marked as Half Day Present (Morning)';
          } else {
            newStatus = 'half_present_morning';
            message = 'Attendance marked as Half Day Present (Morning) + Half Absent';
          }
        } else if (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd) {
          if (hasPresent) {
            message = 'Already marked as Full Day Present';
          } else if (hasHalfPresent && todayRecords.some(r => r.status === 'half_present_morning')) {
            // Update to full present
            newStatus = 'present';
            message = 'Attendance updated to Full Day Present (Morning + Afternoon)';
          } else if (hasHalfPresent && todayRecords.some(r => r.status === 'half_present_afternoon')) {
            message = 'Already marked as Half Day Present (Afternoon)';
          } else {
            newStatus = 'half_present_afternoon';
            message = 'Attendance marked as Half Day Present (Afternoon) + Half Absent';
          }
        } else if (totalMinutes >= eveningStart && totalMinutes <= eveningEnd) {
          if (hasPresent) {
            message = 'Already marked as Full Day Present';
          } else {
            newStatus = 'present';
            message = 'Attendance updated to Full Day Present';
          }
        }
        
        // Handle different scenarios
        if (newStatus === existingRecordData.status) {
          // No change needed, just update checkout time
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
            const updatedAttendance = await Attendance.findOne({
              userId: user._id,
              month: currentMonth,
              year: currentYear
            });
            await recalculateAttendanceSummary(updatedAttendance, currentMonth, currentYear);
            return res.json({ success: true, message: `${message} for user ${user.name}.` });
          }
        } else if (newStatus === 'present' && (hasHalfPresent || hasHalfAbsent)) {
          // Convert to full present - remove half records and add full present
          const result = await Attendance.updateOne(
            {
              userId: user._id,
              month: currentMonth,
              year: currentYear
            },
            {
              $pull: {
                records: {
                  date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          );
          
          if (result.modifiedCount > 0) {
            // Add full present record
            const addResult = await Attendance.updateOne(
              {
                userId: user._id,
                month: currentMonth,
                year: currentYear
              },
              {
                $push: {
                  records: {
                    date: today,
                    status: 'present',
                    checkInTime: currentTime,
                    checkOutTime: null,
                    remarks: 'Updated to full present'
                  }
                }
              }
            );
            
            if (addResult.modifiedCount > 0) {
              const updatedAttendance = await Attendance.findOne({
                userId: user._id,
                month: currentMonth,
                year: currentYear
              });
              await recalculateAttendanceSummary(updatedAttendance, currentMonth, currentYear);
              return res.json({ success: true, message: `${message} for user ${user.name}.` });
            }
          }
        } else {
          // Update existing record with new status
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
                'records.$.status': newStatus,
                'records.$.checkOutTime': currentTime
              }
            }
          );
          
          if (result.modifiedCount > 0) {
            const updatedAttendance = await Attendance.findOne({
              userId: user._id,
              month: currentMonth,
              year: currentYear
            });
            await recalculateAttendanceSummary(updatedAttendance, currentMonth, currentYear);
            return res.json({ success: true, message: `${message} for user ${user.name}.` });
          }
        }
        
        return res.json({ success: false, message: 'Failed to update attendance.' });
      }
    } else {
      // First scan of the day - create new record
      let statusString = null;
      let message = 'Scan recorded.';

      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      // Define time windows in minutes (more flexible)
      const morningStart = 6 * 60;  // 6:00 AM (earlier start)
      const morningEnd = 10 * 60; // 10:00 AM (later end)
      const afternoonStart = 12 * 60; // 12:00 PM (earlier start)
      const afternoonEnd = 15 * 60; // 3:00 PM (earlier end)
      const eveningStart = 15 * 60; // 3:00 PM (earlier start)
      const eveningEnd = 20 * 60; // 8:00 PM (later end)

      if (totalMinutes >= morningStart && totalMinutes <= morningEnd) {
        statusString = 'half_present_morning';
        message = 'Attendance marked as Half Day Present (Morning) + Half Absent';
      } else if (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd) {
        statusString = 'half_present_afternoon';
        message = 'Attendance marked as Half Day Present (Afternoon) + Half Absent';
      } else if (totalMinutes >= eveningStart && totalMinutes <= eveningEnd) {
        statusString = 'present'; // Full day present
        message = 'Attendance marked as Full Day Present';
      } else {
        // Fallback: If scan is outside time windows, mark as present for the day
        statusString = 'present';
        message = 'Attendance marked as Present (outside normal hours)';
      }

      // Add new record for today if a valid status was determined - atomic operation
      if (statusString) {
        // Create records array with both present and absent records
        let recordsToAdd = [];
        
        if (statusString === 'half_present_morning') {
          // Add half present morning record
          recordsToAdd.push({
            date: today,
            status: 'half_present_morning',
            checkInTime: currentTime,
            checkOutTime: null,
            remarks: 'Morning scan - Half day present'
          });
          // Also add half absent record for the other half
          recordsToAdd.push({
            date: today,
            status: 'half_absent',
            checkInTime: null,
            checkOutTime: null,
            remarks: 'Automatically marked as half absent - only morning scan'
          });
        } else if (statusString === 'half_present_afternoon') {
          // Add half present afternoon record
          recordsToAdd.push({
            date: today,
            status: 'half_present_afternoon',
            checkInTime: currentTime,
            checkOutTime: null,
            remarks: 'Afternoon scan - Half day present'
          });
          // Also add half absent record for the other half
          recordsToAdd.push({
            date: today,
            status: 'half_absent',
            checkInTime: null,
            checkOutTime: null,
            remarks: 'Automatically marked as half absent - only afternoon scan'
          });
        } else if (statusString === 'present') {
          // Add full day present record
          recordsToAdd.push({
            date: today,
            status: 'present',
            checkInTime: currentTime,
            checkOutTime: null,
            remarks: 'Evening scan - Full day present'
          });
        }

        // Use findOneAndUpdate with upsert for atomic operation
        const result = await Attendance.findOneAndUpdate(
          {
            userId: user._id,
            month: currentMonth,
            year: currentYear
          },
          {
            $push: {
              records: { $each: recordsToAdd }
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

    if (!date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Date and attendanceData array required.'
      });
    }

    const attendanceDate = new Date(date);
    const month = attendanceDate.getMonth() + 1;
    const year = attendanceDate.getFullYear();

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

        if (existingRecord) {
          // Update existing record
          existingRecord.status = status;
          existingRecord.checkOutTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          existingRecord.remarks = `Marked by management on ${new Date().toLocaleDateString()}`;
        } else {
          // Add new record
          attendance.records.push({
            date: attendanceDate,
            status: status,
            checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            checkOutTime: null,
            remarks: `Marked by management on ${new Date().toLocaleDateString()}`
          });
        }

        await attendance.save();
        await recalculateAttendanceSummary(attendance, month, year);

        results.push({ userId, status, success: true });
      } catch (error) {
        errors.push({ userId: userAttendance.userId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Attendance marked for ${results.length} users. ${errors.length} errors.`,
      data: { results, errors }
    });
  } catch (error) {
    console.error('Error in markAttendanceForAllUsers:', error);
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
    let halfPresentCount = 0;
    let halfAbsentCount = 0;

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
          } else if (record.status === 'half_present_morning' || record.status === 'half_present_afternoon' || record.status === 'half_present') {
            halfPresentCount++;
          } else if (record.status === 'half_absent') {
            halfAbsentCount++;
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
          } else if (record.status === 'half_present_morning' || record.status === 'half_present_afternoon' || record.status === 'half_present') {
            halfPresentCount++;
          } else if (record.status === 'half_absent') {
            halfAbsentCount++;
          }
        }
      }
    }

    attendance.presentDays = presentCount;
    attendance.absentDays = absentCount;
    attendance.lateDays = lateCount;
    attendance.holidayDays = holidayCount;
    attendance.leaveDays = leaveCount;
    attendance.halfPresentDays = halfPresentCount;
    attendance.halfAbsentDays = halfAbsentCount;

    // Calculate working days based on records that are not holiday or leave
    workingDaysCount = attendance.records.filter(record => record.status !== 'holiday' && record.status !== 'leave').length;

    attendance.workingDays = workingDaysCount;
    attendance.percentage = workingDaysCount > 0 ? ((presentCount + lateCount + halfPresentCount) / workingDaysCount) * 100 : 0;

    await attendance.save();
  } catch (error) {
    console.error('Error recalculating attendance summary:', error);
  }
}

// Internal function to process all users for half day absent (used by scheduler)
async function processAllUsersForHalfDayAbsentInternal() {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const users = await User.find({ role: { $in: ['staff', 'management'] } });

    const results = [];
    const errors = [];

    for (const user of users) {
      try {
        // Find or create attendance record for this user
        let attendance = await Attendance.findOne({
          userId: user._id,
          month,
          year
        });

        if (!attendance) {
          attendance = new Attendance({
            userId: user._id,
            month,
            year,
            records: []
          });
        }

        // Check if record for today already exists
        const todayRecord = attendance.records.find(record =>
          record.date.toDateString() === today.toDateString()
        );

        if (!todayRecord) {
          // Add half absent record for today
          attendance.records.push({
            date: today,
            status: 'half_absent',
            checkInTime: null,
            checkOutTime: null,
            remarks: 'Automatically marked as half absent by system'
          });

          await attendance.save();

          // Recalculate monthly summary for this user
          await recalculateAttendanceSummary(attendance, month, year);

          results.push({
            userId: user._id,
            name: user.name,
            status: 'half_absent',
            success: true
          });
        } else {
          results.push({
            userId: user._id,
            name: user.name,
            status: 'already_marked',
            success: true
          });
        }
      } catch (error) {
        errors.push({ userId: user._id, name: user.name, error: error.message });
      }
    }

    return {
      success: true,
      message: `Processed ${results.length} users for half day absent`,
      data: { successful: results, errors: errors }
    };
  } catch (error) {
    console.error('Error in processAllUsersForHalfDayAbsentInternal:', error);
    return { success: false, message: 'Error processing half day absent', error: error.message };
  }
}

// Export the internal function for scheduler use
module.exports.processAllUsersForHalfDayAbsentInternal = processAllUsersForHalfDayAbsentInternal; 
