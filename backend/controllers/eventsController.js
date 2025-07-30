// controllers/eventsController.js
const Event = require('../models/events');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    console.log('🎯 Get Events Request Received');
    console.log('👤 User:', req.user);
    
    const events = await Event.find({ isRegistrationOpen: true }).sort({ date: 1 });
    console.log('📊 Found events:', events.length);

    // Add user registration status
    const eventsWithRegistration = events.map(event => {
      const userRegistration = event.registeredUsers.find(reg => reg.userId.toString() === req.user.id);
      return {
        ...event.toObject(),
        isRegistered: !!userRegistration,
        userRegistrationStatus: userRegistration ? userRegistration.status : null
      };
    });

    console.log('✅ Sending events response:', {
      success: true,
      count: eventsWithRegistration.length,
      events: eventsWithRegistration.map(e => ({ title: e.title, category: e.category, date: e.date }))
    });

    res.json({ success: true, data: eventsWithRegistration });
  } catch (error) {
    console.error('❌ Error getting events:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    console.log('🎯 Create Event Request Received');
    console.log('👤 User:', req.user);
    console.log('📝 Request Body:', req.body);
    
    // Check if user has permission to create events (management or staff)
    if (req.user.role !== 'management' && req.user.role !== 'staff') {
      console.log('❌ Permission denied - User role:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Only management and staff can create events' 
      });
    }

    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venue,
      validityDate,
      organizer,
      requirements,
      prizes
    } = req.body;

    // Validate required fields
    console.log('🔍 Validating required fields...');
    console.log('Title:', !!title);
    console.log('Description:', !!description);
    console.log('Category:', !!category);
    console.log('Date:', !!date);
    console.log('StartTime:', !!startTime);
    console.log('EndTime:', !!endTime);
    console.log('Venue:', !!venue);
    console.log('ValidityDate:', !!validityDate);
    
    if (!title || !description || !category || !date || !startTime || !endTime || !venue || !validityDate) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate dates
    console.log('📅 Date validation...');
    console.log('Raw date:', date);
    console.log('Raw validityDate:', validityDate);
    
    const eventDate = new Date(date);
    const validity = new Date(validityDate);
    const today = new Date();
    
    console.log('Parsed eventDate:', eventDate);
    console.log('Parsed validity:', validity);
    console.log('Today:', today);
    console.log('EventDate valid:', !isNaN(eventDate.getTime()));
    console.log('Validity valid:', !isNaN(validity.getTime()));

    if (isNaN(eventDate.getTime())) {
      console.log('❌ Invalid event date format');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event date format. Please use YYYY-MM-DD' 
      });
    }

    if (isNaN(validity.getTime())) {
      console.log('❌ Invalid validity date format');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid validity date format. Please use YYYY-MM-DD' 
      });
    }

    if (eventDate <= today) {
      console.log('❌ Event date is not in the future');
      return res.status(400).json({ 
        success: false, 
        message: 'Event date must be in the future' 
      });
    }

    if (validity <= today) {
      console.log('❌ Validity date is not in the future');
      return res.status(400).json({ 
        success: false, 
        message: 'Validity date must be in the future' 
      });
    }

    if (validity > eventDate) {
      console.log('❌ Validity date is after event date');
      return res.status(400).json({ 
        success: false, 
        message: 'Validity date cannot be after the event date' 
      });
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      category,
      date: eventDate,
      startTime,
      endTime,
      venue,
      currentAttendees: 0,
      validityDate: validity,
      organizer: organizer || `${req.user.name} (${req.user.role})`,
      requirements: requirements || [],
      prizes: prizes || [],
      isRegistrationOpen: true,
      registeredUsers: []
    });

    await newEvent.save();

    console.log('✅ Event created successfully:', {
      title: newEvent.title,
      category: newEvent.category,
      date: newEvent.date,
      validityDate: newEvent.validityDate,
      createdBy: req.user.name,
      userRole: req.user.role
    });

    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const userRegistration = event.registeredUsers.find(reg => reg.userId.toString() === req.user.id);
    
    res.json({ 
      success: true, 
      data: {
        ...event.toObject(),
        isRegistered: !!userRegistration,
        userRegistrationStatus: userRegistration ? userRegistration.status : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = event.registeredUsers.find(reg => reg.userId.toString() === req.user.id);
    
    if (existingRegistration) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }



    // Check registration deadline
    if (new Date() > event.validityDate) {
      return res.status(400).json({ success: false, message: 'Registration validity date has passed' });
    }

    // Register user
    event.registeredUsers.push({
      userId: req.user.id,
      registeredAt: new Date(),
      status: 'registered'
    });
    
    event.currentAttendees += 1;
    await event.save();

    res.json({ 
      success: true, 
      message: 'Successfully registered for the event',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 

// Clear all events (for testing/cleanup)
exports.clearAllEvents = async (req, res) => {
  try {
    console.log('🗑️ Clear All Events Request Received');
    console.log('👤 User:', req.user);
    
    // Check if user has permission (management only)
    if (req.user.role !== 'management') {
      console.log('❌ Permission denied - User role:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Only management can clear all events' 
      });
    }

    // Get count before deletion
    const eventCount = await Event.countDocuments();
    console.log(`📊 Found ${eventCount} events to delete`);

    // Delete all events
    const result = await Event.deleteMany({});
    
    console.log('✅ Events cleared successfully:', {
      deletedCount: result.deletedCount,
      totalEvents: eventCount,
      clearedBy: req.user.name,
      userRole: req.user.role
    });

    res.json({ 
      success: true, 
      message: `Successfully cleared ${result.deletedCount} events`,
      data: {
        deletedCount: result.deletedCount,
        totalEvents: eventCount
      }
    });
  } catch (error) {
    console.error('❌ Error clearing events:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 