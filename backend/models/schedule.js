// models/schedule.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  uri: String,
  size: Number,
  type: String,
  mimeType: String,
});

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  scheduleType: {
    type: String,
    enum: ['study', 'exam', 'revision', 'assignment', 'project'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  studyHours: {
    type: String,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ['students', 'staff', 'both'],
    default: 'students',
    required: true
  },
  // For student schedules - separate class and section
  assignedClass: {
    type: String,
    required: function() { 
      return this.targetAudience === 'students' || this.targetAudience === 'both'; 
    }
  },
  assignedSection: {
    type: String,
    required: function() { 
      return this.targetAudience === 'students' || this.targetAudience === 'both'; 
    }
  },
  // For staff schedules  
  assignedDepartment: {
    type: String,
    required: function() { 
      return this.targetAudience === 'staff' || this.targetAudience === 'both'; 
    }
  },
  attachments: [attachmentSchema],
  
  // Schedule metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['staff', 'management'],
    required: true
  },
  teacher: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
});

// Index for better performance
scheduleSchema.index({ targetAudience: 1, assignedClass: 1, assignedSection: 1, assignedDepartment: 1 });
scheduleSchema.index({ createdBy: 1 });
scheduleSchema.index({ toDate: 1 });
scheduleSchema.index({ scheduleType: 1 });
scheduleSchema.index({ subject: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema); 