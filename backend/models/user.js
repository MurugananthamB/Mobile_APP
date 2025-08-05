// models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'management'],
    required: true,
  },
  // Employee ID for barcode scanning (MAPH format) - Optional for existing users
  employeeId: {
    type: String,
    required: false, // Make it optional for existing users
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty for students or existing users
        return /^MAPH\d+$/.test(v);
      },
      message: 'Employee ID must start with MAPH followed by numbers'
    }
  },
  // Staff-specific fields
  qualification: {
    type: String,
    required: function() { return this.role === 'staff' || this.role === 'management'; }
  },
  subject: {
    type: String,
    required: function() { return this.role === 'staff'; }
  },
  // Management-specific fields
  department: {
    type: String,
    required: function() { return this.role === 'management'; }
  },
  position: {
    type: String,
    required: function() { return this.role === 'management'; }
  },
  experience: {
    type: String,
    required: function() { return this.role === 'management'; }
  },
  // Additional profile fields
  profileImage: {
    type: String,
    default: null
  },
  // Contact information
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  // Student-specific fields
  rollNo: {
    type: String,
    default: null
  },
  assignedClass: {
    type: String,
    default: null
  },
  assignedSection: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: String,
    default: null
  },
  bloodGroup: {
    type: String,
    default: null
  },
  // Parent information (for students)
  parentName: {
    type: String,
    default: null
  },
  parentPhone: {
    type: String,
    default: null
  },
  emergencyContact: {
    type: String,
    default: null
  },
  // Hostel information (for students)
  hostelRoom: {
    type: String,
    default: null
  },
  hostelBlock: {
    type: String,
    default: null
  },
  hostelFloor: {
    type: String,
    default: null
  },
  hostelWarden: {
    type: String,
    default: null
  },
  hostelWardenPhone: {
    type: String,
    default: null
  },
  hostelCheckInDate: {
    type: String,
    default: null
  },
  hostelCheckOutDate: {
    type: String,
    default: null
  },
  isHostelResident: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better performance
userSchema.index({ userid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get safe user data (without password)
userSchema.methods.getSafeData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Export the model
module.exports = mongoose.model('User', userSchema);
