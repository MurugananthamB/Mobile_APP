// models/notices.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  uri: String,
  size: Number,
  type: String,
  mimeType: String,
});

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },

  targetAudience: {
    type: String,
    enum: ['all', 'students', 'staff'],
    default: 'all',
  },
  class: {
    type: String,
    default: '',
  },
  section: {
    type: String,
    default: '',
  },
  publishedBy: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  attachments: [attachmentSchema],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalViews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notice', noticeSchema); 