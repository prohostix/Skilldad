const { query, getPool } = require('../config/postgres');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const socketService = require('../services/SocketService');
const bcrypt = require('bcryptjs');

const parseProfile = (profile) => {
    if (typeof profile !== 'string') return profile || {};
    try { return JSON.parse(profile) || {}; } catch (e) { return {}; }
};


// @desc    Update entity (partner/university) details + discount rate
// @route   PUT /api/admin/entities/:id
// @access  Private (Admin)
const updateEntity = async (req, res) => {
    try {
        console.log('[updateEntity] body:', req.body, 'id:', req.params.id);
        const { name, email, role, discountRate, bio, password, profileImage } = req.body;

        const userRes = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        let updatedName = user.name;
        let updatedProfile = parseProfile(user.profile);
        let updatedBio = bio !== undefined ? bio : user.bio;
        let updatedPassword = user.password;
        let updatedProfileImage = profileImage !== undefined ? profileImage : user.profile_image;

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
            const validRoles = ['student', 'university', 'partner', 'admin', 'finance', 'instructor'];
            const lowerRole = role.toLowerCase();
            if (!validRoles.includes(lowerRole)) {
                return res.status(400).json({ message: `Invalid role: ${role}` });
            }
            updatedRole = lowerRole;
        }

        if (password && password.trim()) {
            updatedPassword = await bcrypt.hash(password, 8);
        }

        const updatedDiscountRate = discountRate !== undefined && discountRate !== null ? Number(discountRate) : user.discount_rate;
        const result = await query(`
            UPDATE users 
            SET name = $1, email = $2, role = $3, discount_rate = $4, profile = $5, bio = $6, password = $7, profile_image = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING id, name, email, role, discount_rate, bio, is_verified as "isVerified", profile_image
        `, [updatedName, updatedEmail, updatedRole, updatedDiscountRate, JSON.stringify(updatedProfile), updatedBio, updatedPassword, updatedProfileImage, req.params.id]);

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
            isVerified: saved.isVerified,
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
        console.log('[getGlobalStats] Starting queries (v2 with intensive logs)...');
        
        console.log('[getGlobalStats] Querying userCount...');
        const userCount = await query('SELECT COUNT(*) FROM users').catch(e => { console.error('userCount Error:', e.message); return { rows: [{ count: 0 }] }; });
        
        console.log('[getGlobalStats] Querying courseCount...');
        const courseCount = await query('SELECT COUNT(*) FROM courses').catch(e => { console.error('courseCount Error:', e.message); return { rows: [{ count: 0 }] }; });
        
        console.log('[getGlobalStats] Querying studentCount...');
        const studentCount = await query("SELECT COUNT(*) FROM users WHERE role = 'student'").catch(e => { console.error('studentCount Error:', e.message); return { rows: [{ count: 0 }] }; });
        
        console.log('[getGlobalStats] Querying partnerCount...');
        const partnerCount = await query("SELECT COUNT(*) FROM users WHERE role = 'partner'").catch(e => { console.error('partnerCount Error:', e.message); return { rows: [{ count: 0 }] }; });
        
        console.log('[getGlobalStats] Querying ticketCount...');
        const ticketCount = await query("SELECT COUNT(*) FROM support_tickets WHERE status = 'open'").catch(e => { console.error('ticketCount Error:', e.message); return { rows: [{ count: 0 }] }; });
        
        console.log('[getGlobalStats] Querying revenueRes...');
        const revenueRes = await query("SELECT SUM(final_amount) as total FROM transactions WHERE status = 'success'").catch(e => { console.error('revenueRes Error:', e.message); return { rows: [{ total: 0 }] }; });
        
        console.log('[getGlobalStats] Querying careerAppCount...');
        const careerAppCount = await query('SELECT COUNT(*) FROM skilldad_applications').catch(e => { console.error('careerAppCount Error:', e.message); return { rows: [{ count: 0 }] }; });

        console.log('[getGlobalStats] Querying dbSizeRes...');
        const dbSizeRes = await query("SELECT pg_database_size(current_database()) as size").catch(e => { console.error('dbSizeRes Error (falling back to 0):', e.message); return { rows: [{ size: 0 }] }; });
        
        console.log('[getGlobalStats] Querying chartRes...');
        const chartRes = await query(`
            WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date as day
            )
            SELECT 
                TO_CHAR(d.day, 'Dy') as name,
                COUNT(e.id) as value
            FROM days d
            LEFT JOIN enrollments e ON d.day = e.created_at::date
            GROUP BY d.day
            ORDER BY d.day
        `).catch(e => { console.error('chartRes Error:', e.message); return { rows: [] }; });
        
        console.log('[getGlobalStats] Querying activityRes...');
        const activityRes = await query(`
            (SELECT 
                u.name as user, 
                'Enrolled in ' || c.title as action,
                e.created_at as time,
                u.name as initial
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.created_at DESC
            LIMIT 5)
            UNION ALL
            (SELECT 
                COALESCE(s."studentName", u.name) as user,
                'Applied for ' || v.title as action,
                a.applied_at as time,
                COALESCE(s."studentName", u.name) as initial
            FROM skilldad_applications a
            LEFT JOIN students s ON a.student_id = s.id
            LEFT JOIN users u ON a.student_id = u.id
            JOIN skilldad_vacancies v ON a.vacancy_id = v.id
            ORDER BY a.applied_at DESC
            LIMIT 5)
            ORDER BY time DESC
            LIMIT 10
        `).catch(e => { console.error('activityRes Error:', e.message); return { rows: [] }; });
        
        console.log('[getGlobalStats] All queries completed with fallbacks (v2).');

        const totalRevenue = revenueRes.rows[0].total ? parseFloat(revenueRes.rows[0].total) : 0;
        const dbSizeBytes = parseInt(dbSizeRes.rows[0].size);
        const dbSizeMB = (dbSizeBytes / (1024 * 1024)).toFixed(2);

        // Map activities to the format expected by the frontend
        const recentActivities = activityRes.rows.map(act => ({
            user: act.user,
            action: act.action,
            initial: (act.initial || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            time: new Date(act.time).toLocaleString() // Or a more "ago" like format if preferred
        }));

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalCourses: parseInt(courseCount.rows[0].count),
            totalStudents: parseInt(studentCount.rows[0].count),
            totalPartners: parseInt(partnerCount.rows[0].count),
            totalTickets: parseInt(ticketCount.rows[0].count),
            totalApplications: parseInt(careerAppCount.rows[0].count),
            totalRevenue: totalRevenue,
            dbSize: `${dbSizeMB} MB`,
            chartData: chartRes.rows,
            recentActivities
        });
    } catch (error) {
        console.error('getGlobalStats Error:', error);
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

        const usersRes = await query('SELECT id as _id, name, email, role, profile, is_verified as "isVerified", created_at as "createdAt" FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [pageSize, offset]);

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
        const result = await query('UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_verified as "isVerified"', [newStatus, req.params.id]);
        const updatedUser = result.rows[0];

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...updatedUser, _id: updatedUser.id });

        res.json({
            _id: updatedUser.id,
            isVerified: updatedUser.isVerified,
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
        let userStatsQuery = 'SELECT role as _id, COUNT(*) as count FROM users';
        const params = [];

        // Simple validation: only add WHERE clause if both dates are present and non-empty
        if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Ensure dates are valid before adding to query
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                userStatsQuery += ' WHERE created_at >= $1 AND created_at <= $2';
                params.push(start, end);
            }
        }

        console.log('[getPlatformAnalytics] Starting queries (intensive logs)...');

        userStatsQuery += ' GROUP BY role';
        console.log('[getPlatformAnalytics] Querying userStats...');
        const userStatsRes = await query(userStatsQuery, params).catch(e => { 
            console.error('userStats Error:', e.message); 
            return { rows: [] }; 
        });

        // Real enrollment sources
        console.log('[getPlatformAnalytics] Querying enrollmentSources...');
        const sourcesRes = await query(`
            SELECT 
                CASE 
                    WHEN university_id IS NOT NULL THEN 'University'
                    WHEN partner_code IS NOT NULL THEN 'Partner'
                    ELSE 'Direct'
                END as source,
                COUNT(*) as count
            FROM users
            WHERE role = 'student'
            GROUP BY 1
        `).catch(e => { 
            console.error('enrollmentSources Error:', e.message); 
            return { rows: [] }; 
        });

        // Real revenue impact
        console.log('[getPlatformAnalytics] Querying revenueImpact...');
        const revenueImpactRes = await query(`
            SELECT 
                CASE 
                    WHEN u.university_id IS NOT NULL THEN 'University'
                    WHEN u.partner_code IS NOT NULL THEN 'Partner'
                    ELSE 'Direct'
                END as source,
                COALESCE(SUM(t.final_amount), 0) as amount
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.status = 'success'
            GROUP BY 1
        `).catch(e => { 
            console.error('revenueImpact Error:', e.message); 
            return { rows: [] }; 
        });

        // Convert revenue impact array to object
        const revenueImpact = {
            direct: 0,
            partner: 0,
            university: 0
        };
        (revenueImpactRes.rows || []).forEach(row => {
            const key = row.source ? row.source.toLowerCase() : 'direct';
            revenueImpact[key] = parseFloat(row.amount);
        });

        console.log('[getPlatformAnalytics] Queries completed with fallbacks.');

        res.json({
            userStats: userStatsRes.rows,
            enrollmentSources: sourcesRes.rows,
            revenueImpact
        });
    } catch (error) {
        console.error('getPlatformAnalytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Test real-time notifications
// @route   POST /api/admin/test-notification
// @access  Private (Admin)
const testNotification = async (req, res) => {
    try {
        console.log('[testNotification] Triggering test broadcast to admins...');
        
        socketService.broadcastToAdmins('admin_notification', {
            title: 'System Test',
            message: 'Real-time notification working perfectly! 🔥',
            type: 'test',
            timestamp: new Date()
        });

        res.json({ success: true, message: 'Test notification broadcasted' });
    } catch (error) {
        console.error('testNotification Error:', error);
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
        const userRes = await query('SELECT id as _id, name, email, role, profile, discount_rate, is_verified as "isVerified", created_at as "createdAt" FROM users WHERE id = $1', [req.params.id]);
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
            RETURNING id, name, email, role, is_verified as "isVerified"
        `, [role, req.params.id]);

        const updatedUser = result.rows[0];

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...updatedUser, _id: updatedUser.id });

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
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
            RETURNING id, name, email, role, is_verified as "isVerified"
        `, [req.params.id]);

        const updatedUser = result.rows[0];

        // Notify admins via WebSocket
        socketService.notifyUserListUpdate('updated', { ...updatedUser, _id: updatedUser.id });

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
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
        const { courseId, universityId, registeredBy } = req.query;

        let studentsQuery = `
            SELECT 
                u.id as _id, u.name, u.email, u.role, u.profile, 
                u.university_id as "universityId", u.registered_by as "registeredBy", 
                u.is_verified as "isVerified", u.created_at as "createdAt",
                COALESCE(e_count.count, 0) as "enrollmentCount",
                c.title as "course"
            FROM users u
            LEFT JOIN (
                SELECT student_id, COUNT(*) as count, MAX(created_at) as last_enrollment
                FROM enrollments 
                GROUP BY student_id
            ) e_count ON u.id = e_count.student_id
            LEFT JOIN enrollments e_latest ON u.id = e_latest.student_id AND e_latest.created_at = e_count.last_enrollment
            LEFT JOIN courses c ON e_latest.course_id = c.id
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

        if (registeredBy) {
            studentsQuery += ` AND u.registered_by = $${params.length + 1}`;
            params.push(registeredBy);
        }

        studentsQuery += ' ORDER BY u.created_at DESC';

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

// @desc    Get student reward points
// @route   GET /api/admin/students/:id/reward-points
// @access  Private (Admin)
const getStudentRewardPoints = async (req, res) => {
    try {
        const userId = req.params.id;
        const [totalRes, historyRes] = await Promise.all([
            query('SELECT COALESCE(SUM(points), 0) AS total FROM reward_points WHERE user_id = $1', [userId]),
            query('SELECT points, reason, created_at FROM reward_points WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId])
        ]);
        res.json({
            total: parseInt(totalRes.rows[0].total, 10),
            history: historyRes.rows
        });
    } catch (error) {
        console.error('Error in getStudentRewardPoints:', error);
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
        
        let updatedProfile = parseProfile(student.profile);
        if (req.body.phone !== undefined) {
            updatedProfile.phone = req.body.phone;
        }

        const result = await query(`
            UPDATE users 
            SET name = $1, email = $2, bio = $3, is_verified = $4, profile = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING id, name, email, bio, role, is_verified as "isVerified", profile
        `, [updatedName, updatedEmail, updatedBio, updatedIsVerified, JSON.stringify(updatedProfile), req.params.id]);

        const updatedStudent = result.rows[0];

        res.json({
            _id: updatedStudent.id,
            name: updatedStudent.name,
            email: updatedStudent.email,
            bio: updatedStudent.bio,
            role: updatedStudent.role,
            isVerified: updatedStudent.isVerified,
            profile: updatedStudent.profile
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
        const crypto = require('crypto');
        const newId = crypto.randomUUID();
        const result = await query(`
            INSERT INTO partner_logos (id, name, logo, type, location, students, programs, "order", is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `, [newId, name, logoUrl, type || 'corporate', location, students || 0, programs || 0, order || 0]);

        res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        console.error('Create Partner Logo Error:', error);
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

// @desc    Upload partner logo image
// @route   POST /api/admin/partner-logos/:id/upload
// @access  Private (Admin)
async function uploadPartnerLogoImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const logoUrl = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE partner_logos SET logo = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [logoUrl, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Partner logo not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
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
        const { name, title, image, order, category, bio, linkedin_url, display_target, university, accent_color } = req.body;
        const crypto = require('crypto');
        const newId = crypto.randomUUID();
        const result = await query(`
            INSERT INTO directors (id, name, title, image, "order", category, bio, linkedin_url, display_target, university, accent_color, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true) RETURNING *
        `, [newId, name, title, image, order || 0, category || 'DIRECTOR', bio || '', linkedin_url || '', display_target || 'ABOUT_DIRECTOR', university || '', accent_color || 'primary']);

        res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        console.error('Create Director Error:', error);
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update director
// @route   PUT /api/admin/directors/:id
// @access  Private (Admin)
async function updateDirector(req, res) {
    try {
        const { name, title, image, order, isActive, category, bio, linkedin_url, display_target, university, accent_color } = req.body;
        const result = await query(`
            UPDATE directors 
            SET name = COALESCE($1, name), title = COALESCE($2, title), image = COALESCE($3, image), 
                "order" = COALESCE($4, "order"), is_active = COALESCE($5, is_active), 
                category = COALESCE($6, category), bio = COALESCE($7, bio), 
                linkedin_url = COALESCE($8, linkedin_url), display_target = COALESCE($9, display_target),
                university = COALESCE($10, university), accent_color = COALESCE($11, accent_color),
                updated_at = NOW()
            WHERE id = $12 RETURNING *
        `, [name, title, image, order, isActive, category, bio, linkedin_url, display_target, university, accent_color, req.params.id]);

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

// @desc    Upload director image
// @route   POST /api/admin/directors/:id/upload
// @access  Private (Admin)
async function uploadDirectorImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE directors SET image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [imageUrl, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Director not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Invite new user & send email
// @route   POST /api/admin/users/invite
// @access  Private (Admin)
async function inviteUser(req, res) {
    try {
        const { name, email, password, role, universityId, phone } = req.body;
        console.log('[inviteUser] Request Payload:', { name, email, role, universityId, phone, hasPassword: !!password });
        
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        // Check if user exists in PG
        const exists = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (exists.rows.length > 0) {
            console.log('[inviteUser] User already exists:', normalizedEmail);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('[inviteUser] Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 8);
        const newId = `user_${Date.now()}`;

        console.log('[inviteUser] Inserting into DB...');
        await query(`
            INSERT INTO users (id, name, email, password, role, university_id, is_verified, profile, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, true, $7, NOW(), NOW())
        `, [
            newId, 
            name, 
            normalizedEmail, 
            hashedPassword, 
            role, 
            universityId || null,
            JSON.stringify({ phone: phone || '' })
        ]);

        console.log('[inviteUser] DB Insert successful. Sending notifications...');
        
        // Email notification
        try {
            await sendEmail({
                email: normalizedEmail,
                subject: 'Account Created - SkillDad',
                html: emailTemplates.invitation(name, role, normalizedEmail, password)
            });
            console.log('[inviteUser] Email sent successfully to:', normalizedEmail);
        } catch (err) {
            console.error('[inviteUser] Invite email failed:', err.message);
        }

        // WhatsApp/Welcome notification
        if (phone) {
            setImmediate(async () => {
                try {
                    const notificationService = require('../services/NotificationService');
                    await notificationService.send({ name, email: normalizedEmail, phone }, 'welcome');
                    console.log('[inviteUser] WhatsApp notification triggered for:', phone);
                } catch (err) {
                    console.error('[inviteUser] WhatsApp notification failed:', err.message);
                }
            });
        }

        res.status(201).json({ success: true, message: 'User invited successfully' });
    } catch (error) {
        console.error('[inviteUser] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all universities
async function getUniversities(req, res) {
    try {
        const resSet = await query(`
            SELECT 
                id as _id, 
                name, 
                email, 
                role, 
                bio, 
                profile, 
                profile_image as "profileImage",
                is_verified as "isVerified", 
                discount_rate as "discountRate",
                created_at
            FROM users 
            WHERE LOWER(role) IN ('university', 'partner')
            ORDER BY created_at DESC
        `);
        res.json(resSet.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Helper to delete physical files from the uploads directory
const deletePhysicalFiles = async (filePaths) => {
    const fs = require('fs').promises;
    const path = require('path');
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    for (const filePath of paths) {
        if (!filePath || typeof filePath !== 'string') continue;
        
        // Remove /uploads/ prefix for path joining (if it's a relative URL)
        const relativePath = filePath.startsWith('/uploads/') ? filePath.replace('/uploads/', '') : filePath;
        const fullPath = path.join(global.BASE_UPLOAD_PATH || path.join(__dirname, '../uploads'), relativePath);
        
        try {
            const fsSync = require('fs');
            if (fsSync.existsSync(fullPath)) {
                await fs.unlink(fullPath);
                console.log(`[Cleanup] Successfully deleted file: ${fullPath}`);
            }
        } catch (err) {
            console.warn(`[Cleanup] Failed to delete file: ${fullPath}`, err.message);
        }
    }
};

// @desc    Delete a university and its associated data
// @route   DELETE /api/admin/universities/:id
// @access  Private (Admin)
async function deleteUniversity(req, res) {
    const { id } = req.params;
    const pool = getPool();
    const client = await pool.connect();

    try {
        // 1. Fetch full university record
        const uniRes = await client.query('SELECT id, name, role, profile_image, profile FROM users WHERE id = $1', [id]);
        const uni = uniRes.rows[0];

        if (!uni) {
            client.release();
            return res.status(404).json({ message: 'University not found' });
        }

        if (uni.role !== 'university' && uni.role !== 'partner') {
            client.release();
            return res.status(400).json({ message: 'User is not a university or partner' });
        }

        console.log(`[CascadeDelete] Starting full cleanup for ${uni.role}: ${uni.name} (${id})`);

        // 2. Identify all related entities for file cleanup
        const coursesRes = await client.query('SELECT id, thumbnail, brochure_url, modules FROM courses WHERE instructor_id = $1', [id]);
        const courses = coursesRes.rows;
        const courseIds = courses.map(c => c.id);

        const examsRes = await client.query('SELECT id, question_paper_url FROM exams WHERE university_id = $1 OR (course_id = ANY($2))', [id, courseIds.length > 0 ? courseIds : ['_none_']]);
        const exams = examsRes.rows;
        const examIds = exams.map(e => e.id);

        const questionsRes = await client.query('SELECT id, question_image FROM questions WHERE exam_id = ANY($1)', [examIds.length > 0 ? examIds : ['_none_']]);
        const questions = questionsRes.rows;

        const projectsRes = await client.query('SELECT id, file_url FROM projects WHERE student_id = $1 OR course_id = ANY($2)', [id, courseIds.length > 0 ? courseIds : ['_none_']]);
        const projects = projectsRes.rows;

        const docsRes = await client.query('SELECT id, file_url FROM documents WHERE university_id = $1 OR uploaded_by_id = $1', [id]);
        const docs = docsRes.rows;

        const payoutsRes = await client.query('SELECT id, screenshot_url FROM payouts WHERE partner_id = $1', [id]);
        const payouts = payoutsRes.rows;

        // 3. Build comprehensive list of files to delete
        const filesToDelete = [];
        
        // University files
        if (uni.profile_image) filesToDelete.push(uni.profile_image);
        const profile = typeof uni.profile === 'string' ? JSON.parse(uni.profile) : (uni.profile || {});
        if (profile.coverImage) filesToDelete.push(profile.coverImage);
        if (Array.isArray(profile.gallery)) filesToDelete.push(...profile.gallery);
        if (Array.isArray(profile.certificates)) {
            profile.certificates.forEach(cert => {
                if (cert.file_url) filesToDelete.push(cert.file_url);
            });
        }
        if (Array.isArray(profile.faculty)) {
            profile.faculty.forEach(fac => {
                if (fac.image) filesToDelete.push(fac.image);
            });
        }

        // Course files
        courses.forEach(c => {
            if (c.thumbnail) filesToDelete.push(c.thumbnail);
            if (c.brochure_url) filesToDelete.push(c.brochure_url);
            // Handle videos in modules
            if (Array.isArray(c.modules)) {
                c.modules.forEach(m => {
                    if (Array.isArray(m.videos)) {
                        m.videos.forEach(v => {
                            if (v.url && (v.url.startsWith('/uploads/') || !v.url.startsWith('http'))) {
                                filesToDelete.push(v.url);
                            }
                        });
                    }
                });
            }
        });

        // Exam files
        exams.forEach(e => {
            if (e.question_paper_url) filesToDelete.push(e.question_paper_url);
        });

        // Question images
        questions.forEach(q => {
            if (q.question_image) filesToDelete.push(q.question_image);
        });

        // Project files
        projects.forEach(p => {
            if (p.file_url) filesToDelete.push(p.file_url);
        });

        // Document files
        docs.forEach(d => {
            if (d.file_url) filesToDelete.push(d.file_url);
        });

        // Payout screenshots
        payouts.forEach(p => {
            if (p.screenshot_url) filesToDelete.push(p.screenshot_url);
        });

        // 4. Perform Physical File Deletion
        if (filesToDelete.length > 0) {
            await deletePhysicalFiles(filesToDelete);
        }

        // 5. Database Deletion (Transaction)
        await client.query('BEGIN');
        try {
            // Nullify student associations
            await client.query('UPDATE users SET university_id = NULL WHERE university_id = $1', [id]);
            await client.query('UPDATE users SET registered_by = NULL WHERE registered_by = $1', [id]);

            if (courseIds.length > 0) {
                // Course dependencies
                await client.query('DELETE FROM progress WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM submissions WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM enrollments WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM projects WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM interactive_contents WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM live_sessions WHERE course_id = ANY($1)', [courseIds]);
                await client.query('DELETE FROM transactions WHERE course_id = ANY($1)', [courseIds]);
            }

            if (examIds.length > 0) {
                // Exam dependencies
                await client.query('DELETE FROM results WHERE exam_id = ANY($1)', [examIds]);
                await client.query('DELETE FROM exam_submissions_new WHERE exam_id = ANY($1)', [examIds]);
                await client.query('DELETE FROM questions WHERE exam_id = ANY($1)', [examIds]);
                await client.query('DELETE FROM exams WHERE id = ANY($1)', [examIds]);
            }

            // University dependencies
            await client.query('DELETE FROM payouts WHERE partner_id = $1', [id]);
            await client.query('DELETE FROM discounts WHERE partner_id = $1', [id]);
            await client.query('DELETE FROM live_sessions WHERE university_id = $1 OR instructor_id = $2', [id, id]);
            await client.query('DELETE FROM documents WHERE uploaded_by_id = $1 OR university_id = $1', [id]);
            
            // Delete courses
            if (courseIds.length > 0) {
                await client.query('DELETE FROM courses WHERE id = ANY($1)', [courseIds]);
            }

            // Finally delete the university/partner
            await client.query('DELETE FROM users WHERE id = $1', [id]);

            await client.query('COMMIT');
            
            // 6. Delete Physical Files after successful DB cleanup
            if (filesToDelete.length > 0) {
                await deletePhysicalFiles(filesToDelete);
            }
            
            // Notify via WebSocket
            if (socketService.notifyUserListUpdate) {
                socketService.notifyUserListUpdate('deleted', { ...uni, _id: uni.id });
            }

            res.json({ 
                success: true, 
                message: 'University and all associated data (courses, exams, files) deleted successfully' 
            });
        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('[deleteUniversity] CRITICAL Cascade Error:', error);
        res.status(500).json({ message: error.message || 'Server error during cascade deletion' });
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

        if (university.role !== 'university' && university.role !== 'partner') {
            return res.status(400).json({ message: 'Target entity is not a university or partner' });
        }

        let updatedAssignedCourses = Array.isArray(university.profile?.assigned_courses) ? university.profile.assigned_courses : [];
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

        if (university && typeof university.profile === 'string') {
            try { university.profile = JSON.parse(university.profile); } catch(e) { university.profile = {}; }
        }

        if (!university || (university.role !== 'university' && university.role !== 'partner')) {
            return res.status(404).json({ message: 'University or partner not found' });
        }

        // Fetch courses where this university is the instructor (Provider University)
        const providedCoursesRes = await query('SELECT id FROM courses WHERE instructor_id = $1', [university._id]);
        const providedIds = providedCoursesRes.rows.map(p => p.id.toString());

        // Manual assigned IDs
        const assignedIds = Array.isArray(university.profile?.assigned_courses) ? university.profile.assigned_courses : [];

        // UNIQUE combined IDs
        const finalIds = Array.from(new Set([...providedIds, ...assignedIds].filter(id => id && (typeof id === 'string' || typeof id === 'number')))).map(id => id.toString()).filter(id => id.trim() !== '');

        // Fetch full course data for all identified IDs
        let uniqueCourses = [];
        if (finalIds.length > 0) {
            try {
                const uniqueCoursesRes = await query('SELECT * FROM courses WHERE id = ANY($1)', [finalIds]);
                uniqueCourses = uniqueCoursesRes.rows;
            } catch (err) {
                console.error('[getUniversityDetail] Error fetching courses:', err.message);
                // Non-fatal, continue with empty/partial list
            }
        }

        const rawStudentsRes = await query('SELECT id as _id, name, email, is_verified as "isVerified", created_at as "createdAt" FROM users WHERE university_id = $1 AND role = \'student\'', [university._id]);
        const rawStudents = rawStudentsRes.rows;

        const students = await Promise.all(rawStudents.map(async (student) => {
            try {
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
            } catch (err) {
                console.error(`[getUniversityDetail] Error for student ${student._id}:`, err.message);
                return { ...student, course: 'Error' };
            }
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
        console.log(`[AdminEnroll] Start: student=${studentId}, course=${courseId}, university=${universityId}`);

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const studentRes = await query('SELECT id, name, email, role, university_id, registered_by, profile FROM users WHERE id = $1', [studentId]);
        const student = studentRes.rows[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: `User is not a student (Role: ${student.role})` });
        }

        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const course = courseRes.rows[0];
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollmentRes = await query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        if (existingEnrollmentRes.rows.length > 0) {
            console.log(`[AdminEnroll] Student already enrolled: ${studentId}`);
            return res.status(400).json({ message: `${student.name} is already enrolled in ${course.title}` });
        }

        console.log(`[AdminEnroll] Determining university assignment...`);
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

        if (assignedUniversityId && (student.university_id !== assignedUniversityId)) {
            console.log(`[AdminEnroll] Updating university_id to ${assignedUniversityId}`);
            await query('UPDATE users SET university_id = $1, updated_at = NOW() WHERE id = $2', [assignedUniversityId, studentId]);
        }

        console.log(`[AdminEnroll] Creating enrollment record...`);
        const newEnrollmentId = `enr_${Date.now()}`;
        const enrollmentRes = await query(`
            INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
            VALUES ($1, $2, $3, 'active', 0, NOW(), NOW()) RETURNING *
        `, [newEnrollmentId, studentId, courseId]);
        const enrollment = enrollmentRes.rows[0];

        console.log(`[AdminEnroll] Checking/Creating progress record...`);
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
            console.error('[AdminEnroll] Error creating Progress record:', progressError.message);
        }

        const txnId = `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        console.log(`[AdminEnroll] Created Admin Transaction ID: ${txnId}`);

        let partnerId = null;
        let centerName = 'Admin Enrolled';

        if (universityId) {
            partnerId = universityId;
        } else if (student.registered_by) {
            partnerId = student.registered_by;
        } else if (student.university_id) {
            partnerId = student.university_id;
        }

        // Validate partnerId existence to prevent Foreign Key Violation (e.g. corrupt legacy data)
        if (partnerId) {
            try {
                const partnerExists = await query('SELECT id FROM users WHERE id = $1', [partnerId]);
                if (partnerExists.rows.length === 0) {
                    console.log(`[AdminEnroll] WARNING: Partner ID ${partnerId} not found in users table. Reverting to null for transaction.`);
                    partnerId = null;
                }
            } catch (err) {
                console.error('[AdminEnroll] Partner validation error:', err.message);
                partnerId = null;
            }
        }

        console.log(`[AdminEnroll] Inserting transaction... partnerId: ${partnerId}`);
        try {
            await query(`
                INSERT INTO transactions (id, student_id, course_id, final_amount, payment_method, gateway_transaction_id, status, partner_id, notes, reviewed_by, reviewed_at, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
            `, [`txn_${Date.now()}`, studentId, courseId, 0, 'admin_enrolled', txnId, 'completed', partnerId || null, note || `Admin free enrollment by ${req.user?.name || 'Admin'}`, req.user?.id]);
        } catch (dbErr) {
            console.error('[AdminEnroll] Transaction INSERT failed:', dbErr);
            throw new Error(`Database transaction log failed: ${dbErr.message}`);
        }

        try {
            const notificationService = require('../services/NotificationService');
            const enrolledBy = req.user?.name || 'Admin';

            // Send via multi-channel service (WhatsApp + Email)
            setImmediate(async () => {
                try {
                    const studentData = { ...student, phone: student.phone || student.profile?.phone };
                    if (typeof student.profile === 'string') {
                        try {
                            const p = JSON.parse(student.profile);
                            studentData.phone = student.phone || p.phone;
                        } catch(e) {}
                    }
                    await notificationService.send(studentData, 'enrollment', { courseTitle: course.title, enrolledBy });
                } catch (err) {
                    console.error('[AdminEnroll] Unified Notification failed:', err.message);
                }
            });

            // Keep socket notification for real-time UI update
            socketService.sendToUser(studentId, 'ENROLLMENT_CREATED', {
                courseId,
                courseTitle: course.title,
                message: `You have been enrolled in ${course.title} by admin`
            });

        } catch (notifError) {
            console.error('[AdminEnroll] Notification block error:', notifError.message);
        }

        console.log(`[AdminEnroll] Enrollment Successful!`);
        res.status(201).json({
            message: `${student.name} successfully enrolled in ${course.title}${universityId ? ' and assigned to university' : ''}`,
            enrollment,
            transactionId: txnId
        });
    } catch (error) {
        console.error('[AdminEnroll] CRITICAL ERROR:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to enroll student',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            UPDATE transactions 
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
        const updatedProfile = parseProfile(user.profile);
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
        const { bio, location, website, phone, personnel, faculty, youtubeUrl, videos, gallery, certificates, achievements, profileImage, coverImage, foundedYear } = req.body;
        const userRes = await query('SELECT role, bio, profile, profile_image FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        const updatedProfile = parseProfile(user.profile);
        const updatedBio = bio !== undefined ? bio : user.bio;
        const updatedProfileImage = profileImage !== undefined ? profileImage : user.profile_image;

        if (coverImage !== undefined) updatedProfile.coverImage = coverImage;
        updatedProfile.location = location !== undefined ? location : updatedProfile.location;
        updatedProfile.website = website !== undefined ? website : updatedProfile.website;
        updatedProfile.phone = phone !== undefined ? phone : updatedProfile.phone;
        updatedProfile.youtubeUrl = youtubeUrl !== undefined ? youtubeUrl : updatedProfile.youtubeUrl;
        updatedProfile.videos = videos !== undefined ? videos : updatedProfile.videos;
        updatedProfile.gallery = gallery !== undefined ? gallery : updatedProfile.gallery;
        updatedProfile.certificates = certificates !== undefined ? certificates : updatedProfile.certificates;
        updatedProfile.achievements = achievements !== undefined ? achievements : updatedProfile.achievements;
        updatedProfile.foundedYear = foundedYear !== undefined ? foundedYear : updatedProfile.foundedYear;
        if (personnel !== undefined) updatedProfile.personnel = personnel;
        if (faculty !== undefined) updatedProfile.faculty = faculty;


        const result = await query(`
            UPDATE users SET bio = $1, profile = $2, profile_image = $3, updated_at = NOW() WHERE id = $4
            RETURNING id, bio, profile, profile_image
        `, [updatedBio, JSON.stringify(updatedProfile), updatedProfileImage, req.params.id]);

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

// @desc    Upload university gallery images (multiple)
// @route   POST /api/admin/universities/:id/upload-gallery
// @access  Private (Admin)
const uploadUniversityGalleryImages = async (req, res) => {
    try {
        const userRes = await query('SELECT role, profile FROM users WHERE id = $1', [req.params.id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload images' });
        }

        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        const profile = parseProfile(user.profile);
        const currentGallery = profile.gallery || [];
        
        const updatedGallery = [...currentGallery, ...newImages];
        profile.gallery = updatedGallery;

        await query('UPDATE users SET profile = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(profile), req.params.id]);

        res.json({
            message: `${req.files.length} images added to gallery`,
            gallery: updatedGallery
        });
    } catch (error) {
        console.error('[uploadUniversityGalleryImages] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading gallery' });
    }
};

// @desc    Upload faculty photo for a specific faculty member
// @route   POST /api/admin/universities/:id/faculty/:index/upload-image
// @access  Private (Admin)
const uploadFacultyPhoto = async (req, res) => {
    try {
        const { id, index } = req.params;
        const userRes = await query('SELECT role, profile FROM users WHERE id = $1', [id]);
        const user = userRes.rows[0];

        if (!user || user.role !== 'university') {
            return res.status(404).json({ message: 'University not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        const profile = parseProfile(user.profile);
        
        if (!Array.isArray(profile.faculty)) {
            profile.faculty = [];
        }

        const idx = parseInt(index);
        if (isNaN(idx) || idx < 0 || idx >= profile.faculty.length) {
            // If it's a new faculty member or invalid index, we might just return the path
            // But usually we update an existing one. Let's return the path for the frontend to handle.
            return res.json({
                message: 'Faculty photo uploaded',
                imagePath: imagePath
            });
        }

        profile.faculty[idx].image = imagePath;

        await query('UPDATE users SET profile = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(profile), id]);

        res.json({
            message: 'Faculty photo updated',
            imagePath: imagePath,
            faculty: profile.faculty
        });
    } catch (error) {
        console.error('[uploadFacultyPhoto] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading faculty photo' });
    }
};



// Success Story Management

// @desc    Get all success stories
// @route   GET /api/admin/success-stories
// @access  Private (Admin)
async function getSuccessStories(req, res) {
    try {
        const storiesRes = await query('SELECT * FROM student_success_stories ORDER BY "order" ASC, created_at ASC');
        res.json(storiesRes.rows.map(s => ({ ...s, _id: s.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create success story
// @route   POST /api/admin/success-stories
// @access  Private (Admin)
async function createSuccessStory(req, res) {
    try {
        const { name, campus, package, role, image, story, video_url, order } = req.body;
        const crypto = require('crypto');
        const newId = crypto.randomUUID();
        const result = await query(`
            INSERT INTO student_success_stories (id, name, campus, package, role, image, story, video_url, "order", is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING *
        `, [newId, name, campus, package, role, image, story, video_url, order || 0]);

        res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update success story
// @route   PUT /api/admin/success-stories/:id
// @access  Private (Admin)
async function updateSuccessStory(req, res) {
    try {
        const { name, campus, package, role, image, story, video_url, order, isActive } = req.body;
        const result = await query(`
            UPDATE student_success_stories 
            SET name = COALESCE($1, name), campus = COALESCE($2, campus), package = COALESCE($3, package),
                role = COALESCE($4, role), image = COALESCE($5, image), story = COALESCE($6, story),
                video_url = COALESCE($7, video_url), "order" = COALESCE($8, "order"), 
                is_active = COALESCE($9, is_active), updated_at = NOW()
            WHERE id = $10 RETURNING *
        `, [name, campus, package, role, image, story, video_url, order, isActive, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Success story not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete success story
// @route   DELETE /api/admin/success-stories/:id
// @access  Private (Admin)
async function deleteSuccessStory(req, res) {
    try {
        const result = await query('DELETE FROM student_success_stories WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Success story not found' });
        }
        res.json({ message: 'Success story removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Upload success story image
// @route   POST /api/admin/success-stories/:id/upload
// @access  Private (Admin)
async function uploadSuccessStoryImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE student_success_stories SET image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [imageUrl, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Success story not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Upload success story video
// @route   POST /api/admin/success-stories/:id/upload-video
// @access  Private (Admin)
async function uploadSuccessStoryVideo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const videoUrl = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE student_success_stories SET video_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [videoUrl, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Success story not found' });
        }
        res.json({ ...result.rows[0], _id: result.rows[0].id, videoUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
// @access  Private (Admin)
const getAllPayouts = async (req, res) => {
    try {
        const payoutRes = await query(`
            SELECT p.*, p.id as _id, u.name as partner_name, u.email as partner_email
            FROM payouts p
            JOIN users u ON p.partner_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(payoutRes.rows);
    } catch (error) {
        console.error('[getAllPayouts] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payout status
// @route   PUT /api/admin/payouts/:id
// @access  Private (Admin)
const updatePayoutStatus = async (req, res) => {
    const { status, notes } = req.body;
    try {
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await query(`
            UPDATE payouts 
            SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [status, notes, req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payout request not found' });
        }

        const updatedPayout = result.rows[0];

        // Notify partner via WebSocket
        socketService.notifyUser(updatedPayout.partner_id, 'payout_status_updated', {
            id: updatedPayout.id,
            status: updatedPayout.status,
            amount: updatedPayout.amount
        });

        res.json({ success: true, message: `Payout status updated to ${status}`, payout: updatedPayout });
    } catch (error) {
        console.error('[updatePayoutStatus] Error:', error);
        res.status(500).json({ message: error.message });
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
    getStudentRewardPoints,
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
    getSuccessStories,
    createSuccessStory,
    updateSuccessStory,
    deleteSuccessStory,
    uploadSuccessStoryImage,
    uploadSuccessStoryVideo,
    uploadPartnerLogoImage,
    uploadDirectorImage,
    inviteUser,
    getUniversities,
    deleteUniversity,
    assignCoursesToUniversity,
    getUniversityDetail,
    adminEnrollStudent,
    adminUnenrollStudent,
    uploadUniversityProfileImage,
    uploadUniversityCoverImage,
    updateUniversityProfile,
    uploadUniversityGalleryImages,
    uploadFacultyPhoto,
    testNotification,
    getAllPayouts,
    updatePayoutStatus
};
