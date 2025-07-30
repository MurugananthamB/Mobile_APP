// controllers/noticesController.js
const Notice = require('../models/notices');

// Get all notices
exports.getNotices = async (req, res) => {
  try {
    let notices = await Notice.find({ isActive: true }).sort({ publishDate: -1 });
    
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

// Create new notice
exports.createNotice = async (req, res) => {
  try {
    const { title, content, targetAudience, class: classValue, section, attachments } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const noticeData = {
      title,
      content,
      targetAudience: targetAudience || 'all',
      class: classValue || '',
      section: section || '',
      publishedBy: req.user.name || req.user.email,
      department: req.user.department || 'Administration',
      publishDate: new Date(),
      attachments: attachments || [],
      isActive: true
    };

    const newNotice = new Notice(noticeData);
    await newNotice.save();

    res.status(201).json({ 
      success: true, 
      message: 'Notice created successfully',
      data: newNotice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
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