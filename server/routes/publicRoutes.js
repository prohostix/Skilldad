const express = require('express');
const router = express.Router();
const { query } = require('../config/postgres');
const { getPageContent } = require('../controllers/cmsController');

// @desc    Get active partner logos for landing page
// @route   GET /api/public/partner-logos
// @access  Public
router.get('/partner-logos', async (req, res) => {
    try {
        const logosRes = await query(`SELECT id as _id, name, logo as "imageUrl", type, "order", is_active as "isActive" FROM partner_logos WHERE is_active = true ORDER BY "order" ASC, created_at ASC`);
        res.json(logosRes.rows || []);
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
        const directorsRes = await query(`SELECT id as _id, name, title as role, image as "imageUrl", "order", category, bio, university, linkedin_url as "linkedinUrl", display_target, is_active as "isActive" FROM directors WHERE is_active = true ORDER BY "order" ASC, created_at ASC`);
        res.json(directorsRes.rows || []);
    } catch (error) {
        // Log error for debugging database connection issues
        console.error('Error fetching directors:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get active success stories for landing page
// @route   GET /api/public/success-stories
// @access  Public
router.get('/success-stories', async (req, res) => {
    try {
        const storiesRes = await query(`SELECT id as _id, name, campus, package, role, image as "imageUrl", story, video_url as "videoUrl", "order", is_active as "isActive" FROM student_success_stories WHERE is_active = true ORDER BY "order" ASC, created_at ASC`);
        res.json(storiesRes.rows || []);
    } catch (error) {
        console.error('Error fetching success stories:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all admin-approved universities (for partner student registration)
// @route   GET /api/public/universities
// @access  Public
router.get('/universities', async (req, res) => {
    try {

        // Fetch verified universities and join with student/course counts
        // studentCount: students registered by this university or having this universityId
        // courseCount: courses where this university is the instructor
        const universitiesRes = await query(`
            SELECT 
                u.id, u.name, u.email, u.profile, u.profile_image, u.bio,
                (SELECT COUNT(*) FROM enrollments e WHERE e.student_id IN (
                    SELECT s.id FROM users s WHERE s.university_id = u.id OR s.registered_by = u.id
                )) as "studentCount",
                (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id AND c.is_published = true) as "courseCount",
                COALESCE((SELECT array_agg(DISTINCT c.program_type) FROM courses c WHERE c.instructor_id = u.id AND c.is_published = true AND c.program_type IS NOT NULL AND c.program_type != ''), ARRAY[]::text[]) as "programTypes",
                COALESCE((SELECT array_agg(DISTINCT c.category) FROM courses c WHERE c.instructor_id = u.id AND c.is_published = true AND c.category IS NOT NULL AND c.category != ''), ARRAY[]::text[]) as "courseCategories",
                COALESCE((SELECT array_agg(LOWER(c.title)) FROM courses c WHERE c.instructor_id = u.id AND c.is_published = true AND c.title IS NOT NULL AND c.title != ''), ARRAY[]::text[]) as "courseTitles"
            FROM users u
            WHERE LOWER(u.role) = 'university' AND u.is_verified = true
            ORDER BY u.name ASC
        `);

        // Map results to match expected frontend structure (aliasing id as _id)
        const enrichedUnis = universitiesRes.rows.map(uni => ({
            ...uni,
            _id: uni.id,
            profile: typeof uni.profile === 'string' ? JSON.parse(uni.profile) : uni.profile,
            profileImage: uni.profile_image,
            programTypes: uni.programTypes || [],
            courseCategories: uni.courseCategories || [],
            courseTitles: uni.courseTitles || []
        }));

        res.json(enrichedUnis || []);
    } catch (error) {
        console.error('Error fetching universities (PG):', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get active SkillDad-owned universities (no login account, display-only)
// @route   GET /api/public/skilldad-universities
// @access  Public
router.get('/skilldad-universities', async (req, res) => {
    try {
        // scholarCount counts real distinct students enrolled in any of this university's
        // assigned_courses - these universities have no login accounts of their own, so
        // enrollments can only be attributed to them indirectly, through their courses.
        const result = await query(`
            SELECT su.id, su.name, su.location, su.website, su.phone, su.email, su.description,
                   su.profile_image, su.cover_image, su.gallery, su.youtube_url, su.achievements,
                   su.assigned_courses, su.certificates, su.videos,
                   su.total_scholars, su.specialized_courses,
                   (
                       SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
                       WHERE e.course_id IN (SELECT jsonb_array_elements_text(su.assigned_courses))
                   ) as "scholarCount"
            FROM skill_dad_universities su
            WHERE su.is_active = true
            ORDER BY su.created_at ASC
        `);

        // Enrich with real course program_types and categories from assigned_courses
        const enrichedRows = await Promise.all(result.rows.map(async (su) => {
            let assigned = [];
            try {
                const raw = su.assigned_courses;
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    assigned = Array.isArray(parsed) ? parsed : [];
                }
            } catch (e) {
                assigned = [];
            }

            let programTypes = [];
            let courseCategories = [];
            let courseTitles = [];
            if (assigned.length > 0) {
                try {
                    const courseRes = await query(
                        `SELECT program_type, category, LOWER(title) as title FROM courses WHERE id = ANY($1::text[]) AND is_published = true`,
                        [assigned]
                    );
                    programTypes = [...new Set(courseRes.rows.map(c => c.program_type).filter(Boolean))];
                    courseCategories = [...new Set(courseRes.rows.map(c => c.category).filter(Boolean))];
                    courseTitles = [...new Set(courseRes.rows.map(c => c.title).filter(Boolean))];
                } catch (e) {
                    // ignore
                }
            }

            // Also check by university_name match (catches uni courses not in assigned_courses)
            try {
                const nameMatchRes = await query(
                    `SELECT program_type, category, LOWER(title) as title FROM courses WHERE LOWER(university_name) = LOWER($1) AND is_published = true`,
                    [su.name]
                );
                nameMatchRes.rows.forEach(c => {
                    if (c.program_type) programTypes.push(c.program_type);
                    if (c.category) courseCategories.push(c.category);
                    if (c.title) courseTitles.push(c.title);
                });
                programTypes = [...new Set(programTypes)];
                courseCategories = [...new Set(courseCategories)];
                courseTitles = [...new Set(courseTitles)];
            } catch (e) {
                // ignore
            }

            return { ...su, programTypes, courseCategories, courseTitles };
        }));

        res.json(enrichedRows || []);
    } catch (error) {
        console.error('Error fetching SkillDad universities:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get courses for a specific university by name
// @route   GET /api/public/universities/:name/courses
// @access  Public
router.get('/universities/:name/courses', async (req, res) => {
    try {
        const uniName = decodeURIComponent(req.params.name);
        
        // 1. Find the university by name (case-insensitive)
        const uniRes = await query('SELECT id, profile FROM users WHERE role = $1 AND name ILIKE $2 AND is_verified = $3', ['university', uniName, true]);
        
        let assignedCourseIds = [];
        let instructorId = null;

        if (uniRes.rows.length === 0) {
            // Check skill_dad_universities if not found in users (case-insensitive)
            const sdUniRes = await query('SELECT id, assigned_courses FROM skill_dad_universities WHERE name ILIKE $1 AND is_active = $2', [uniName, true]);
            if (sdUniRes.rows.length === 0) {
                return res.status(404).json({ message: 'University not found' });
            }
            // Parse assigned_courses for skilldad university
            const sdAssigned = sdUniRes.rows[0].assigned_courses;
            assignedCourseIds = typeof sdAssigned === 'string' ? JSON.parse(sdAssigned) : (sdAssigned || []);
        } else {
            const uni = uniRes.rows[0];
            instructorId = uni.id;
            const profile = typeof uni.profile === 'string' ? JSON.parse(uni.profile) : (uni.profile || {});
            assignedCourseIds = profile.assigned_courses || [];
        }
        
        // 2. Fetch courses where instructor is the university OR course ID is in assigned_courses
        let coursesQuery = `
            SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.is_published = true
        `;
        const queryParams = [];
        
        if (instructorId && assignedCourseIds.length > 0) {
            coursesQuery += ` AND (c.instructor_id = $1 OR c.id::text = ANY($2::text[]))`;
            queryParams.push(instructorId, assignedCourseIds);
        } else if (instructorId) {
            coursesQuery += ` AND c.instructor_id = $1`;
            queryParams.push(instructorId);
        } else if (assignedCourseIds.length > 0) {
            coursesQuery += ` AND c.id::text = ANY($1::text[])`;
            queryParams.push(assignedCourseIds);
        } else {
            // No instructor ID and no assigned courses => return empty array
            return res.json([]);
        }
        
        const coursesRes = await query(coursesQuery, queryParams);
        
        const enrichedCourses = coursesRes.rows.map(course => ({
            ...course,
            _id: course.id,
            instructor: {
                name: course.instructor_name || uniName,
                profile: course.instructor_profile ? (typeof course.instructor_profile === 'string' ? JSON.parse(course.instructor_profile) : course.instructor_profile) : {},
                role: 'university'
            }
        }));
        
        res.json(enrichedCourses);
    } catch (error) {
        console.error('Error fetching university courses:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get full university profile by name
// @route   GET /api/public/universities/profile/:name
// @access  Public
router.get('/universities/profile/:name', async (req, res) => {
    try {
        const uniName = decodeURIComponent(req.params.name);
        
        const uniRes = await query(`
            SELECT id, name, email, profile, profile_image as "profileImage", bio
            FROM users 
            WHERE role = 'university' AND name ILIKE $1 AND is_verified = true
        `, [uniName]);
        
        if (uniRes.rows.length === 0) {
            // Check skill_dad_universities if not found in users
            const sdUniRes = await query(`
                SELECT id, name, email, phone, location as bio, description as "profile", profile_image as "profileImage", cover_image as "coverImage", website, gallery, youtube_url, achievements, assigned_courses, certificates, videos
                FROM skill_dad_universities
                WHERE name ILIKE $1 AND is_active = true
            `, [uniName]);

            if (sdUniRes.rows.length === 0) {
                return res.status(404).json({ message: 'University not found' });
            }

            const uni = sdUniRes.rows[0];
            const rawVideos = uni.videos ? (typeof uni.videos === 'string' ? JSON.parse(uni.videos) : uni.videos) : [];
            const parsedVideos = (Array.isArray(rawVideos) && rawVideos.length > 0) ? rawVideos : (uni.youtube_url ? [uni.youtube_url] : []);
            const profile = { 
                description: uni.profile, 
                location: uni.bio, 
                email: uni.email, 
                phone: uni.phone,
                coverImage: uni.coverImage,
                website: uni.website,
                gallery: uni.gallery || [],
                youtubeUrl: uni.youtube_url || '',
                videos: parsedVideos,
                achievements: typeof uni.achievements === 'string' ? JSON.parse(uni.achievements) : (uni.achievements || []),
                certificates: typeof uni.certificates === 'string' ? JSON.parse(uni.certificates) : (uni.certificates || [])
            };
            
            return res.json({
                ...uni,
                profile,
                _id: `sd-${uni.id}`
            });
        }
        
        const uni = uniRes.rows[0];
        const profile = typeof uni.profile === 'string' ? JSON.parse(uni.profile) : (uni.profile || {});
        
        res.json({
            ...uni,
            profile,
            _id: uni.id
        });
    } catch (error) {
        console.error('Error fetching university profile:', error.message);
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

// @desc    Get CMS content by page
// @route   GET /api/public/cms/:page
// @access  Public
router.get('/cms/:page', getPageContent);

module.exports = router;


