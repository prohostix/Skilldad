const { query } = require('../config/postgres');
const socketService = require('../services/SocketService');
const bcrypt = require('bcryptjs');

// @desc    Get Partner Dashboard Stats
const getPartnerStats = async (req, res) => {
    try {
        const discRes = await query('SELECT * FROM discounts WHERE partner_id = $1', [req.user.id]);
        const totalCodes = discRes.rows.length;
        const totalRedemptions = discRes.rows.reduce((acc, curr) => acc + (curr.used_count || 0), 0);
        const totalEarnings = totalRedemptions * 10;

        res.json({ totalCodes, totalRedemptions, totalEarnings });
    } catch (error) {
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
        `, [id, code.toUpperCase(), value || percentage, type, req.user.id]);

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
        `, [req.user.id]);
        res.json(discRes.rows.map(r => ({ ...r, _id: r.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a student by Partner
const registerStudent = async (req, res) => {
    const { name, email, password, phone, partnerCode, course, university } = req.body;
    try {
        const userExists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${Date.now()}`;

        await query(`
            INSERT INTO users (id, name, email, password, role, registered_by, partner_code, "universityId", is_verified, created_at, updated_at)
            VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, true, NOW(), NOW())
        `, [userId, name, email, hashedPassword, req.user.id, partnerCode?.toUpperCase(), university || null]);

        if (course) {
            const enrollId = `enroll_${Date.now()}`;
            await query(`
                INSERT INTO enrollments (id, student_id, course_id, status, created_at, updated_at)
                VALUES ($1, $2, $3, 'active', NOW(), NOW())
            `, [enrollId, userId, course]);
        }

        res.status(201).json({ success: true, message: 'Student registered' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students enrolled through this partner
const getPartnerStudents = async (req, res) => {
    try {
        // Fetch students directly registered by the partner OR who used one of the partner's codes
        const studentsRes = await query(`
            SELECT 
                u.id as _id, u.name, u.email, u.profile, u.partner_code, u.created_at,
                (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) as enrollments_count
            FROM users u
            WHERE (u.registered_by = $1 OR u.partner_code IN (SELECT code FROM discounts WHERE partner_id = $1))
            AND u.role = 'student'
            ORDER BY u.created_at DESC
        `, [req.user.id]);

        // Enrich with progress data if needed (simplified for now)
        res.json(studentsRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payout history for the partner
const getPayoutHistory = async (req, res) => {
    try {
        const payoutRes = await query(`
            SELECT * FROM payouts 
            WHERE partner_id = $1 
            ORDER BY created_at DESC
        `, [req.user.id]);
        res.json(payoutRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a new payout
const requestPayout = async (req, res) => {
    const { amount, method = 'bank_transfer' } = req.body;
    try {
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const id = `payout_${Date.now()}`;
        await query(`
            INSERT INTO payouts (id, partner_id, amount, status, method, created_at, updated_at)
            VALUES ($1, $2, $3, 'pending', $4, NOW(), NOW())
        `, [id, req.user.id, amount, method]);

        res.status(201).json({ success: true, message: 'Payout request submitted' });
    } catch (error) {
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
    getPayoutHistory
};
