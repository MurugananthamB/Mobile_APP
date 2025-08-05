// models/events.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
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
  venue: {
    type: String,
    required: true,
  },
  currentAttendees: {
    type: Number,
    default: 0,
  },
  validityDate: {
    type: Date,
    required: true,
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  requirements: [String],
  prizes: [String],
  registeredUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'absent'],
      default: 'registered',
    },
  }],
  images: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema); 