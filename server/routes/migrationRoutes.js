const express = require('express');
const router = express.Router();
const { fixAdminEnrollments, fixFaqsTable } = require('../controllers/migrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/fix-enrollments', protect, authorize('admin'), fixAdminEnrollments);
router.post('/fix-faqs-table', protect, authorize('admin'), fixFaqsTable);

module.exports = router;
