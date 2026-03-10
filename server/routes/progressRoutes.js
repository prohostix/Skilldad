const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const ProgressTrackerService = require('../services/ProgressTrackerService');
const { query } = require('../config/postgres');

/**
 * @desc    Get user progress for a course
 * @route   GET /api/progress/:userId/:courseId
 * @access  Private (Student - own progress, University - their course progress)
 * 
 * Requirements: 9.5, 9.6, 9.7
 */
router.get('/:userId/:courseId', protect, asyncHandler(async (req, res) => {
    const { userId, courseId } = req.params;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Authorization: Students can only view their own progress
    if (userRole === 'student' && userId !== requestingUserId) {
        res.status(403);
        throw new Error('Not authorized to view this progress');
    }

    // Get progress summary
    const progress = await ProgressTrackerService.getProgress(userId, courseId);

    // Get submission history for detailed view
    const submissionsRes = await query(`
        SELECT s.*, ic.title as content_title, ic.type as content_type
        FROM submissions s
        LEFT JOIN interactive_contents ic ON s.content_id = ic.id
        WHERE s.user_id = $1 AND s.course_id = $2
        ORDER BY s.submitted_at DESC
    `, [userId, courseId]);

    const submissions = submissionsRes.rows.map(sub => ({
        ...sub,
        content: { title: sub.content_title, type: sub.content_type }
    }));

    res.status(200).json({
        success: true,
        progress,
        submissions
    });
}));

module.exports = router;
