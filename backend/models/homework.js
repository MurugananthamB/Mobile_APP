// models/homework.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  type: String,
});

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
  // NEW: Target audience for management assignments
  targetAudience: {
    type: String,
    enum: ['students', 'staff', 'both'],
    default: 'students',
    required: true
  },
  // For student assignments - separate class and section
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
  // For staff assignments  
  assignedDepartment: {
    type: String,
    required: function() { 
      return this.targetAudience === 'staff' || this.targetAudience === 'both'; 
    }
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  assignedDate: {
    type: String, // Changed to string for consistent filtering
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'submitted', 'completed', 'overdue'],
    default: 'pending',
  },
  attachments: [attachmentSchema],
  submissions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userRole: {
      type: String,
      enum: ['student', 'staff'],
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    content: String,
    attachments: [attachmentSchema],
    grade: String,
    feedback: String,
  }],

  // NEW: Assignment metadata
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedByRole: {
    type: String,
    enum: ['staff', 'management'],
    required: true
  }
}, {
  timestamps: true,
});

// Index for better performance
homeworkSchema.index({ targetAudience: 1, assignedClass: 1, assignedSection: 1, assignedDepartment: 1 });
homeworkSchema.index({ assignedBy: 1 });
homeworkSchema.index({ fromDate: 1, toDate: 1 });

module.exports = mongoose.model('Homework', homeworkSchema); 