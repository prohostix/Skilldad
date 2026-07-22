const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiries, updateEnquiryStatus } = require('../controllers/enquiryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(createEnquiry)
    .get(protect, admin, getEnquiries);

router.put('/:id', protect, admin, updateEnquiryStatus);

module.exports = router;
