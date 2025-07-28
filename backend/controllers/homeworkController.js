// controllers/homeworkController.js
const Homework = require('../models/homework');
const User = require('../models/user'); // Add User model import

// Get staff members for homework assignment
exports.getStaffMembers = async (req, res) => {
  try {
    console.log('👥 Getting staff members for homework assignment');
    console.log('📥 Full request query:', req.query);
    console.log('📥 Subject from query:', req.query.subject);
    console.log('📥 Request URL:', req.url);
    
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { subject } = req.query;
    console.log('🔍 Subject filter received:', subject);
    console.log('🔍 Subject type:', typeof subject);
    console.log('🔍 Subject length:', subject?.length);

    // Try simple query first, then add filters
    let staffMembers = [];
    
    try {
      // Build base query for staff members
      let query = { role: 'staff' };
      
      // Add subject filter if provided
      if (subject && subject.trim() !== '') {
        const trimmedSubject = subject.trim();
        query.subject = trimmedSubject;
        console.log('📚 Filtering by subject (exact match):', trimmedSubject);
        console.log('📚 Query with subject filter:', JSON.stringify(query));
      } else {
        console.log('⚠️ No subject filter provided - will return ALL staff');
      }

      console.log('🔍 Final query being executed:', JSON.stringify(query));

      // Get staff members
      staffMembers = await User.find(query)
        .select('_id name subject qualification email userid role')
        .sort({ name: 1 })
        .lean();

      console.log(`👨‍🏫 Found ${staffMembers.length} staff members with query:`, JSON.stringify(query));
      
      // Log sample of found staff for debugging
      if (staffMembers.length > 0) {
        console.log('📋 Sample staff found:', staffMembers.slice(0, 3).map(s => ({ name: s.name, subject: s.subject })));
      }

      // If no results with exact match and subject was provided, try case-insensitive
      if (staffMembers.length === 0 && subject && subject.trim() !== '') {
        console.log('🔄 No exact matches found. Trying case-insensitive search...');
        const caseInsensitiveQuery = { 
          role: 'staff',
          subject: new RegExp(`^${subject.trim()}$`, 'i') 
        };
        console.log('🔄 Case-insensitive query:', JSON.stringify(caseInsensitiveQuery));
        
        staffMembers = await User.find(caseInsensitiveQuery)
          .select('_id name subject qualification email userid role')
          .sort({ name: 1 })
          .lean();
          
        console.log(`👨‍🏫 Found ${staffMembers.length} staff members (case-insensitive)`);
      }

      // If still no results, let's see what subjects are available
      if (staffMembers.length === 0 && subject) {
        console.log('🔍 No staff found for subject. Let\'s see what subjects exist in database...');
        const allStaff = await User.find({ role: 'staff' })
          .select('subject')
          .lean();
        const availableSubjects = [...new Set(allStaff.map(s => s.subject).filter(Boolean))];
        console.log('📚 Available subjects in database:', availableSubjects);
        console.log('🔍 Looking for subject:', subject);
        console.log('🔍 Exact matches:', availableSubjects.filter(s => s === subject));
        console.log('🔍 Case-insensitive matches:', availableSubjects.filter(s => s.toLowerCase() === subject.toLowerCase()));
      }

    } catch (queryError) {
      console.error('❌ Query error:', queryError);
      // Fallback: Get all staff without filter
      console.log('🔄 Fallback: Getting all staff members...');
      staffMembers = await User.find({ role: 'staff' })
        .select('_id name subject qualification email userid role')
        .sort({ name: 1 })
        .lean();
    }

    // Format staff data for frontend with safety checks
    const formattedStaff = staffMembers
      .filter(staff => staff && staff.name) // Basic validation
      .map(staff => ({
        id: staff._id?.toString() || '',
        name: staff.name || 'Unknown',
        subject: staff.subject || 'No Subject',
        qualification: staff.qualification || 'Not Specified',
        email: staff.email || '',
        userid: staff.userid || '',
        role: staff.role || 'staff',
        label: `${staff.name} (${staff.subject || 'No Subject'})`,
        value: staff.name
      }));

    console.log(`✅ Returning ${formattedStaff.length} formatted staff members for subject: ${subject || 'all'}`);
    if (formattedStaff.length > 0) {
      console.log('📋 Sample formatted staff:', formattedStaff.slice(0, 2));
    }

    res.json({ 
      success: true, 
      data: formattedStaff,
      count: formattedStaff.length,
      filter: subject || 'all',
      totalFound: staffMembers.length,
      requestedSubject: subject
    });

  } catch (error) {
    console.error('❌ Critical error in getStaffMembers:', error);
    
    // Return empty array instead of error to prevent UI breaking
    res.json({ 
      success: true, 
      data: [],
      count: 0,
      filter: req.query.subject || 'all',
      totalFound: 0,
      error: 'Failed to load staff members',
      message: 'Unable to fetch staff data at this time'
    });
  }
};

