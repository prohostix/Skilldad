const express = require('express');
const router = express.Router();
const PartnerLogo = require('../models/partnerLogoModel');
const Director = require('../models/directorModel');
const User = require('../models/userModel');

// @desc    Get active partner logos for landing page
// @route   GET /api/public/partner-logos
// @access  Public
router.get('/partner-logos', async (req, res) => {
    try {
        const logos = await PartnerLogo.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        // Handle null/undefined results by returning empty array
        res.json(logos || []);
    } catch (error) {
        // Log error for debugging database connection issues
        console.error('Error fetching partner logos:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get active directors for landing page
// @route   GET /api/public/directors
// @access  Public
router.get('/directors', async (req, res) => {
    try {
        const directors = await Director.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        // Handle null/undefined results by returning empty array
        res.json(directors || []);
    } catch (error) {
        // Log error for debugging database connection issues
        console.error('Error fetching directors:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all admin-approved universities (for partner student registration)
// @route   GET /api/public/universities
// @access  Public
router.get('/universities', async (req, res) => {
    try {
        const { query } = require('../config/postgres');

        // Fetch verified universities and join with student/course counts
        // studentCount: students registered by this university or having this universityId
        // courseCount: courses where this university is the instructor
        const universitiesRes = await query(`
            SELECT 
                u.id, u.name, u.email, u.profile, u.profile_image, u.bio,
                (SELECT COUNT(*) FROM enrollments e WHERE e.student_id IN (
                    SELECT s.id FROM users s WHERE s.university_id = u.id OR s.registered_by = u.id
                )) as "studentCount",
                (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) as "courseCount"
            FROM users u
            WHERE u.role = 'university' AND u.is_verified = true
            ORDER BY u.name ASC
        `);

        // Map results to match expected frontend structure (aliasing id as _id)
        const enrichedUnis = universitiesRes.rows.map(uni => ({
            ...uni,
            _id: uni.id,
            profile: typeof uni.profile === 'string' ? JSON.parse(uni.profile) : uni.profile,
            profileImage: uni.profile_image
        }));

        res.json(enrichedUnis || []);
    } catch (error) {
        console.error('Error fetching universities (PG):', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send demo notifications
// @route   POST /api/public/demo-notification
// @access  Public
router.post('/demo-notification', require('../controllers/demoController').sendDemoNotification);

// @desc    Get recent notification logs
// @route   GET /api/public/notification-logs
// @access  Public
router.get('/notification-logs', require('../controllers/demoController').getNotificationLogs);

module.exports = router;


