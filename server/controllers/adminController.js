const { query } = require('../config/postgres');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const socketService = require('../services/SocketService');
const bcrypt = require('bcryptjs');


// @desc    Update entity (partner/university) details + discount rate
// @route   PUT /api/admin/entities/:id
// @access  Private (Admin)
const updateEntity = async (req, res) => {
    try {
        console.log('[updateEntity] body:', req.body, 'id:', req.params.id);
        const { name, email, role, discountRate, bio } = req.body;

        const userRes = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        let updatedName = user.name;
        let updatedProfile = user.profile || {};
        let updatedBio = bio !== undefined ? bio : user.bio;

        if (name && name.trim()) {
            updatedName = name.trim();
            // Sync with profile based on role
            if (user.role === 'partner') {
                updatedProfile.partnerName = updatedName;
            } else if (user.role === 'university') {
                updatedProfile.universityName = updatedName;
            }
        }

        const updatedEmail = email ? email.trim() : user.email;
        let updatedRole = user.role;
        if (role) {
            const validRoles = ['student', 'university', 'partner', 'admin', 'finance'];
            const lowerRole = role.toLowerCase();
            if (!validRoles.includes(lowerRole)) {
                return res.status(400).json({ message: `Invalid role: ${role}` });
            }
            updatedRole = lowerRole;
        }

        const updatedDiscountRate = discountRate !== undefined && discountRate !== null ? Number(discountRate) : user.discount_rate;

        const result = await query(`
            UPDATE users 
            SET name = $1, email = $2, role = $3, discount_rate = $4, profile = $5, bio = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING id, name, email, role, discount_rate, bio, is_verified
        `, [updatedName, updatedEmail, updatedRole, updatedDiscountRate, JSON.stringify(updatedProfile), updatedBio, req.params.id]);

        const saved = result.rows[0];
        console.log('[updateEntity] saved:', saved.id, saved.discount_rate);

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...saved, _id: saved.id });

        if (saved.role === 'partner' && discountRate !== undefined && discountRate !== null) {
            const newCode = (saved.name.replace(/\s+/g, '').substring(0, 6) + saved.discount_rate).toUpperCase();

            // Look for existing discount code for this partner
            let discountRes = await query('SELECT id FROM discounts WHERE partner_id = $1', [saved.id]);
            if (discountRes.rows.length > 0) {
                await query('UPDATE discounts SET value = $1, code = $2, updated_at = NOW() WHERE partner_id = $3', [saved.discount_rate, newCode, saved.id]);
            } else {
                const newDiscountId = `disc_${Date.now()}`;
                await query(`
                    INSERT INTO discounts (id, code, value, type, partner_id, active, uses, max_uses)
                    VALUES ($1, $2, $3, 'percentage', $4, true, 0, 9999)
                `, [newDiscountId, newCode, saved.discount_rate, saved.id]);
            }
        }

        return res.json({
            _id: saved.id,
            name: saved.name,
            email: saved.email,
            role: saved.role,
            discountRate: saved.discount_rate,
            isVerified: saved.is_verified,
            message: 'Entity updated successfully'
        });
    } catch (error) {
        console.error('[updateEntity] error:', error);
        if (error.code === '23505') { // Postgres unique violation
            return res.status(400).json({ message: 'Email already in use by another account' });
        }
        return res.status(500).json({ message: error.message || 'Server error updating entity' });
    }
};