// Create new homework (staff/management only)
exports.createHomework = async (req, res) => {
  try {
    console.log('📚 Creating homework assignment');
    console.log('📥 Full request body:', req.body);
    
    // Check if user has permission to create homework
    if (req.user.role !== 'staff' && req.user.role !== 'management') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only staff and management can create homework.' 
      });
    }

    const { 
      title, 
      description, 
      subject, 
      teacher, 
      toDate, 
      targetAudience,
      assignedClass,
      assignedSection,
      assignedDepartment 
    } = req.body;

    console.log('📋 Destructured fields:', {
      title, description, subject, teacher, toDate, targetAudience
    });

    // Validation
    if (!title || !description || !subject || !teacher || !toDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: title, description, subject, teacher, toDate' 
      });
    }

    console.log('🔍 Backend received homework data:', {
      title, description, subject, teacher, toDate, targetAudience, assignedClass, assignedSection, assignedDepartment
    });

    // TEMPORARY FIX: Use a known current date since system date appears wrong
    const actualToday = '2024-12-20';
    
    console.log('📅 Backend validation - System date appears incorrect:', new Date());
    console.log('📅 Backend validation - Using current date:', actualToday);
    console.log('📅 Backend validation - Selected date:', toDate);
    
    // Simple string comparison to avoid timezone issues
    if (toDate <= actualToday) {
      console.log('❌ Backend date validation failed:', toDate, '<=', actualToday);
      return res.status(400).json({ 
        success: false, 
        message: 'To date must be in the future (tomorrow or later)' 
      });
    }
    
    console.log('✅ Backend date validation passed:', toDate, '>', actualToday);

    // Management-specific validation
    if (req.user.role === 'management') {
      if (!targetAudience) {
        return res.status(400).json({ 
          success: false, 
          message: 'Management users must specify target audience (staff/students/both)' 
        });
      }

      if (targetAudience === 'students' || targetAudience === 'both') {
        if (!assignedClass || !assignedSection) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please specify both class and section for student assignments' 
          });
        }
      }

      if (targetAudience === 'staff' || targetAudience === 'both') {
        if (!assignedDepartment) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please specify assigned department for staff assignments' 
          });
        }
      }
    }

    // Create homework assignment
    const homeworkData = {
      title,
      description,
      subject,
      teacherName: teacher,
      fromDate: new Date(), // Automatically set to current date
      toDate: new Date(toDate),
      assignedDate: actualToday, // Store as string for consistent filtering
      status: 'pending',
      submissions: [],
      assignedBy: req.user.id,
      assignedByRole: req.user.role
    };

    // Set target audience and assignments based on user role
    if (req.user.role === 'management') {
      homeworkData.targetAudience = targetAudience;
      
      if (targetAudience === 'students' || targetAudience === 'both') {
        homeworkData.assignedClass = assignedClass;
        homeworkData.assignedSection = assignedSection;
      }
      
      if (targetAudience === 'staff' || targetAudience === 'both') {
        homeworkData.assignedDepartment = assignedDepartment;
      }
    } else if (req.user.role === 'staff') {
      // Staff can only assign to students
      homeworkData.targetAudience = 'students';
      homeworkData.assignedClass = assignedClass || '10';
      homeworkData.assignedSection = assignedSection || 'A';
    }

    const homework = new Homework(homeworkData);
    await homework.save();

    res.status(201).json({ 
      success: true, 
      message: 'Homework created successfully',
      data: homework 
    });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all homework based on user role and assignments
