// models/notices.js
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'academic', 'sports', 'event', 'holiday'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  targetAudience: {
    type: [String],
    default: ['all'],
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
  attachments: [{
    filename: String,
    url: String,
    type: String,
  }],
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