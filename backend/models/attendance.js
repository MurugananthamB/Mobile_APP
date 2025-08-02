// models/attendance.js
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'holiday', 'leave', 'working'],
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
  this.presentDays = this.records.filter(record => record.status === 'present').length;
  this.absentDays = this.records.filter(record => record.status === 'absent').length;
  this.lateDays = this.records.filter(record => record.status === 'late').length;
  this.holidayDays = this.records.filter(record => record.status === 'holiday').length;
  this.leaveDays = this.records.filter(record => record.status === 'leave').length;
  this.workingDays = this.records.filter(record => record.status === 'working').length;
  
  if (this.totalDays > 0) {
    this.percentage = Math.round((this.presentDays + this.lateDays) / this.totalDays * 100);
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