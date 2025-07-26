// models/timetable.js
const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  teacher: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'break', 'assembly', 'sports'],
    default: 'lecture',
  },
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    required: true,
  },
  periods: [periodSchema],
});

const timetableSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  schedule: [dayScheduleSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Timetable', timetableSchema); 