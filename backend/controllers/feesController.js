// controllers/feesController.js
const Fees = require('../models/fees');

// Get user's fees information
exports.getFees = async (req, res) => {
  try {
    const fees = await Fees.findOne({ userId: req.user.id }).populate('userId', 'userid email');
    
    if (!fees) {
      // Create default fees structure if not exists
      const defaultFees = new Fees({
        userId: req.user.id,
        studentClass: '10-A',
        terms: [
          {
            termName: 'First Term 2023-24',
            academicYear: '2023-24',
            dueDate: new Date('2024-01-15'),
            status: 'paid',
            totalAmount: 15000,
            paidAmount: 15000,
            feeItems: [
              { name: 'Tuition Fee', amount: 10000, paid: 10000, dueDate: new Date('2024-01-15') },
              { name: 'Transport Fee', amount: 3000, paid: 3000, dueDate: new Date('2024-01-15') },
              { name: 'Activity Fee', amount: 2000, paid: 2000, dueDate: new Date('2024-01-15') },
            ],
            paymentHistory: [
              { amount: 15000, date: new Date('2024-01-10'), method: 'Online', transactionId: 'TXN001' }
            ]
          },
          {
            termName: 'Second Term 2023-24',
            academicYear: '2023-24',
            dueDate: new Date('2024-02-15'),
            status: 'partial',
            totalAmount: 15000,
            paidAmount: 7500,
            feeItems: [
              { name: 'Tuition Fee', amount: 10000, paid: 5000, dueDate: new Date('2024-02-15') },
              { name: 'Transport Fee', amount: 3000, paid: 2500, dueDate: new Date('2024-02-15') },
              { name: 'Activity Fee', amount: 2000, paid: 0, dueDate: new Date('2024-02-15') },
            ],
            paymentHistory: [
              { amount: 7500, date: new Date('2024-01-25'), method: 'Online', transactionId: 'TXN002' }
            ]
          },
          {
            termName: 'Third Term 2023-24',
            academicYear: '2023-24',
            dueDate: new Date('2024-03-15'),
            status: 'pending',
            totalAmount: 15000,
            paidAmount: 0,
            feeItems: [
              { name: 'Tuition Fee', amount: 10000, paid: 0, dueDate: new Date('2024-03-15') },
              { name: 'Transport Fee', amount: 3000, paid: 0, dueDate: new Date('2024-03-15') },
              { name: 'Activity Fee', amount: 2000, paid: 0, dueDate: new Date('2024-03-15') },
            ]
          }
        ]
      });
      
      await defaultFees.save();
      return res.json({ success: true, data: defaultFees });
    }

    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get specific fee term by ID
exports.getFeeTerm = async (req, res) => {
  try {
    const fees = await Fees.findOne({ userId: req.user.id });
    
    if (!fees) {
      return res.status(404).json({ success: false, message: 'Fees record not found' });
    }

    const term = fees.terms.id(req.params.termId);
    if (!term) {
      return res.status(404).json({ success: false, message: 'Fee term not found' });
    }

    res.json({ success: true, data: term });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Process fee payment
exports.payFees = async (req, res) => {
  try {
    const { termId, amount, paymentMethod, transactionId } = req.body;

    const fees = await Fees.findOne({ userId: req.user.id });
    if (!fees) {
      return res.status(404).json({ success: false, message: 'Fees record not found' });
    }

    const term = fees.terms.id(termId);
    if (!term) {
      return res.status(404).json({ success: false, message: 'Fee term not found' });
    }

    // Update payment
    term.paidAmount += amount;
    term.paymentHistory.push({
      amount,
      method: paymentMethod,
      transactionId,
      date: new Date()
    });

    // Update status
    if (term.paidAmount >= term.totalAmount) {
      term.status = 'paid';
    } else if (term.paidAmount > 0) {
      term.status = 'partial';
    }

    await fees.save();

    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: { term, remainingAmount: term.totalAmount - term.paidAmount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}; 