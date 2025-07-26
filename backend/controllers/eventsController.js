// controllers/eventsController.js
const Event = require('../models/events');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    let events = await Event.find({ isRegistrationOpen: true }).sort({ date: 1 });
    
    if (events.length === 0) {
      // Create default events
      const defaultEvents = [
        {
          title: 'Annual Sports Day',
          description: 'Join us for a day filled with exciting sports competitions, team events, and athletic performances.',
          category: 'Sports',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          startTime: '9:00 AM',
          endTime: '4:00 PM',
          venue: 'School Ground',
          maxAttendees: 300,
          currentAttendees: 250,
          registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          organizer: 'Sports Department',
          requirements: ['Sports uniform', 'Water bottle', 'Medical certificate'],
          prizes: ['Trophies for winners', 'Certificates for all participants']
        },
        {
          title: 'Science Exhibition',
          description: 'Showcase your innovative science projects and experiments.',
          category: 'Academic',
          date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          venue: 'Science Laboratory',
          maxAttendees: 150,
          currentAttendees: 120,
          registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          organizer: 'Science Department'
        }
      ];

      await Event.insertMany(defaultEvents);
      events = await Event.find({ isRegistrationOpen: true }).sort({ date: 1 });
    }

    // Add user registration status
    events = events.map(event => {
      const userRegistration = event.registeredUsers.find(reg => reg.userId.toString() === req.user.id);
      return {
        ...event.toObject(),
        isRegistered: !!userRegistration,
        userRegistrationStatus: userRegistration ? userRegistration.status : null
      };
    });

    res.json({ success: true, data: events });
  } catch (error) {
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

    // Check capacity
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
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