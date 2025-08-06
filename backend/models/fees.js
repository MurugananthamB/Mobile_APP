// models/fees.js
const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paid: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

const feeTermSchema = new mongoose.Schema({
  termName: {
    type: String,
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  feeItems: [feeItemSchema],
  paymentHistory: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: String,
    transactionId: String,
  }],
});

const feesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentClass: {
    type: String,
    required: true,
  },
  terms: [feeTermSchema],
  totalPending: {
    type: Number,
    default: 0,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate totals before saving
feesSchema.pre('save', function(next) {
  let totalPending = 0;
  let totalPaid = 0;
  
  this.terms.forEach(term => {
    totalPending += (term.totalAmount - term.paidAmount);
    totalPaid += term.paidAmount;
  });
  
  this.totalPending = totalPending;
  this.totalPaid = totalPaid;
  
  next();
});

module.exports = mongoose.model('Fees', feesSchema); 