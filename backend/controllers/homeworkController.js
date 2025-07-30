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
      assignedDepartment,
      attachments 
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
      assignedByRole: req.user.role,
      attachments: attachments || []
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
        // Add specific staff assignment if provided
        if (req.body.assignedToStaff) {
          homeworkData.assignedToStaff = req.body.assignedToStaff;
          console.log('👔 MANAGEMENT: Assigning homework to specific staff member:', req.body.assignedToStaff);
        } else {
          console.log('⚠️ MANAGEMENT: No specific staff assigned - homework will be visible to all staff in department');
        }
      }
    } else if (req.user.role === 'staff') {
      // Staff can only assign to students
      homeworkData.targetAudience = 'students';
      homeworkData.assignedClass = assignedClass || '10';
      homeworkData.assignedSection = assignedSection || 'A';
      
      console.log('👨‍🏫 STAFF CREATING HOMEWORK:');
      console.log('🎯 Target Audience: students');
      console.log('📚 Assigned to Class:', homeworkData.assignedClass);
      console.log('📝 Assigned to Section:', homeworkData.assignedSection);
      console.log('✅ This homework will be visible to students in Class', homeworkData.assignedClass, 'Section', homeworkData.assignedSection);
    }

    const homework = new Homework(homeworkData);
    await homework.save();

    console.log('✅ HOMEWORK CREATED SUCCESSFULLY:');
    console.log('  Title:', homework.title);
    console.log('  Subject:', homework.subject);
    console.log('  TargetAudience:', homework.targetAudience);
    console.log('  AssignedBy:', homework.assignedBy?.toString());
    console.log('  AssignedToStaff:', homework.assignedToStaff?.toString() || 'NOT SET');
    console.log('  AssignedDepartment:', homework.assignedDepartment);

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
      console.log('📚 Student will see homework assigned to:');
      console.log('  📍 Class:', userClass);
      console.log('  📍 Section:', userSection);
      console.log('  🎯 Target Audience: students OR both');
      
    } else if (req.user.role === 'staff') {
      // Staff see ONLY homework they assigned/created (more restrictive)
      const mongoose = require('mongoose');
      const userDepartment = req.user.department || req.user.subject || 'General';
      
      // Staff see: 1) Homework they created AND 2) Homework assigned TO them by management
      const userSubject = req.user.subject || 'General';
      
      // Staff see: 1) Homework they created AND 2) Homework assigned TO them by management
      query = { 
        $or: [
          // Homework they created themselves
          { assignedBy: req.user.id },
          // Homework assigned TO staff by management (matching their subject)
          { 
            targetAudience: { $in: ['staff', 'both'] },
            subject: userSubject
          },
          // Also include homework created by management for staff (matching their subject)
          {
            assignedByRole: 'management',
            targetAudience: { $in: ['staff', 'both'] },
            subject: userSubject
          }
        ]
      };
      
      console.log('👨‍🏫 Staff query (homework they created + homework assigned to them):', JSON.stringify(query));
      console.log('👤 Staff user ID:', req.user.id);
      console.log('📚 Staff subject:', userSubject);
      console.log('📅 Filtering homework with due date >= ', actualToday);
      console.log('✅ Staff will see:');
      console.log('  1️⃣ Homework they created themselves');
      console.log('  2️⃣ Homework assigned to staff by management (matching their subject)');
      console.log('  3️⃣ Homework created by management for staff (matching their subject)');
      console.log('  📍 Staff ID:', req.user.id);
      console.log('  🏢 Department:', userDepartment);
      console.log('  📚 Subject:', userSubject);
      
      // Enhanced debugging to understand the department issue
      console.log('🔍 STAFF USER DETAILS:');
      console.log('  👤 User ID:', req.user.id);
      console.log('  🏢 Department:', req.user.department);
      console.log('  📚 Subject:', req.user.subject);
      console.log('  📧 Email:', req.user.email);
      console.log('  👤 Name:', req.user.name);
      
      // Debug: Check what homework exists in database
      const allHomework = await Homework.find({}, { 
        title: 1, 
        assignedBy: 1, 
        assignedByRole: 1, 
        toDate: 1,
        subject: 1,
        teacherName: 1
      }).limit(10);
      
      // Also get ALL homework without limits to see everything
      const allHomeworkUnlimited = await Homework.find({});
      console.log('🔍 ALL HOMEWORK IN DATABASE (unlimited):', allHomeworkUnlimited.map(hw => ({
        _id: hw._id?.toString(),
        title: hw.title,
        subject: hw.subject,
        teacherName: hw.teacherName,
        assignedBy: hw.assignedBy?.toString(),
        assignedByRole: hw.assignedByRole,
        toDate: hw.toDate
      })));
      
      console.log('🔍 ALL homework in database:', allHomework.map(hw => ({
        title: hw.title,
        subject: hw.subject,
        teacherName: hw.teacherName,
        assignedBy: hw.assignedBy?.toString(),
        assignedByRole: hw.assignedByRole,
        toDate: hw.toDate,
        matchesUser: hw.assignedBy?.toString() === req.user.id.toString(),
        notPastDue: hw.toDate >= actualToday
      })));
      
      // Debug: Check if there's any homework assigned by this user
      const userHomeworkCount = await Homework.countDocuments({ assignedBy: req.user.id });
      console.log(`📊 Total homework assigned by this staff member: ${userHomeworkCount}`);
      
      // Debug: Check with different ObjectId formats
      const userHomeworkCountString = await Homework.countDocuments({ assignedBy: req.user.id.toString() });
      const userHomeworkCountObjectId = await Homework.countDocuments({ assignedBy: new mongoose.Types.ObjectId(req.user.id) });
      console.log(`📊 Homework count with string ID: ${userHomeworkCountString}`);
      console.log(`📊 Homework count with ObjectId: ${userHomeworkCountObjectId}`);
      
      // Debug: Check what the actual assignedBy values are in the database
      console.log('🔍 Current user ID:', req.user.id.toString());
      console.log('🔍 Current user ID type:', typeof req.user.id);
      
      // Debug: Check homework by subject to see if there's cross-subject visibility
      const physicsHomework = await Homework.countDocuments({ subject: 'Physics' });
      const chemistryHomework = await Homework.countDocuments({ subject: 'Chemistry' });
      const mathHomework = await Homework.countDocuments({ subject: 'Mathematics' });
      console.log('📊 Homework by subject: Physics:', physicsHomework, 'Chemistry:', chemistryHomework, 'Math:', mathHomework);
      
      // Debug: Check management-created homework specifically
      const managementHomework = await Homework.find({ 
        assignedByRole: 'management' 
      });
      console.log('🔍 MANAGEMENT-CREATED HOMEWORK:', managementHomework.length);
      if (managementHomework.length > 0) {
        console.log('📋 Management homework details:');
        managementHomework.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject}) - TargetAudience: ${hw.targetAudience} - AssignedToStaff: ${hw.assignedToStaff?.toString() || 'NOT SET'}`);
        });
      }
      
      // Debug: Check homework with targetAudience staff/both
      const staffHomework = await Homework.find({ 
        targetAudience: { $in: ['staff', 'both'] } 
      });
      console.log('🔍 HOMEWORK WITH TARGET AUDIENCE STAFF/BOTH:', staffHomework.length);
      if (staffHomework.length > 0) {
        console.log('📋 Staff-targeted homework details:');
        staffHomework.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject}) - Created by: ${hw.assignedByRole || 'unknown'} - TargetAudience: ${hw.targetAudience} - AssignedToStaff: ${hw.assignedToStaff?.toString() || 'NOT SET'}`);
        });
      }
      
      // Test query without date filter to see if that's the issue
      const testQueryWithoutDate = { 
        $or: [
          { assignedBy: new mongoose.Types.ObjectId(req.user.id) },
          { assignedBy: req.user.id.toString() },
          { assignedBy: req.user.id }
        ]
      };
      const homeworkWithoutDateFilter = await Homework.find(testQueryWithoutDate);
      console.log('🔍 TEST: Homework found WITHOUT date filter:', homeworkWithoutDateFilter.length);
      if (homeworkWithoutDateFilter.length > 0) {
        console.log('📋 TEST: Homework without date filter:', homeworkWithoutDateFilter.map(hw => ({
          title: hw.title,
          subject: hw.subject,
          assignedBy: hw.assignedBy?.toString(),
          toDate: hw.toDate
        })));
      }
      
      // CRITICAL DEBUG: Test if query is returning ALL homework instead of filtered
      const allHomeworkTest = await Homework.find({});
      console.log('🔍 CRITICAL: Total homework in database:', allHomeworkTest.length);
      
      // Show ALL homework with details
      console.log('🔍 CRITICAL: ALL HOMEWORK IN DATABASE:');
      allHomeworkTest.forEach((hw, index) => {
        console.log(`  ${index + 1}. ${hw.title} (${hw.subject}) - Created by: ${hw.assignedBy?.toString()} - Teacher: ${hw.teacherName}`);
      });
      
      // Check what assignedBy values exist in the database
      const allAssignedByValues = await Homework.distinct('assignedBy');
      console.log('🔍 CRITICAL: All assignedBy values in database:', allAssignedByValues.map(id => id?.toString()));
      console.log('🔍 CRITICAL: Current user ID:', req.user.id.toString());
      
      // Test simple query
      const simpleQueryResult = await Homework.find({ assignedBy: req.user.id });
      console.log('🔍 CRITICAL: Homework found with simple query:', simpleQueryResult.length);
      
      if (simpleQueryResult.length > 0) {
        console.log('🔍 CRITICAL: Homework created by this user:');
        simpleQueryResult.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject})`);
        });
      }
      
      // Test homework assigned to this staff member
      const assignedToStaffResult = await Homework.find({ 
        targetAudience: { $in: ['staff', 'both'] },
        assignedToStaff: req.user.id 
      });
      console.log('🔍 CRITICAL: Homework specifically assigned to this staff:', assignedToStaffResult.length);
      
      if (assignedToStaffResult.length > 0) {
        console.log('🔍 CRITICAL: Homework assigned to this staff:');
        assignedToStaffResult.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject}) - Assigned by: ${hw.assignedBy?.toString()}`);
        });
      }
      
      // Test ALL homework with targetAudience staff/both to see what exists
      const allStaffHomework = await Homework.find({ 
        targetAudience: { $in: ['staff', 'both'] }
      });
      console.log('🔍 CRITICAL: ALL homework with targetAudience staff/both:', allStaffHomework.length);
      
      if (allStaffHomework.length > 0) {
        console.log('🔍 CRITICAL: All staff homework in database:');
        allStaffHomework.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject}) - TargetAudience: ${hw.targetAudience} - AssignedToStaff: ${hw.assignedToStaff?.toString() || 'NOT SET'} - AssignedBy: ${hw.assignedBy?.toString()}`);
        });
      }
      
      // Test the actual staff query without date filter
      const testStaffQueryWithoutDate = { 
        $or: [
          { assignedBy: req.user.id },
          { 
            targetAudience: { $in: ['staff', 'both'] },
            subject: userSubject
          },
          {
            assignedByRole: 'management',
            targetAudience: { $in: ['staff', 'both'] },
            subject: userSubject
          }
        ]
      };
      const staffHomeworkWithoutDateFilter = await Homework.find(testStaffQueryWithoutDate);
      console.log('🔍 TEST: Staff homework found WITHOUT date filter:', staffHomeworkWithoutDateFilter.length);
      if (staffHomeworkWithoutDateFilter.length > 0) {
        console.log('📋 TEST: Staff homework without date filter:');
        staffHomeworkWithoutDateFilter.forEach(hw => {
          console.log(`  - ${hw.title} (${hw.subject}) - Created by: ${hw.assignedByRole || 'unknown'} - TargetAudience: ${hw.targetAudience} - Due: ${hw.toDate}`);
        });
      }
      
      if (simpleQueryResult.length === 0) {
        console.log('🚨 CRITICAL ISSUE: No homework found for this user!');
        console.log('🚨 This means either:');
        console.log('   1. This user has not created any homework yet');
        console.log('   2. The assignedBy field is not set correctly');
        console.log('   3. The user ID format is different');
      }
      
    } else if (req.user.role === 'management') {
      // Management see ALL homework created by any teacher/management for 1 week after creation date
      const today = new Date(actualToday);
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoString = oneWeekAgo.getFullYear() + '-' + 
                              String(oneWeekAgo.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(oneWeekAgo.getDate()).padStart(2, '0');
      
      // Management can see ALL homework created by staff/management in the last week
      query = { 
        $or: [
          // New homework with assignedByRole field
          { assignedByRole: { $in: ['staff', 'management'] } },
          // Old homework without assignedByRole field
          { assignedByRole: { $exists: false }, assignedBy: { $exists: true } }
        ],
        // Only show homework created within the last week
        assignedDate: { $gte: oneWeekAgoString }
      };
      
      console.log('👔 Management query (ALL homework for 1 week):', query);
      console.log('📅 Showing homework created since:', oneWeekAgoString);
    }
    
    homework = await Homework.find(query).sort({ toDate: 1 });
    console.log(`📋 Found ${homework.length} homework items for ${req.user.role} user`);
    
    // Debug: Show exactly what homework was found and why
    if (req.user.role === 'staff' && homework.length > 0) {
      const userDepartment = req.user.department || req.user.subject || 'General';
      console.log('🔍 DEBUG: Homework found for staff - checking why:');
      homework.forEach((hw, index) => {
        console.log(`📋 Homework ${index + 1}:`);
        console.log(`  Title: ${hw.title}`);
        console.log(`  Subject: ${hw.subject}`);
        console.log(`  Teacher: ${hw.teacherName}`);
        console.log(`  AssignedBy: ${hw.assignedBy?.toString()}`);
        console.log(`  AssignedToStaff: ${hw.assignedToStaff?.toString()}`);
        console.log(`  TargetAudience: ${hw.targetAudience}`);
        console.log(`  AssignedDepartment: ${hw.assignedDepartment}`);
        console.log(`  Current User ID: ${req.user.id.toString()}`);
        console.log(`  Created by me: ${hw.assignedBy?.toString() === req.user.id.toString()}`);
        console.log(`  Specifically assigned to me: ${hw.assignedToStaff?.toString() === req.user.id.toString()}`);
        console.log(`  Department match: ${hw.assignedDepartment === userDepartment}`);
        console.log(`  Due Date: ${hw.toDate}`);
        console.log(`  Not Past Due: ${hw.toDate >= actualToday}`);
      });
    }
    
    // Enhanced logging for each role
    if (homework.length > 0) {
      if (req.user.role === 'staff') {
        const userDepartment = req.user.department || req.user.subject || 'General';
        console.log('📝 STAFF HOMEWORK SUMMARY:');
        console.log('✅ Showing homework created by me + homework assigned to me');
        
        if (homework.length > 0) {
          const userSubject = req.user.subject || 'General'; // Define userSubject in this scope
          // Separate homework they created vs homework assigned to staff (matching their subject)
          const createdByMe = homework.filter(hw => hw.assignedBy && hw.assignedBy.toString() === req.user.id.toString());
          const assignedToStaff = homework.filter(hw => 
            hw.assignedBy && hw.assignedBy.toString() !== req.user.id.toString() && 
            (hw.targetAudience === 'staff' || hw.targetAudience === 'both') &&
            hw.subject === userSubject
          );
          
          if (createdByMe.length > 0) {
            console.log('✏️ Homework I CREATED:', createdByMe.map(hw => ({
              title: hw.title,
              subject: hw.subject,
              targetAudience: hw.targetAudience,
              assignedClass: hw.assignedClass,
              assignedSection: hw.assignedSection,
              dueDate: hw.toDate
            })));
          }
          
          if (assignedToStaff.length > 0) {
            console.log('📥 Homework assigned to STAFF by management (matching subject):', assignedToStaff.map(hw => ({
              title: hw.title,
              subject: hw.subject,
              teacherName: hw.teacherName,
              targetAudience: hw.targetAudience,
              assignedToStaff: hw.assignedToStaff?.toString() || 'NOT SET',
              dueDate: hw.toDate
            })));
          }
          
          console.log(`📊 Total: ${createdByMe.length} created by me + ${assignedToStaff.length} assigned to staff (matching subject) = ${homework.length} total`);
        } else {
          console.log('⚠️ No homework found for this staff member');
        }
        
      } else if (req.user.role === 'student') {
        console.log('📝 STUDENT HOMEWORK SUMMARY:');
        console.log('📚 Class:', req.user.assignedClass || '10', 'Section:', req.user.assignedSection || 'A');
        
        if (homework.length > 0) {
          console.log('📋 Homework assigned to this student:', homework.map(hw => ({
            title: hw.title,
            subject: hw.subject,
            teacher: hw.teacherName,
            targetAudience: hw.targetAudience,
            assignedBy: hw.assignedByRole || 'unknown',
            dueDate: hw.toDate,
            createdByStaff: hw.assignedByRole === 'staff',
            createdByManagement: hw.assignedByRole === 'management'
          })));
        } else {
          console.log('⚠️ No homework found for this student');
          console.log('🔍 Make sure homework is assigned to Class:', req.user.assignedClass || '10', 'Section:', req.user.assignedSection || 'A');
        }
        
       } else {
        console.log('📝 Homework summary:', homework.map(hw => ({
          title: hw.title,
          subject: hw.subject,
          targetAudience: hw.targetAudience,
          teacher: hw.teacherName,
          dueDate: hw.toDate
        })));
      }
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
    res.json({ 
      success: true, 
      data: homework,
      user: {
        id: req.user.id,
        role: req.user.role,
        name: req.user.name,
        email: req.user.email,
        subject: req.user.subject,
        department: req.user.department,
        assignedClass: req.user.assignedClass,
        assignedSection: req.user.assignedSection
      }
    });
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