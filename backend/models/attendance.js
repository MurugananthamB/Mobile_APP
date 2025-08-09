// models/attendance.js
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'holiday', 'leave', 'working', 'half_present_morning', 'half_present_afternoon', 'half_present', 'half_absent'],
    required: true,
  },
  checkInTime: {
    type: String,
  },
  checkOutTime: {
    type: String,
  },
  remarks: {
    type: String,
  },
});

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalDays: {
    type: Number,
    default: 0,
  },
  presentDays: {
    type: Number,
    default: 0,
  },
  absentDays: {
    type: Number,
    default: 0,
  },
  lateDays: {
    type: Number,
    default: 0,
  },
  holidayDays: {
    type: Number,
    default: 0,
  },
  leaveDays: {
    type: Number,
    default: 0,
  },
  workingDays: {
    type: Number,
    default: 0,
  },
  halfPresentDays: {
    type: Number,
    default: 0,
  },
  halfAbsentDays: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  records: [attendanceRecordSchema],
}, {
  timestamps: true,
});

// Calculate statistics before saving
attendanceSchema.pre('save', function(next) {
  const workingDays = this.records.filter(record => 
    record.status !== 'holiday' && record.status !== 'leave'
  );
  this.totalDays = workingDays.length;
  
  // Calculate present days (full days only)
  this.presentDays = this.records.filter(record => record.status === 'present').length;
  
  // Calculate half present days
  this.halfPresentDays = this.records.filter(record => 
    record.status === 'half_present_morning' || 
    record.status === 'half_present_afternoon' || 
    record.status === 'half_present'
  ).length;
  
  // Calculate absent days (full days only)
  this.absentDays = this.records.filter(record => record.status === 'absent').length;
  
  // Calculate half absent days
  this.halfAbsentDays = this.records.filter(record => record.status === 'half_absent').length;
  
  this.lateDays = this.records.filter(record => record.status === 'late').length;
  this.holidayDays = this.records.filter(record => record.status === 'holiday').length;
  this.leaveDays = this.records.filter(record => record.status === 'leave').length;
  this.workingDays = this.records.filter(record => record.status === 'working').length;
  
  if (this.totalDays > 0) {
    // Include half days in the calculation (0.5 weight each)
    const totalPresentDays = this.presentDays + (this.halfPresentDays * 0.5) + this.lateDays;
    this.percentage = Math.round((totalPresentDays / this.totalDays) * 100);
  } else {
    this.percentage = 0; // Avoid division by zero
  } 
  
  next();
});

// Day Management Schema for holidays, leave, and working days
const dayManagementSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  dayType: {
    type: String,
    enum: ['holiday', 'leave', 'working'],
    required: true,
  },
  holidayType: {
    type: String,
    enum: ['students', 'staff', 'both'],
    default: 'both',
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Create compound index for date uniqueness
dayManagementSchema.index({ date: 1 }, { unique: true });

module.exports = {
  Attendance: mongoose.model('Attendance', attendanceSchema),
  DayManagement: mongoose.model('DayManagement', dayManagementSchema)
}; 