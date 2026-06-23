const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    createApplicationConfig,
    getSalesApplications,
    getApplicationDetails,
    uploadUniversityLogo,
    submitStudentDetails,
    confirmPayment
} = require('../controllers/salesController');

// Private Sales/Admin routes
router.route('/applications')
    .post(protect, authorize('sales', 'admin'), createApplicationConfig)
    .get(protect, authorize('sales', 'admin'), getSalesApplications);

router.post('/upload-logo', protect, authorize('sales', 'admin'), upload.single('logo'), uploadUniversityLogo);

// Public Student routes
router.route('/applications/:id')
    .get(getApplicationDetails);

router.route('/applications/:id/submit')
    .post(submitStudentDetails);

router.route('/applications/:id/confirm-payment')
    .post(confirmPayment);

module.exports = router;
