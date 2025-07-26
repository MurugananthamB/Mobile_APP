// controllers/homeworkController.js
const Homework = require('../models/homework');

// Get all homework for user's class
exports.getHomework = async (req, res) => {
  try {
    // For demo purposes, we'll use a default class. In real app, get from user profile
    const userClass = '10-A';
    
    let homework = await Homework.find({ assignedClass: userClass }).sort({ dueDate: 1 });
    
    if (homework.length === 0) {
      // Create default homework assignments
      const defaultHomework = [
        {
          title: 'Algebra Problems - Chapter 5',
          description: 'Complete exercises 1-20 from page 45. Show all work and submit by Friday.',
          subject: 'Mathematics',
          teacherName: 'Mr. Smith',
          assignedClass: userClass,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          priority: 'high',
          status: 'pending',
          attachments: [
            { filename: 'chapter5_exercises.pdf', url: '/uploads/math_ch5.pdf', type: 'pdf' }
          ]
        },
        {
          title: 'Essay on Climate Change',
          description: 'Write a 500-word essay on the impacts of climate change on our planet.',
          subject: 'English',
          teacherName: 'Ms. Johnson',
          assignedClass: userClass,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          priority: 'medium',
          status: 'pending'
        },
        {
          title: 'Chemistry Lab Report',
          description: 'Submit your lab report for the acid-base titration experiment.',
          subject: 'Chemistry',
          teacherName: 'Dr. Wilson',
          assignedClass: userClass,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          priority: 'medium',
          status: 'pending'
        }
      ];

      await Homework.insertMany(defaultHomework);
      homework = await Homework.find({ assignedClass: userClass }).sort({ dueDate: 1 });
    }

    // Check for user submissions
    homework = homework.map(hw => {
      const userSubmission = hw.submissions.find(sub => sub.userId.toString() === req.user.id);
      return {
        ...hw.toObject(),
        userSubmission: userSubmission || null,
        hasSubmitted: !!userSubmission
      };
    });

    res.json({ success: true, data: homework });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get specific homework by ID
exports.getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    const userSubmission = homework.submissions.find(sub => sub.userId.toString() === req.user.id);
    
    res.json({ 
      success: true, 
      data: {
        ...homework.toObject(),
        userSubmission: userSubmission || null,
        hasSubmitted: !!userSubmission
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Submit homework
exports.submitHomework = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const homework = await Homework.findById(req.params.id);
    
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Check if already submitted
    const existingSubmission = homework.submissions.find(sub => sub.userId.toString() === req.user.id);
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content;
      existingSubmission.attachments = attachments || [];
      existingSubmission.submittedAt = new Date();
    } else {
      // Create new submission
      homework.submissions.push({
        userId: req.user.id,
        content,
        attachments: attachments || [],
        submittedAt: new Date()
      });
    }

    await homework.save();

    res.json({ 
      success: true, 
      message: 'Homework submitted successfully',
      data: homework
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark homework as complete (for tracking purposes)
exports.markHomeworkComplete = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    // Find user's submission and mark as completed
    const userSubmission = homework.submissions.find(sub => sub.userId.toString() === req.user.id);
    
    if (!userSubmission) {
      return res.status(400).json({ success: false, message: 'No submission found to mark complete' });
    }

    // This could be used for local tracking on the client side
    res.json({ 
      success: true, 
      message: 'Homework marked as complete',
      data: { homeworkId: homework._id, submissionId: userSubmission._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 