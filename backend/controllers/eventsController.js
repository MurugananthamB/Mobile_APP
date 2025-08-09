// controllers/eventsController.js
const Event = require('../models/events');
const NotificationService = require('../services/notificationService');
const User = require('../models/user'); // Added missing import for User

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Check if user has permission to create events
    if (req.user.role !== 'management' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Permission denied. Only management and staff can create events.' });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      validityDate,
      organizer,
      documents,
      images
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !startTime || !endTime || !venue || !validityDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Validate dates
    const eventDate = new Date(date);
    const validity = new Date(validityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid event date' });
    }

    if (isNaN(validity.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid validity date' });
    }

    if (eventDate < today) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
    }

    if (validity < today) {
      return res.status(400).json({ success: false, message: 'Validity date cannot be in the past' });
    }

    if (validity > eventDate) {
      return res.status(400).json({ success: false, message: 'Validity date cannot be after event date' });
    }

    // Create event
    const event = new Event({
      title,
      description,
      date: eventDate,
      startTime,
      endTime,
      venue,
      validityDate: validity,
      organizer: organizer || req.user.name,
      documents: documents || [],
      images: images || [],
      createdBy: req.user._id
    });

    await event.save();

    // Send notifications to all users
    try {
      const users = await User.find({});
      for (const user of users) {
        await NotificationService.createNotification({
          userId: user._id,
          title: 'New Event',
          message: `New event: ${title} on ${eventDate.toLocaleDateString()}`,
          type: 'event',
          relatedId: event._id,
          relatedModel: 'Event'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
    }

    res.status(201).json({ success: true, message: 'Event created successfully', data: event });
  } catch (error) {
    console.error('Error in createEvent:', error);
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

 