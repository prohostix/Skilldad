const { query } = require('../config/postgres');
const bcrypt = require('bcryptjs');

// @desc    Get University Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const uniId = req.user.id;
        
        // Corrected column name to university_id
        const studentCount = await query('SELECT COUNT(*) FROM users WHERE university_id = $1', [uniId]);
        const groupCount = await query('SELECT COUNT(*) FROM student_groups WHERE university_id = $1', [uniId]);
        const sessionCount = await query('SELECT COUNT(*) FROM live_sessions WHERE university_id = $1', [uniId]);
        const courseCount = await query('SELECT COUNT(*) FROM courses WHERE instructor_id = $1', [uniId]);

        res.json({
            studentCount: parseInt(studentCount.rows[0].count),
            groupCount: parseInt(groupCount.rows[0].count),
            liveSessions: parseInt(sessionCount.rows[0].count),
            avgScore: 0, // Placeholder
            activeCourses: parseInt(courseCount.rows[0].count),
            completionRate: 0 // Placeholder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses for university
const getUniversityCourses = async (req, res) => {
    try {
        const uniId = req.user.id;
        
        // Fetch university's own courses (where they are the instructor)
        const instructedRes = await query('SELECT * FROM courses WHERE instructor_id = $1', [uniId]);
        let courses = instructedRes.rows;

        // Fetch university profile to check for assigned courses
        const userRes = await query('SELECT profile FROM users WHERE id = $1', [uniId]);
        const user = userRes.rows[0];
        
        if (user && user.profile) {
            const profile = typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile;
            const assignedIds = Array.isArray(profile.assigned_courses) ? profile.assigned_courses : [];
            
            if (assignedIds.length > 0) {
                // Fetch assigned courses that are not already in the list
                const assignedRes = await query('SELECT * FROM courses WHERE id = ANY($1)', [assignedIds]);
                const assignedCourses = assignedRes.rows;
                
                // Merge and remove duplicates by ID
                const existingIds = new Set(courses.map(c => c.id));
                assignedCourses.forEach(c => {
                    if (!existingIds.has(c.id)) {
                        courses.push(c);
                    }
                });
            }
        }

        res.json(courses.map(r => ({ ...r, _id: r.id })));
    } catch (error) {
        console.error('[getUniversityCourses] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a student by a university admin
const registerStudentByUniversity = async (req, res) => {
    try {
        const { name, email, password, phone, courseId } = req.body;
        const universityId = req.user.id;
        const lowerEmail = email.toLowerCase().trim();

        // 1. Check if user exists
        const userExists = await query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 8);
        const newId = `user_${Date.now()}`;

        // 3. Create student user
        const newUser = await query(`
            INSERT INTO users (id, name, email, password, role, university_id, profile, is_verified, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'student', $5, $6, true, NOW(), NOW())
            RETURNING id, name, email
        `, [
            newId, name, lowerEmail, hashedPassword, universityId,
            JSON.stringify({ phone: phone || '' })
        ]);

        const student = newUser.rows[0];

        // 4. Enroll in course if provided
        if (courseId) {
            const enrollId = `enroll_${Date.now()}`;
            await query(`
                INSERT INTO enrollments (id, student_id, course_id, university_id, status, created_at)
                VALUES ($1, $2, $3, $4, 'active', NOW())
            `, [enrollId, student.id, courseId, universityId]);

            // Add progress record
            const progId = `prog_${Date.now()}`;
            await query(`
                INSERT INTO progress (id, user_id, course_id, completed_videos, completed_exercises, project_submissions, is_completed)
                VALUES ($1, $2, $3, '[]', '[]', '[]', false)
            `, [progId, student.id, courseId]);
        }

        res.status(201).json({
            success: true,
            _id: student.id,
            name: student.name,
            email: student.email
        });

        // 5. Send Notifications (Awaited for reliability)
        setImmediate(async () => {
            try {
                const notificationService = require('../services/NotificationService');
                const adminName = req.user.name || 'University Administrator';

                // Send Welcome
                await notificationService.send(
                    { id: student.id, name: student.name, email: student.email, phone }, 
                    'welcome'
                );

                // Send Enrollment if course provided
                if (courseId) {
                    const courseRes = await query('SELECT title FROM courses WHERE id = $1', [courseId]);
                    const courseTitle = courseRes.rows[0]?.title || 'New Course';
                    
                    await notificationService.send(
                        { id: student.id, name: student.name, email: student.email, phone },
                        'enrollment',
                        { courseTitle, enrolledBy: adminName }
                    );
                }
            } catch (err) {
                console.error('[Uni Registration] Notification failed:', err.message);
            }
        });


    } catch (error) {
        console.error('[Uni Registration] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUniversityCourses,
    createGroup: async (req, res) => {
        try {
            const { name, description, courseId } = req.body;
            const universityId = req.user.id;
            const id = `group_${Date.now()}`;
            const result = await query(`
                INSERT INTO student_groups (id, name, description, university_id, course_id, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `, [id, name, description, universityId, courseId]);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getGroups: async (req, res) => {
        try {
            const universityId = req.user.id;
            const result = await query('SELECT * FROM student_groups WHERE university_id = $1 ORDER BY created_at DESC', [universityId]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    addStudentToGroup: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { studentId } = req.body;
            await query('UPDATE users SET group_id = $1 WHERE id = $2', [groupId, studentId]);
            res.json({ success: true, message: 'Student added to group' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createDiscount: async (req, res) => {
        try {
            const { code, type, value, expiryDate } = req.body;
            const universityId = req.user.id;

            const checkResult = await query('SELECT * FROM discounts WHERE code = $1', [code.toUpperCase()]);
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ message: 'Discount code already exists' });
            }

            const id = `disc_${Date.now()}`;
            const result = await query(`
                INSERT INTO discounts (id, code, type, value, expiry_date, partner_id, active) 
                VALUES ($1, $2, $3, $4, $5, $6, true) 
                RETURNING *
            `, [id, code.toUpperCase(), type || 'percentage', value, expiryDate || null, universityId]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getDiscounts: async (req, res) => {
        try {
            const universityId = req.user.id;
            const result = await query('SELECT * FROM discounts WHERE partner_id = $1 ORDER BY created_at DESC', [universityId]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteDiscount: async (req, res) => {
        try {
            const { id } = req.params;
            const universityId = req.user.id;
            await query('DELETE FROM discounts WHERE id = $1 AND partner_id = $2', [id, universityId]);
            res.json({ success: true, message: 'Discount deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    registerStudentByUniversity
};
