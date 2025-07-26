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
  assignedClass: {
    type: String,
    required: true,
  },
  assignedDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
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
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    content: String,
    attachments: [attachmentSchema],
    grade: String,
    feedback: String,
  }],
  maxMarks: {
    type: Number,
    default: 100,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Homework', homeworkSchema); 