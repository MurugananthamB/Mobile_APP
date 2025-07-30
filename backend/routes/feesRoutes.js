// routes/feesRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getFees, getFeeTerm, payFees } = require('../controllers/feesController');

// All routes are protected
router.use(protect);

// GET /api/fees - Get user's fees information
router.get('/', getFees);

// GET /api/fees/:termId - Get specific fee term
router.get('/:termId', getFeeTerm);

// POST /api/fees/pay - Process fee payment
router.post('/pay', payFees);

module.exports = router; 