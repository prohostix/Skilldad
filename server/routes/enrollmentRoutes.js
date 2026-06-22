const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses, updateProgress, assignBatch } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:courseId', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.put('/progress', protect, updateProgress);
router.put('/assign-batch', protect, assignBatch);

module.exports = router;