// @desc    Get Global Stats (Admin)
const getGlobalStats = async (req, res) => {
    try {
        const [userCount, courseCount, studentCount, partnerCount, ticketCount] = await Promise.all([
            query('SELECT COUNT(*) FROM users'),
            query('SELECT COUNT(*) FROM courses'),
            query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
            query("SELECT COUNT(*) FROM users WHERE role = 'partner'"),
            query("SELECT COUNT(*) FROM audit_logs WHERE action = 'error'") // Placeholder for support tickets
        ]);

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalCourses: parseInt(courseCount.rows[0].count),
            totalStudents: parseInt(studentCount.rows[0].count),
            totalPartners: parseInt(partnerCount.rows[0].count),
            totalTickets: parseInt(ticketCount.rows[0].count),
            totalRevenue: 12500
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with pagination
const getAllUsers = async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;
    const offset = pageSize * (page - 1);

    try {
        const countRes = await query('SELECT COUNT(*) FROM users');
        const count = parseInt(countRes.rows[0].count);

        const usersRes = await query('SELECT id as _id, name, email, role, profile, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [pageSize, offset]);

        res.json({ users: usersRes.rows, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role & details
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
    try {
        const { role, name, email, discountRate } = req.body;

        const userRes = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newRole = (role || user.role).toLowerCase();
        const validRoles = ['student', 'university', 'partner', 'admin', 'finance'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        let updatedName = name || user.name;
        let updatedProfile = user.profile || {};
        if (name) {
            if (newRole === 'partner') {
                updatedProfile.partnerName = name;
            } else if (newRole === 'university') {
                updatedProfile.universityName = name;
            }
        }

        const updatedEmail = email || user.email;
        const updatedDiscountRate = discountRate !== undefined ? Number(discountRate) : user.discount_rate;

        const result = await query(`
            UPDATE users 
            SET role = $1, name = $2, email = $3, discount_rate = $4, profile = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING id, name, email, role, discount_rate
        `, [newRole, updatedName, updatedEmail, updatedDiscountRate, JSON.stringify(updatedProfile), req.params.id]);

        const updatedUser = result.rows[0];

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...updatedUser, _id: updatedUser.id });

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            discountRate: updatedUser.discount_rate,
            message: 'Partner details updated successfully'
        });
    } catch (error) {
        console.error('Update partner error:', error);
        res.status(500).json({
            message: error.code === '23505' ? 'Email already in use' : (error.message || 'Failed to update partner')
        });
    }
};



// @desc    Toggle user verification
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res) => {
    try {
        const userRes = await query('SELECT is_verified FROM users WHERE id = $1', [req.params.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newStatus = !userRes.rows[0].is_verified;
        const result = await query('UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_verified', [newStatus, req.params.id]);
        const updatedUser = result.rows[0];

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...updatedUser, _id: updatedUser.id });

        res.json({
            _id: updatedUser.id,
            isVerified: updatedUser.is_verified,
            message: 'Verification status updated successfully'
        });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ message: error.message || 'Failed to update verification status' });
    }
};

