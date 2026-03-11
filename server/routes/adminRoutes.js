const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    getGlobalStats,
    getAllUsers,
    getUserById,
    inviteUser,
    updateUserRole,
    updateEntity,
    verifyUser,
    getPlatformAnalytics,
    getPartnerDetails,
    getPartnerDiscounts,
    grantPermission,
    revokePermission,
    getAllStudents,
    getStudentDocuments,
    getStudentEnrollments,
    updateStudent,
    deleteStudent,
    deleteUser,
    getPartnerLogos,
    createPartnerLogo,
    updatePartnerLogo,
    deletePartnerLogo,
    getDirectors,
    createDirector,
    updateDirector,
    deleteDirector,
    getUniversities,
    assignCoursesToUniversity,
    getUniversityDetail,
    adminEnrollStudent,
    adminUnenrollStudent,
    uploadUniversityProfileImage,
    uploadUniversityCoverImage,
    updateUniversityProfile
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const checkAdmin = (req, res, next) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const log = `[${new Date().toISOString()}] ADMIN CHECK - User: ${req.user ? req.user.email : 'UNDEFINED'}, Role: ${req.user ? req.user.role : 'N/A'}, URL: ${req.originalUrl}\n`;

        try {
            fs.appendFileSync(path.join(__dirname, '../debug_admin.log'), log);
        } catch (logErr) {
            // Silently ignore if logging fails (e.g. read-only filesystem)
            console.warn('[AdminCheck] Could not write to debug_admin.log:', logErr.message);
        }
    } catch (err) {
        console.error('[AdminCheck] Internal Error:', err);
    }

    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an Admin [checkAdmin]' });
    }
};

router.get('/stats', protect, checkAdmin, getGlobalStats);
router.get('/analytics', protect, checkAdmin, getPlatformAnalytics);
// All users without pagination — used by B2B management
router.get('/users/all', protect, checkAdmin, async (req, res) => {
    try {
        const { query } = require('../config/postgres');
        const result = await query(
            `SELECT id as _id, name, email, role, is_verified as "isVerified",
                    profile_image as "profileImage", created_at as "createdAt"
             FROM users ORDER BY created_at DESC`
        );
        res.json({ users: result.rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});
router.get('/users', protect, checkAdmin, getAllUsers);
router.get('/users/:id', protect, checkAdmin, getUserById);
router.get('/universities', protect, checkAdmin, getUniversities);
router.get('/universities/:id', protect, checkAdmin, getUniversityDetail);
router.put('/universities/:id/courses', protect, checkAdmin, assignCoursesToUniversity);
router.put('/universities/:id/profile', protect, checkAdmin, updateUniversityProfile);
router.post('/universities/:id/upload-image', protect, checkAdmin, upload.single('profileImage'), uploadUniversityProfileImage);
router.post('/universities/:id/upload-cover', protect, checkAdmin, upload.single('coverImage'), uploadUniversityCoverImage);
// Moved up
router.put('/entities/:id', protect, checkAdmin, updateEntity);
router.get('/partners/:id', protect, checkAdmin, getPartnerDetails);
router.get('/partners/:id/discounts', protect, checkAdmin, getPartnerDiscounts);
router.post('/users/invite', protect, checkAdmin, inviteUser);
router.put('/users/:id/role', protect, checkAdmin, updateUserRole);
router.put('/users/:id/verify', protect, checkAdmin, verifyUser);
router.put('/users/:id/grant-permission', protect, checkAdmin, grantPermission);
router.put('/users/:id/revoke-permission', protect, checkAdmin, revokePermission);
router.delete('/users/:id', protect, checkAdmin, deleteUser);

// Student Management Routes
router.get('/students', protect, checkAdmin, getAllStudents);
router.get('/students/:id/documents', protect, checkAdmin, getStudentDocuments);
router.get('/students/:id/enrollments', protect, checkAdmin, getStudentEnrollments);
router.post('/students/:id/enroll', protect, checkAdmin, adminEnrollStudent);
router.delete('/students/:id/enroll/:courseId', protect, checkAdmin, adminUnenrollStudent);
router.put('/students/:id', protect, checkAdmin, updateStudent);
router.delete('/students/:id', protect, checkAdmin, deleteStudent);

// Partner Logo Management Routes
router.get('/partner-logos', protect, checkAdmin, getPartnerLogos);
router.post('/partner-logos', protect, checkAdmin, createPartnerLogo);
router.post('/partner-logos/seed', protect, checkAdmin, async (req, res) => {
    try {
        const { query: dbQuery } = require('../config/postgres');

        const samplePartners = [
            { name: 'TechCorp Solutions', logo: '/assets/logos/techcorp.png', type: 'corporate', order: 1 },
            { name: 'Global Innovations Ltd', logo: '/assets/logos/global-innovations.png', type: 'corporate', order: 2 },
            { name: 'Digital Dynamics Inc', logo: '/assets/logos/digital-dynamics.png', type: 'corporate', order: 3 },
            { name: 'Enterprise Systems Group', logo: '/assets/logos/enterprise-systems.png', type: 'corporate', order: 4 },
            { name: 'CloudTech Partners', logo: '/assets/logos/cloudtech.png', type: 'corporate', order: 5 },
            { name: 'DataFlow Corporation', logo: '/assets/logos/dataflow.png', type: 'corporate', order: 6 },
            { name: 'NextGen Technologies', logo: '/assets/logos/nextgen.png', type: 'corporate', order: 7 },
            { name: 'Smart Solutions International', logo: '/assets/logos/smart-solutions.png', type: 'corporate', order: 8 },
            { name: 'Innovate Labs', logo: '/assets/logos/innovate-labs.png', type: 'corporate', order: 9 }
        ];

        await dbQuery('DELETE FROM partner_logos');

        for (const p of samplePartners) {
            await dbQuery(
                'INSERT INTO partner_logos (name, logo, type, display_order, is_active) VALUES ($1, $2, $3, $4, true)',
                [p.name, p.logo, p.type, p.order]
            );
        }

        res.json({
            success: true,
            message: `Successfully seeded ${samplePartners.length} partner logos`,
            partners: samplePartners.map(p => ({ name: p.name, order: p.order }))
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
router.put('/partner-logos/:id', protect, checkAdmin, updatePartnerLogo);
router.delete('/partner-logos/:id', protect, checkAdmin, deletePartnerLogo);

// Director Management Routes
router.get('/directors', protect, checkAdmin, getDirectors);
router.post('/directors', protect, checkAdmin, createDirector);
router.put('/directors/:id', protect, checkAdmin, updateDirector);
router.delete('/directors/:id', protect, checkAdmin, deleteDirector);

module.exports = router;