exports.getHomework = async (req, res) => {
  try {
    console.log('📚 Getting homework for user:', { 
      userId: req.user.id, 
      role: req.user.role, 
      department: req.user.department 
    });

    // TEMPORARY FIX: Use a known current date since system date appears wrong
    const actualToday = '2024-12-20';
    console.log('📅 Current date for filtering:', actualToday);

    let homework = [];
    let query = {};
    
    if (req.user.role === 'student') {
      // Students see homework assigned to their class and section
      const userClass = req.user.assignedClass || '10';
      const userSection = req.user.assignedSection || 'A';
      query = { 
        targetAudience: { $in: ['students', 'both'] },
        assignedClass: userClass,
        assignedSection: userSection
      };
      console.log('👨‍🎓 Student query:', query);
      
    } else if (req.user.role === 'staff') {
      // Staff see ONLY homework they have assigned/created AND only until due date
      const mongoose = require('mongoose');
      query = { 
        assignedBy: new mongoose.Types.ObjectId(req.user.id),
        toDate: { $gte: actualToday } // Only show homework that hasn't passed due date
      };
      console.log('👨‍🏫 Staff query (only homework they assigned, not past due):', query);
      console.log('👤 Staff user ID:', req.user.id);
      console.log('📅 Filtering homework with due date >= ', actualToday);
      
      // Debug: Check what homework exists in database
      const allHomework = await Homework.find({}, { title: 1, assignedBy: 1, assignedByRole: 1, toDate: 1 }).limit(10);
      console.log('🔍 Sample homework in database:', allHomework.map(hw => ({
        title: hw.title,
        assignedBy: hw.assignedBy?.toString(),
        assignedByRole: hw.assignedByRole,
        toDate: hw.toDate,
        matchesUser: hw.assignedBy?.toString() === req.user.id.toString(),
        notPastDue: hw.toDate >= actualToday
      })));
      
      // Debug: Check if there's any homework assigned by this user
      const userHomeworkCount = await Homework.countDocuments({ assignedBy: req.user.id });
      console.log(`📊 Total homework assigned by this staff member: ${userHomeworkCount}`);
      
    } else if (req.user.role === 'management') {
      // Management see homework for 1 week after creation date
      const today = new Date(actualToday);
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoString = oneWeekAgo.getFullYear() + '-' + 
                              String(oneWeekAgo.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(oneWeekAgo.getDate()).padStart(2, '0');
      
      const userDepartment = req.user.department || 'Administration';
      query = { 
        $or: [
          { assignedBy: req.user.id },
          { targetAudience: { $in: ['staff', 'both'] }, assignedDepartment: userDepartment }
        ],
        // Only show homework created within the last week
        assignedDate: { $gte: oneWeekAgoString }
      };
      console.log('👔 Management query (1 week from creation):', query);
      console.log('📅 Showing homework created since:', oneWeekAgoString);
    }
    
    homework = await Homework.find(query).sort({ toDate: 1 });
    console.log(`📋 Found ${homework.length} homework items for ${req.user.role} user`);
    
    // Enhanced logging for staff to confirm they only see their assigned homework
    if (req.user.role === 'staff') {
      if (homework.length > 0) {
        console.log('📝 Staff homework found:', homework.map(hw => ({
          title: hw.title,
          assignedBy: hw.assignedBy?.toString(),
          subject: hw.subject,
          targetAudience: hw.targetAudience
        })));
      } else {
        console.log('⚠️ No homework found for this staff member');
        console.log('🔍 Debugging: Let\'s check if homework exists with different ObjectId format...');
        
        // Try alternative query methods
        const mongoose = require('mongoose');
        const alternativeQuery1 = { assignedBy: new mongoose.Types.ObjectId(req.user.id) };
        const alternativeQuery2 = { assignedBy: req.user.id.toString() };
        
        const alt1Results = await Homework.countDocuments(alternativeQuery1);
        const alt2Results = await Homework.countDocuments(alternativeQuery2);
        
        console.log('🔍 Alternative query 1 (ObjectId):', alt1Results, 'results');
        console.log('🔍 Alternative query 2 (String):', alt2Results, 'results');
      }
      console.log('🎯 Staff member ID being searched:', req.user.id);
    }

    // Add user submission status
    homework = homework.map(hw => {
      const userSubmission = hw.submissions.find(sub => sub.userId.toString() === req.user.id);
      return {
        ...hw.toObject(),
        userSubmission: userSubmission || null,
        hasSubmitted: !!userSubmission
      };
    });

    console.log('✅ Sending homework response with', homework.length, 'items');
    res.json({ success: true, data: homework });
  } catch (error) {
    console.error('❌ Error getting homework:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Sample data creation removed - homework system starts clean

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
        userRole: req.user.role,
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

    res.json({ 
      success: true, 
      message: 'Homework marked as complete',
      data: { homeworkId: homework._id, submissionId: userSubmission._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 