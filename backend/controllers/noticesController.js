// controllers/noticesController.js
const Notice = require('../models/notices');

// Get all notices
exports.getNotices = async (req, res) => {
  try {
    let notices = await Notice.find({ isActive: true }).sort({ publishDate: -1 });
    
    if (notices.length === 0) {
      // Create default notices
      const defaultNotices = [
        {
          title: 'New circular about sports day',
          content: 'All students are required to participate in the upcoming annual sports day. Please ensure you have your sports kit ready and submit the permission slip by Friday.',
          type: 'sports',
          priority: 'high',
          publishedBy: 'Principal',
          department: 'Administration',
          publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        {
          title: 'Mathematics assignment submission reminder',
          content: 'Students who have not submitted their Math assignment from Chapter 5 are reminded to submit it by tomorrow. Late submissions will result in grade deduction.',
          type: 'academic',
          priority: 'medium',
          publishedBy: 'Mr. Smith',
          department: 'Mathematics',
          publishDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          title: 'Fee payment reminder',
          content: 'This is a reminder that the second term fees are due by February 15th. Please ensure timely payment to avoid late fees.',
          type: 'general',
          priority: 'urgent',
          publishedBy: 'Accounts Department',
          department: 'Finance',
          publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          title: 'Science Exhibition Announcement',
          content: 'The annual science exhibition will be held next month. Students interested in participating should register with their science teachers by this Friday.',
          type: 'event',
          priority: 'medium',
          publishedBy: 'Dr. Wilson',
          department: 'Science',
          publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        }
      ];

      await Notice.insertMany(defaultNotices);
      notices = await Notice.find({ isActive: true }).sort({ publishDate: -1 });
    }

    // Add read status for each notice
    notices = notices.map(notice => {
      const userRead = notice.readBy.find(read => read.userId.toString() === req.user.id);
      return {
        ...notice.toObject(),
        isRead: !!userRead,
        readAt: userRead ? userRead.readAt : null
      };
    });

    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get notice by ID
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Increment view count
    notice.totalViews += 1;
    await notice.save();

    const userRead = notice.readBy.find(read => read.userId.toString() === req.user.id);
    
    res.json({ 
      success: true, 
      data: {
        ...notice.toObject(),
        isRead: !!userRead,
        readAt: userRead ? userRead.readAt : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark notice as read
exports.markNoticeAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Check if already marked as read
    const existingRead = notice.readBy.find(read => read.userId.toString() === req.user.id);
    
    if (!existingRead) {
      notice.readBy.push({
        userId: req.user.id,
        readAt: new Date()
      });
      
      await notice.save();
    }

    res.json({ 
      success: true, 
      message: 'Notice marked as read',
      data: notice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 