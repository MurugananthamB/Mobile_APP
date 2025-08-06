// models/attendance.js
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
<<<<<<< HEAD
    enum: ['present', 'absent', 'late', 'holiday', 'leave', 'working'],
=======
    enum: ['present', 'absent', 'late', 'holiday', 'leave', 'working', 'half_present_morning', 'half_present_afternoon', 'half_absent'],
>>>>>>> 08d5d5a (attendance page maual push working)
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
<<<<<<< HEAD
  this.presentDays = this.records.filter(record => record.status === 'present').length;
  this.absentDays = this.records.filter(record => record.status === 'absent').length;
=======
  
  // Calculate present and half-present days
  this.presentDays = this.records.reduce((sum, record) => {
    if (record.status === 'present') return sum + 1; // Full Day Present
    if (record.status === 'half_present_morning' || record.status === 'half_present_afternoon') return sum + 0.5; // Half Day Present (Morning or Afternoon)
    if (record.status === 'half_present') return sum + 0.5;
    return sum;
  }, 0);
  
  this.absentDays = this.records.reduce((sum, record) => {
    if (record.status === 'absent') return sum + 1;
    if (record.status === 'half_absent') return sum + 0.5;
    return sum;
  }, 0);
  
>>>>>>> 08d5d5a (attendance page maual push working)
  this.lateDays = this.records.filter(record => record.status === 'late').length;
  this.holidayDays = this.records.filter(record => record.status === 'holiday').length;
  this.leaveDays = this.records.filter(record => record.status === 'leave').length;
  this.workingDays = this.records.filter(record => record.status === 'working').length;
  
  if (this.totalDays > 0) {
    this.percentage = Math.round((this.presentDays + this.lateDays) / this.totalDays * 100);
<<<<<<< HEAD
  }
=======
  } else {
    this.percentage = 0; // Avoid division by zero
  } 
>>>>>>> 08d5d5a (attendance page maual push working)
  
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