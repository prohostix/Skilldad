const { query } = require('../config/postgres');
const socketService = require('../services/SocketService');
const bcrypt = require('bcryptjs');

// @desc    Get Partner Dashboard Stats
const getPartnerStats = async (req, res) => {
    try {
        const partnerId = req.user.id || req.user._id;

        // 1. Get partner's commission rate (discount_rate column in users table)
        const userRes = await query('SELECT discount_rate FROM users WHERE id = $1', [partnerId]);
        const commissionRate = (parseFloat(userRes.rows[0]?.discount_rate) || 15) / 100;

        // 2. Calculate Lifetime Earnings
        // We sum up (course price * commission rate) for all enrollments of students referred by this partner
        const earningsRes = await query(`
            SELECT SUM(CAST(c.price AS NUMERIC) * $2) as total_earned
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE (u.registered_by = $1 OR u.partner_code IN (SELECT code FROM discounts WHERE partner_id = $1))
            AND u.role = 'student'
        `, [partnerId, commissionRate]);

        const lifetimeEarnings = Math.round(parseFloat(earningsRes.rows[0]?.total_earned || 0));

        // 3. Get total payouts (Pending + Approved)
        const payoutRes = await query(`
            SELECT SUM(CAST(amount AS NUMERIC)) as total_payouts 
            FROM payouts 
            WHERE partner_id = $1 AND status != 'rejected'
        `, [partnerId]);

        const totalPayouts = Math.round(parseFloat(payoutRes.rows[0]?.total_payouts || 0));

        // 4. Current Withdrawable Balance
        const withdrawableBalance = Math.max(0, lifetimeEarnings - totalPayouts);

        // 5. Basic stats
        const discRes = await query('SELECT * FROM discounts WHERE partner_id = $1', [partnerId]);
        const totalCodes = discRes.rows.length;
        const totalRedemptions = discRes.rows.reduce((acc, curr) => acc + (parseInt(curr.used_count) || 0), 0);

        res.json({ 
            totalCodes, 
            totalRedemptions, 
            totalEarnings: withdrawableBalance, // Shown in "Available for Withdrawal"
            lifetimeEarnings,
            totalPayouts,
            commissionRate: commissionRate * 100
        });
    } catch (error) {
        console.error('[getPartnerStats] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new Discount Code
const createDiscount = async (req, res) => {
    const { code, value, percentage, type = 'percentage' } = req.body;
    try {
        const id = `disc_${Date.now()}`;
        await query(`
            INSERT INTO discounts (id, code, value, type, partner_id, active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        `, [id, code.toUpperCase(), value || percentage, type, req.user.id || req.user._id]);

        res.status(201).json({ success: true, id, code: code.toUpperCase() });
    } catch (error) {
        res.status(400).json({ message: 'Code already exists or invalid data' });
    }
};

// @desc    Get all discounts for the partner
const getDiscounts = async (req, res) => {
    try {
        const discRes = await query(`
            SELECT * FROM discounts 
            WHERE partner_id = $1 OR partner_id IS NULL
            ORDER BY created_at DESC
        `, [req.user.id || req.user._id]);
        res.json(discRes.rows.map(r => ({ ...r, _id: r.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a student by Partner
const registerStudent = async (req, res) => {
    const { name, email, password, phone, partnerCode, course, courses, university } = req.body;
    try {
        const userExists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${Date.now()}`;

        await query(`
            INSERT INTO users (id, name, email, password, role, registered_by, partner_code, university_id, is_verified, profile, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, true, $8, NOW(), NOW())
        `, [
            userId, 
            name, 
            email, 
            hashedPassword, 
            'student',
            req.user.id || req.user._id, 
            partnerCode?.toUpperCase(), 
            university || null,
            JSON.stringify({ phone: phone || '' })
        ]);

        // Support both single and multiple course enrollments
        const coursesToEnroll = courses && Array.isArray(courses) ? courses : (course ? [course] : []);
        
        for (const courseId of coursesToEnroll) {
            const enrollId = `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await query(`
                INSERT INTO enrollments (id, student_id, course_id, status, progress, created_at, updated_at)
                VALUES ($1, $2, $3, 'active', 0, NOW(), NOW())
            `, [enrollId, userId, courseId]);
        }

        // Background Notifications
        setImmediate(async () => {
            try {
                const notificationService = require('../services/NotificationService');
                const student = { id: userId, name, email, phone };
                
                // 1. Welcome Message
                await notificationService.send(student, 'welcome').catch(e => console.error('[PartnerReg] Welcome notify failed:', e.message));

                // 2. Enrollment Messages
                if (coursesToEnroll.length > 0) {
                    const coursesRes = await query('SELECT title FROM courses WHERE id = ANY($1)', [coursesToEnroll]);
                    for (const c of coursesRes.rows) {
                        await notificationService.send(student, 'enrollment', { 
                            courseTitle: c.title, 
                            enrolledBy: req.user.name 
                        }).catch(e => console.error(`[PartnerReg] Enroll notify failed for ${c.title}:`, e.message));
                    }
                }
            } catch (err) {
                console.error('[PartnerReg] Notification sequence failed:', err.message);
            }
        });

        res.status(201).json({ success: true, message: 'Student registered and enrolled successfully' });
    } catch (error) {
        console.error('[registerStudent] error:', error);
        res.status(500).json({ message: error.message || 'Error registering student' });
    }
};

// @desc    Get all students enrolled through this partner
const getPartnerStudents = async (req, res) => {
    try {
        const partnerId = req.user.id || req.user._id;
        // Fetch students directly registered by the partner OR who used one of the partner's codes
        const studentsRes = await query(`
            SELECT 
                u.id as _id, u.name, u.email, u.profile, u.partner_code, u.created_at,
                (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) as enrollments_count
            FROM users u
            WHERE (u.registered_by = $1 OR u.partner_code IN (SELECT code FROM discounts WHERE partner_id = $1))
            AND u.role = 'student'
            ORDER BY u.created_at DESC
        `, [partnerId]);

        res.json(studentsRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payout history for the partner
const getPayoutHistory = async (req, res) => {
    try {
        const partnerId = req.user.id || req.user._id;
        const payoutRes = await query(`
            SELECT *, id as _id FROM payouts 
            WHERE partner_id = $1 
            ORDER BY created_at DESC
        `, [partnerId]);
        res.json(payoutRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a new payout
const requestPayout = async (req, res) => {
    const { amount, notes } = req.body;
    const partnerId = req.user.id || req.user._id;

    try {
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        // Calculate current withdrawable balance
        const userRes = await query('SELECT discount_rate FROM users WHERE id = $1', [partnerId]);
        const commissionRate = (parseFloat(userRes.rows[0]?.discount_rate) || 15) / 100;

        const earningsRes = await query(`
            SELECT SUM(CAST(c.price AS NUMERIC) * $2) as total_earned
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE (u.registered_by = $1 OR u.partner_code IN (SELECT code FROM discounts WHERE partner_id = $1))
            AND u.role = 'student'
        `, [partnerId, commissionRate]);

        const lifetimeEarnings = Math.round(parseFloat(earningsRes.rows[0]?.total_earned || 0));

        const payoutRes = await query(`
            SELECT SUM(CAST(amount AS NUMERIC)) as total_payouts 
            FROM payouts 
            WHERE partner_id = $1 AND status != 'rejected'
        `, [partnerId]);

        const totalPayouts = Math.round(parseFloat(payoutRes.rows[0]?.total_payouts || 0));
        const withdrawableBalance = Math.max(0, lifetimeEarnings - totalPayouts);

        if (amount > withdrawableBalance) {
            return res.status(400).json({ 
                message: `Insufficient balance. Max withdrawable: ₹${withdrawableBalance.toLocaleString()}` 
            });
        }

        const id = `payout_${Date.now()}`;
        await query(`
            INSERT INTO payouts (id, partner_id, amount, status, notes, created_at, updated_at)
            VALUES ($1, $2, $3, 'pending', $4, NOW(), NOW())
        `, [id, partnerId, amount, notes || 'Payout request from dashboard']);

        res.status(201).json({ success: true, message: 'Payout request submitted successfully' });
    } catch (error) {
        console.error('[requestPayout] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a partner student
const deletePartnerStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const checkRes = await query(`
            SELECT id FROM users 
            WHERE id = $1 AND (registered_by = $2 OR partner_code IN (SELECT code FROM discounts WHERE partner_id = $2))
        `, [id, req.user.id]);
        
        if (checkRes.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized to delete this student' });
        }

        await query('DELETE FROM enrollments WHERE student_id = $1', [id]);
        await query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPartnerStats,
    createDiscount,
    getDiscounts,
    registerStudent,
    requestPayout,
    getPartnerStudents,
    getPayoutHistory,
    deletePartnerStudent
};