// @desc    Get B2B & Platform Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getPlatformAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let queryStr = 'SELECT role as _id, COUNT(*) as count FROM users';
        const params = [];

        if (startDate && endDate) {
            queryStr += ' WHERE created_at >= $1 AND created_at <= $2';
            params.push(new Date(startDate), new Date(endDate));
        }

        queryStr += ' GROUP BY role';

        const statsRes = await query(queryStr, params);
        const userStats = statsRes.rows;

        // Mock logic for sources and revenue - scaling based on duration if dates provided
        let scaleFactor = 1;
        if (startDate && endDate) {
            const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            scaleFactor = Math.max(0.1, Math.min(diffDays / 30, 2)); // Scale relative to a month
        }

        const enrollmentSources = [
            { source: 'Direct', count: Math.round(450 * scaleFactor) },
            { source: 'University', count: Math.round(320 * scaleFactor) },
            { source: 'Partner', count: Math.round(180 * scaleFactor) }
        ];

        res.json({
            userStats,
            enrollmentSources,
            revenueImpact: {
                direct: Math.round(12000 * scaleFactor),
                partner: Math.round(8500 * scaleFactor),
                university: Math.round(15400 * scaleFactor)
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Partner Profile & Discount info
// @route   GET /api/admin/partners/:id
// @desc    Get partner details with stats
// @route   GET /api/admin/partners/:id
// @access  Private (Admin)
const getPartnerDetails = async (req, res) => {
    try {
        const userRes = await query('SELECT id as _id, name, email, role, profile, discount_rate FROM users WHERE id = $1', [req.params.id]);
        const partner = userRes.rows[0];
        if (partner) {
            const discountsRes = await query('SELECT code FROM discounts WHERE partner_id = $1', [partner._id]);
            const codes = discountsRes.rows.map(d => d.code);

            let studentsCount = 0;
            if (codes.length > 0) {
                const studentsCountRes = await query('SELECT COUNT(*) FROM users WHERE partner_code = ANY($1) AND role = \'student\'', [codes]);
                studentsCount = parseInt(studentsCountRes.rows[0].count);
            }

            const payoutsRes = await query('SELECT amount, status FROM payouts WHERE partner_id = $1', [partner._id]);
            const payouts = payoutsRes.rows;
            const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            const approvedPayouts = payouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

            res.json({
                ...partner,
                stats: {
                    totalCodes: codes.length,
                    studentsCount,
                    pendingPayouts,
                    totalEarnings: approvedPayouts
                }
            });
        } else {
            res.status(404).json({ message: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const userRes = await query('SELECT id as _id, name, email, role, profile, discount_rate, is_verified, created_at FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get partner's discount codes
// @route   GET /api/admin/partners/:id/discounts
// @access  Private (Admin)
const getPartnerDiscounts = async (req, res) => {
    try {
        const discountsRes = await query('SELECT * FROM discounts WHERE partner_id = $1', [req.params.id]);
        res.json(discountsRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grant permission (verify + change role)
// @route   PUT /api/admin/users/:id/grant-permission
// @access  Private (Admin)
const grantPermission = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        const validRoles = ['student', 'university', 'partner', 'admin', 'finance'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const userRes = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const result = await query(`
            UPDATE users 
            SET is_verified = true, role = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, email, role, is_verified
        `, [role, req.params.id]);

        const updatedUser = result.rows[0];

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.is_verified,
            message: `Successfully granted ${role} permission`
        });
    } catch (error) {
        console.error('Grant permission error:', error);
        res.status(500).json({ message: error.message || 'Failed to grant permission' });
    }
};

// @desc    Revoke permission (unverify + set to student)
// @route   PUT /api/admin/users/:id/revoke-permission
// @access  Private (Admin)
const revokePermission = async (req, res) => {
    try {
        const userRes = await query('SELECT id FROM users WHERE id = $1', [req.params.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const result = await query(`
            UPDATE users 
            SET is_verified = false, role = 'student', updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email, role, is_verified
        `, [req.params.id]);

        const updatedUser = result.rows[0];

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.is_verified,
            message: 'Permission revoked successfully'
        });
    } catch (error) {
        console.error('Revoke permission error:', error);
        res.status(500).json({ message: error.message || 'Failed to revoke permission' });
    }
};


// @desc    Get all students with enrollment count
// @route   GET /api/admin/students
// @access  Private (Admin)
const getAllStudents = async (req, res) => {
    try {
        const { courseId, universityId } = req.query;

        let studentsQuery = `
            SELECT 
                u.id as _id, u.name, u.email, u.role, u.profile, 
                u.university_id as "universityId", u.registered_by as "registeredBy", 
                u.is_verified as "isVerified", u.created_at as "createdAt",
                COUNT(e.id) as "enrollmentCount",
                MAX(c.title) as "course"
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN courses c ON e.course_id = c.id
            WHERE u.role = 'student'
        `;
        const params = [];

        if (courseId && courseId !== 'all') {
            studentsQuery += ` AND EXISTS (SELECT 1 FROM enrollments e2 WHERE e2.student_id = u.id AND e2.course_id = $${params.length + 1})`;
            params.push(courseId);
        }

        if (universityId && universityId !== 'all') {
            studentsQuery += ` AND u.university_id = $${params.length + 1}`;
            params.push(universityId);
        }

        studentsQuery += ' GROUP BY u.id ORDER BY u.created_at DESC';

        const studentsRes = await query(studentsQuery, params);
        res.json(studentsRes.rows.map(s => ({
            ...s,
            enrollmentCount: parseInt(s.enrollmentCount),
            course: s.course || 'No Enrollment'
        })));
    } catch (error) {
        console.error('Error in getAllStudents (PG):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student documents
// @route   GET /api/admin/students/:id/documents
// @access  Private (Admin)
const getStudentDocuments = async (req, res) => {
    try {
        const docsRes = await query('SELECT * FROM documents WHERE student_id = $1', [req.params.id]);
        res.json(docsRes.rows.map(d => ({ ...d, _id: d.id })));
    } catch (error) {
        console.error('Error in getStudentDocuments (PG):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student enrollments
// @route   GET /api/admin/students/:id/enrollments
// @access  Private (Admin)
const getStudentEnrollments = async (req, res) => {
    try {
        const enrollmentsRes = await query(`
            SELECT e.*, c.title as course_title, c.thumbnail as course_thumbnail, c.category as course_category,
                   u.name as instructor_name, u.profile as instructor_profile
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE e.student_id = $1
        `, [req.params.id]);

        res.json(enrollmentsRes.rows.map(e => ({
            ...e,
            _id: e.id,
            course: {
                title: e.course_title,
                thumbnail: e.course_thumbnail,
                category: e.course_category,
                instructor: {
                    name: e.instructor_name,
                    profile: e.instructor_profile
                }
            }
        })));
    } catch (error) {
        console.error('Error in getStudentEnrollments (PG):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/admin/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
    try {
        const studentRes = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const student = studentRes.rows[0];

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        const updatedName = req.body.name || student.name;
        const updatedEmail = req.body.email || student.email;
        const updatedBio = req.body.bio || student.bio;
        const updatedIsVerified = req.body.isVerified !== undefined ? req.body.isVerified : student.is_verified;

        const result = await query(`
            UPDATE users 
            SET name = $1, email = $2, bio = $3, is_verified = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING id, name, email, bio, role, is_verified
        `, [updatedName, updatedEmail, updatedBio, updatedIsVerified, req.params.id]);

        const updatedStudent = result.rows[0];

        res.json({
            _id: updatedStudent.id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            bio: updatedStudent.bio,
            role: updatedStudent.role,
            isVerified: updatedStudent.is_verified
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    try {
        const studentRes = await query('SELECT role FROM users WHERE id = $1', [req.params.id]);
        const student = studentRes.rows[0];

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        await query('DELETE FROM users WHERE id = $1', [req.params.id]);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete any user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const userRes = await query('SELECT id, name, email FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user.id.toString() === req.user.id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await query('DELETE FROM users WHERE id = $1', [req.params.id]);

        // Notify via WebSocket
        socketService.notifyUserListUpdate('deleted', { ...user, _id: user.id });

        res.json({ message: 'User deleted successfully', user: { _id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Partner Logo Management

// @desc    Get all partner logos
// @route   GET /api/admin/partner-logos
// @access  Private (Admin)
async function getPartnerLogos(req, res) {
    try {
        const logosRes = await query('SELECT * FROM partner_logos ORDER BY "order" ASC, created_at ASC');
        res.json(logosRes.rows.map(l => ({ ...l, _id: l.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create partner logo
// @route   POST /api/admin/partner-logos
// @access  Private (Admin)
async function createPartnerLogo(req, res) {
    try {
        const { name, order, type, logo: logoUrl, location, students, programs } = req.body;
        const newId = `pl_${Date.now()}`;
        const result = await query(`
            INSERT INTO partner_logos (id, name, logo, type, location, students, programs, "order", is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `, [newId, name, logoUrl, type || 'corporate', location, students || 0, programs || 0, order || 0]);

        res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update partner logo
// @route   PUT /api/admin/partner-logos/:id
// @access  Private (Admin)
async function updatePartnerLogo(req, res) {
    try {
        const { name, order, isActive, type, logo: logoUrl, location, students, programs } = req.body;
        const result = await query(`
            UPDATE partner_logos 
            SET name = COALESCE($1, name), logo = COALESCE($2, logo), type = COALESCE($3, type), 
                location = COALESCE($4, location), students = COALESCE($5, students), programs = COALESCE($6, programs), 
                "order" = COALESCE($7, "order"), is_active = COALESCE($8, is_active), updated_at = NOW()
            WHERE id = $9 RETURNING *
        `, [name, logoUrl, type, location, students, programs, order, isActive, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Partner logo not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete partner logo
// @route   DELETE /api/admin/partner-logos/:id
// @access  Private (Admin)
async function deletePartnerLogo(req, res) {
    try {
        const result = await query('DELETE FROM partner_logos WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Partner logo not found' });
        }
        res.json({ message: 'Partner logo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Director Management

// @desc    Get all directors
// @route   GET /api/admin/directors
// @access  Private (Admin)
async function getDirectors(req, res) {
    try {
        const directorsRes = await query('SELECT * FROM directors ORDER BY "order" ASC, created_at ASC');
        res.json(directorsRes.rows.map(d => ({ ...d, _id: d.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create director
// @route   POST /api/admin/directors
// @access  Private (Admin)
async function createDirector(req, res) {
    try {
        const { name, title, image, order } = req.body;
        const newId = `dir_${Date.now()}`;
        const result = await query(`
            INSERT INTO directors (id, name, title, image, "order", is_active)
            VALUES ($1, $2, $3, $4, $5, true) RETURNING *
        `, [newId, name, title, image, order || 0]);

        res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update director
// @route   PUT /api/admin/directors/:id
// @access  Private (Admin)
async function updateDirector(req, res) {
    try {
        const { name, title, image, order, isActive } = req.body;
        const result = await query(`
            UPDATE directors 
            SET name = COALESCE($1, name), title = COALESCE($2, title), image = COALESCE($3, image), 
                "order" = COALESCE($4, "order"), is_active = COALESCE($5, is_active), updated_at = NOW()
            WHERE id = $6 RETURNING *
        `, [name, title, image, order, isActive, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete director
// @route   DELETE /api/admin/directors/:id
// @access  Private (Admin)
async function deleteDirector(req, res) {
    try {
        const result = await query('DELETE FROM directors WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.json({ message: 'Director removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Invite new user & send email
// @route   POST /api/admin/users/invite
// @access  Private (Admin)
async function inviteUser(req, res) {
    try {
        const { name, email, password, role, universityId } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        // Check if user exists in PG
        const exists = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const newId = `user_${Date.now()}`;

        await query(`
            INSERT INTO users (id, name, email, password, role, "universityId", is_verified, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        `, [newId, name, normalizedEmail, hashedPassword, role, universityId || null]);

        // Email notification
        try {
            await sendEmail({
                email: normalizedEmail,
                subject: 'Account Created - SkillDad',
                html: emailTemplates.invitation(name, role, normalizedEmail, password)
            });
        } catch (err) {
            console.error('Invite email failed:', err.message);
        }

        res.status(201).json({ success: true, message: 'User invited successfully' });
    } catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all universities
async function getUniversities(req, res) {
    try {
        const resSet = await query("SELECT id as _id, name, bio, profile FROM users WHERE role = 'university'");
        res.json(resSet.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Assign courses to a university
// @route   PUT /api/admin/universities/:id/courses
// @access  Private (Admin)
async function assignCoursesToUniversity(req, res) {
    try {
        const { courses } = req.body; // Expecting an array of course IDs
        const universityRes = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const university = universityRes.rows[0];

        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }

        if (university.role !== 'university') {
            return res.status(400).json({ message: 'Target entity is not a university' });
        }

        let updatedAssignedCourses = university.profile?.assigned_courses || [];
        if (Array.isArray(courses)) {
            updatedAssignedCourses = courses;
        }

        const updatedProfile = university.profile || {};
        updatedProfile.assigned_courses = updatedAssignedCourses;

        const result = await query('UPDATE users SET profile = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, profile', [JSON.stringify(updatedProfile), req.params.id]);
        const updatedUniversity = result.rows[0];

        res.json({
            _id: updatedUniversity.id,
            name: updatedUniversity.name,
            assignedCourses: updatedUniversity.profile.assigned_courses,
            message: 'Courses assigned successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get university details (including students and assigned courses)
// @route   GET /api/admin/universities/:id
// @access  Private (Admin)
async function getUniversityDetail(req, res) {
    try {
        const universityRes = await query('SELECT id as _id, name, email, role, bio, profile_image as "profileImage", profile FROM users WHERE id = $1', [req.params.id]);
        const university = universityRes.rows[0];

        if (!university || university.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        // Fetch courses where this university is the instructor (Provider University)
        const providedCoursesRes = await query('SELECT id FROM courses WHERE instructor_id = $1', [university._id]);
        const providedIds = providedCoursesRes.rows.map(p => p.id.toString());

        // Manual assigned IDs
        const assignedIds = university.profile?.assigned_courses || [];

        // Combine unique IDs
        const finalIds = Array.from(new Set([...providedIds, ...assignedIds]));

        // Fetch full course data for all identified IDs
        let uniqueCourses = [];
        if (finalIds.length > 0) {
            const uniqueCoursesRes = await query('SELECT * FROM courses WHERE id = ANY($1)', [finalIds]);
            uniqueCourses = uniqueCoursesRes.rows;
        }

        const rawStudentsRes = await query('SELECT id as _id, name, email, is_verified as "isVerified", created_at as "createdAt" FROM users WHERE "universityId" = $1 AND role = \'student\'', [university._id]);
        const rawStudents = rawStudentsRes.rows;

        const students = await Promise.all(rawStudents.map(async (student) => {
            const enrollmentRes = await query(`
                SELECT c.title as course_title 
                FROM enrollments e 
                LEFT JOIN courses c ON e.course_id = c.id 
                WHERE e.student_id = $1 
                ORDER BY e.created_at DESC LIMIT 1
            `, [student._id]);
            const latestEnrollment = enrollmentRes.rows[0];
            return {
                ...student,
                course: latestEnrollment && latestEnrollment.course_title ? latestEnrollment.course_title : 'Enrolled'
            };
        }));

        res.json({
            university: {
                ...university,
                assignedCourses: uniqueCourses
            },
            students
        });
    } catch (error) {
        console.error('[getUniversityDetail] Internal Error:', error);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
}

// @desc    Admin enrolls a student in a course for free (no payment required)
// @route   POST /api/admin/students/:id/enroll
// @access  Private (Admin)
const adminEnrollStudent = async (req, res) => {
    try {
        const { courseId, universityId, note } = req.body;
        const studentId = req.params.id;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const studentRes = await query('SELECT * FROM users WHERE id = $1', [studentId]);
        const student = studentRes.rows[0];
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const course = courseRes.rows[0];
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollmentRes = await query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        if (existingEnrollmentRes.rows.length > 0) {
            return res.status(400).json({ message: `${student.name} is already enrolled in ${course.title}` });
        }

        // Determine and update student's universityId
        let assignedUniversityId = universityId;

        if (universityId) {
            const universityRes = await query('SELECT id, role FROM users WHERE id = $1', [universityId]);
            const university = universityRes.rows[0];
            if (!university || university.role !== 'university') {
                return res.status(400).json({ message: 'Invalid university ID' });
            }
            assignedUniversityId = universityId;
        } else if (course.instructor_id) {
            const instructorRes = await query('SELECT id, role FROM users WHERE id = $1', [course.instructor_id]);
            const instructor = instructorRes.rows[0];
            if (instructor && instructor.role === 'university') {
                assignedUniversityId = instructor.id;
            }
        }

        // Update student's universityId if we have one
        if (assignedUniversityId && (!student.universityId || student.universityId !== assignedUniversityId)) {
            await query('UPDATE users SET "universityId" = $1, updated_at = NOW() WHERE id = $2', [assignedUniversityId, studentId]);
            console.log(`[adminEnrollStudent] Updated student ${student.name} universityId to ${assignedUniversityId}`);
        }

        // Create enrollment
        const newEnrollmentId = `enr_${Date.now()}`;
        const enrollmentRes = await query(`
            INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
            VALUES ($1, $2, $3, 'active', 0, NOW(), NOW()) RETURNING *
        `, [newEnrollmentId, studentId, courseId]);
        const enrollment = enrollmentRes.rows[0];

        try {
            const existingProgressRes = await query('SELECT id FROM progress WHERE user_id = $1 AND course_id = $2', [studentId, courseId]);
            if (existingProgressRes.rows.length === 0) {
                const newProgressId = `prog_${Date.now()}`;
                await query(`
                    INSERT INTO progress (id, user_id, course_id, completed_videos, completed_exercises, project_submissions, is_completed)
                    VALUES ($1, $2, $3, '[]', '[]', '[]', false)
                `, [newProgressId, studentId, courseId]);
            }
        } catch (progressError) {
            console.error('[adminEnrollStudent] Error creating Progress record:', progressError.message);
        }

        const txnId = `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        let partnerId = null;
        let centerName = 'Admin Enrolled';

        if (universityId) {
            partnerId = universityId;
            const uniUserRes = await query('SELECT name, profile FROM users WHERE id = $1', [universityId]);
            const uniUser = uniUserRes.rows[0];
            if (uniUser) {
                centerName = uniUser.profile?.universityName || uniUser.name;
            }
        } else if (student.registered_by) {
            partnerId = student.registered_by;
            const partnerUserRes = await query('SELECT name, profile FROM users WHERE id = $1', [partnerId]);
            const partnerUser = partnerUserRes.rows[0];
            if (partnerUser) {
                centerName = partnerUser.profile?.partnerName || partnerUser.profile?.universityName || partnerUser.name;
            }
        } else if (student.universityId) {
            partnerId = student.universityId;
            const uniUserRes = await query('SELECT name, profile FROM users WHERE id = $1', [partnerId]);
            const uniUser = uniUserRes.rows[0];
            if (uniUser) {
                centerName = uniUser.profile?.universityName || uniUser.name;
            }
        }

        await query(`
            INSERT INTO payments (id, student_id, course_id, amount, payment_method, transaction_id, status, partner_id, center_name, notes, reviewed_by_id, reviewed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        `, [`pay_${Date.now()}`, studentId, courseId, 0, 'admin_enrolled', txnId, 'approved', partnerId || null, centerName, note || `Admin free enrollment by ${req.user?.name || 'Admin'}`, req.user?.id]);

        try {
            socketService.emitToUser(studentId, 'ENROLLMENT_CREATED', {
                courseId,
                courseTitle: course.title,
                message: `You have been enrolled in ${course.title} by admin`
            });
        } catch (e) { }

        if (assignedUniversityId) {
            try {
                socketService.emitToUser(assignedUniversityId, 'STUDENT_ENROLLED', {
                    studentId: student.id,
                    studentName: student.name,
                    studentEmail: student.email,
                    courseId,
                    courseTitle: course.title,
                    enrollmentId: enrollment.id,
                    message: `${student.name} has been enrolled in ${course.title}`
                });
            } catch (e) {
                console.error('[adminEnrollStudent] University socket notification error:', e.message);
            }
        }

        try {
            const whatsAppService = require('../services/WhatsAppService');
            const enrolledBy = req.user?.name || 'Admin';

            if (student.email) {
                await sendEmail({
                    email: student.email,
                    subject: `Course Enrollment Confirmed - ${course.title}`,
                    html: emailTemplates.adminEnrollment(student.name, course.title, enrolledBy)
                }).catch(err => console.error('[adminEnrollStudent] Email error:', err.message));
            }

            const studentPhone = student.phone || student.profile?.phone;
            if (studentPhone) {
                await whatsAppService.notifyAdminEnrollment(
                    student.name,
                    studentPhone,
                    course.title,
                    enrolledBy
                ).catch(err => console.error('[adminEnrollStudent] WhatsApp error:', err.message));
            }
        } catch (notifError) {
            console.error('[adminEnrollStudent] Notification error:', notifError.message);
        }

        res.status(201).json({
            message: `${student.name} successfully enrolled in ${course.title}${universityId ? ' and assigned to university' : ''}`,
            enrollment,
            transactionId: txnId
        });
    } catch (error) {
        console.error('[adminEnrollStudent] error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
        }
        res.status(500).json({ message: error.message || 'Failed to enroll student' });
    }
};

// @desc    Admin removes student enrollment from a course
// @route   DELETE /api/admin/students/:id/enroll/:courseId
// @access  Private (Admin)
const adminUnenrollStudent = async (req, res) => {
    try {
        const { id: studentId, courseId } = req.params;

        const enrollmentRes = await query('DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING id', [studentId, courseId]);
        if (enrollmentRes.rowCount === 0) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        await query(`
            UPDATE payments 
            SET status = 'rejected', notes = 'Unenrolled by admin', updated_at = NOW() 
            WHERE student_id = $1 AND course_id = $2 AND payment_method = 'admin_enrolled'
        `, [studentId, courseId]);

        res.json({ message: 'Student unenrolled successfully' });
    } catch (error) {
        console.error('[adminUnenrollStudent] error:', error);
        res.status(500).json({ message: error.message || 'Failed to unenroll student' });
    }
};

// @desc    Admin updates university profile image
// @route   POST /api/admin/universities/:id/upload-image
// @access  Private (Admin)
const uploadUniversityProfileImage = async (req, res) => {
    try {
        const userRes = await query('SELECT role FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        await query('UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2', [imagePath, req.params.id]);

        res.json({
            message: 'University profile image updated',
            profileImage: imagePath
        });
    } catch (error) {
        console.error('[uploadUniversityProfileImage] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading image' });
    }
};

// @desc    Upload university cover image
// @route   POST /api/admin/universities/:id/upload-cover
// @access  Private (Admin)
const uploadUniversityCoverImage = async (req, res) => {
    try {
        const userRes = await query('SELECT role, profile FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        const updatedProfile = user.profile || {};
        updatedProfile.coverImage = imagePath;

        await query('UPDATE users SET profile = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updatedProfile), req.params.id]);

        res.json({
            message: 'University cover image updated',
            coverImage: imagePath
        });
    } catch (error) {
        console.error('[uploadUniversityCoverImage] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading cover image' });
    }
};

// @desc    Admin updates university profile data (bio, location, etc.)
// @route   PUT /api/admin/universities/:id/profile
// @access  Private (Admin)
const updateUniversityProfile = async (req, res) => {
    try {
        const { bio, location, website, phone, personnel } = req.body;
        const userRes = await query('SELECT role, bio, profile FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        const updatedProfile = user.profile || {};
        const updatedBio = bio !== undefined ? bio : user.bio;
        updatedProfile.location = location !== undefined ? location : updatedProfile.location;
        updatedProfile.website = website !== undefined ? website : updatedProfile.website;
        updatedProfile.phone = phone !== undefined ? phone : updatedProfile.phone;
        if (personnel !== undefined) updatedProfile.personnel = personnel;


        const result = await query(`
            UPDATE users SET bio = $1, profile = $2, updated_at = NOW() WHERE id = $3
            RETURNING id, bio, profile
        `, [updatedBio, JSON.stringify(updatedProfile), req.params.id]);

        const updatedUser = result.rows[0];

        res.json({
            message: 'University profile updated successfully',
            user: {
                _id: updatedUser.id,
                bio: updatedUser.bio,
                profile: updatedUser.profile
            }
        });
    } catch (error) {
        console.error('[updateUniversityProfile] Error:', error);
        res.status(500).json({ message: error.message || 'Server error updating profile' });
    }
};

module.exports = {
    updateEntity,
    getGlobalStats,
    getAllUsers,
    getUserById,
    updateUserRole,
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
    inviteUser,
    getUniversities,
    assignCoursesToUniversity,
    getUniversityDetail,
    adminEnrollStudent,
    adminUnenrollStudent,
    uploadUniversityProfileImage,
    uploadUniversityCoverImage,
    updateUniversityProfile
};
