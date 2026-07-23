const express = require('express');
const router = express.Router();
const {
    applyForCertificate,
    getMyCertificates,
    getUniversityRequests,
    updateCertificateStatus,
    uploadCertificateFile,
    getAllCertificates
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student routes
router.post('/apply', protect, authorize('student'), applyForCertificate);
router.get('/my', protect, authorize('student'), getMyCertificates);

// University & Partner routes
router.get('/university/requests', protect, authorize('university', 'partner'), getUniversityRequests);
router.put('/:id/status', protect, authorize('university', 'admin', 'partner'), updateCertificateStatus);
router.post('/:id/upload', protect, authorize('university', 'admin', 'partner'), upload.single('certificate'), uploadCertificateFile);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'partner'), getAllCertificates);

module.exports = router;
