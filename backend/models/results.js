// models/results.js
const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
  },
});

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examType: {
    type: String,
    enum: ['unit_test', 'mid_term', 'final_exam', 'annual_exam'],
    required: true,
  },
  examName: {
    type: String,
    required: true,
  },
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
  subjects: [subjectResultSchema],
  totalMarksObtained: {
    type: Number,
    required: true,
  },
  totalMaxMarks: {
    type: Number,
    required: true,
  },
  overallPercentage: {
    type: Number,
    required: true,
  },
  overallGrade: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
  },
  resultDate: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Calculate totals before saving
resultSchema.pre('save', function(next) {
  let totalObtained = 0;
  let totalMax = 0;
  
  this.subjects.forEach(subject => {
    totalObtained += subject.marksObtained;
    totalMax += subject.totalMarks;
  });
  
  this.totalMarksObtained = totalObtained;
  this.totalMaxMarks = totalMax;
  this.overallPercentage = Math.round((totalObtained / totalMax) * 100);
  
  // Calculate grade based on percentage
  if (this.overallPercentage >= 90) this.overallGrade = 'A+';
  else if (this.overallPercentage >= 80) this.overallGrade = 'A';
  else if (this.overallPercentage >= 70) this.overallGrade = 'B+';
  else if (this.overallPercentage >= 60) this.overallGrade = 'B';
  else if (this.overallPercentage >= 50) this.overallGrade = 'C';
  else if (this.overallPercentage >= 40) this.overallGrade = 'D';
  else this.overallGrade = 'F';
  
  next();
});

module.exports = mongoose.model('Result', resultSchema); 