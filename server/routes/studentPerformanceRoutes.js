const express = require('express');
const router = express.Router();
const { recordDailySnapshot, getWeeklyPerformance } = require('../controllers/studentPerformanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/snapshot', protect, recordDailySnapshot);
router.get('/weekly', protect, getWeeklyPerformance);

module.exports = router;
