const { query } = require('../config/postgres');
const socketService = require('../services/SocketService');
const whatsAppService = require('../services/WhatsAppService');

// @desc    Get Global Finance Stats
const getFinanceStats = async (req, res) => {
    try {
        // Calculate total revenue from approved manual payments
        const manualRevenueRes = await query("SELECT SUM(amount) as total FROM payments WHERE status = 'approved'");
        const manualRevenue = parseFloat(manualRevenueRes.rows[0].total) || 0;

        // Calculate total revenue from successful gateway transactions
        const gatewayRevenueRes = await query("SELECT SUM(CAST(final_amount AS NUMERIC)) as total FROM transactions WHERE status = 'success'");
        const gatewayRevenue = parseFloat(gatewayRevenueRes.rows[0].total) || 0;

        const totalRevenue = manualRevenue + gatewayRevenue;

        // Get pending payouts
        const pendingPayoutsRes = await query(`
            SELECT p.*, p.id as _id, u.name as partner_name, u.email as partner_email
            FROM payouts p
            JOIN users u ON p.partner_id = u.id
            WHERE p.status = 'pending'
        `);

        // Get approved payouts (limit 10)
        const approvedPayoutsRes = await query(`
            SELECT p.*, p.id as _id, u.name as partner_name, u.email as partner_email
            FROM payouts p
            JOIN users u ON p.partner_id = u.id
            WHERE p.status = 'approved'
            ORDER BY p.payout_date DESC
            LIMIT 10
        `);

        // Calculate total payouts amount
        const totalPayoutsAmountRes = await query("SELECT SUM(amount) as total FROM payouts WHERE status = 'approved'");

        // Get payment counts
        const pendingPaymentsCountRes = await query("SELECT COUNT(*) FROM payments WHERE status = 'pending'");
        const approvedPaymentsCountRes = await query("SELECT COUNT(*) FROM payments WHERE status = 'approved'");

        // Get gateway success count
        const gatewaySuccessCountRes = await query("SELECT COUNT(*) FROM transactions WHERE status = 'success'");

        const totalEnrollmentsRes = await query("SELECT COUNT(*) FROM enrollments");

        res.json({
            totalRevenue,
            manualRevenue,
            gatewayRevenue,
            pendingPayouts: pendingPayoutsRes.rows,
            approvedPayouts: approvedPayoutsRes.rows,
            approvedPayoutsCount: approvedPayoutsRes.rows.length,
            totalPayoutsAmount: parseFloat(totalPayoutsAmountRes.rows[0].total) || 0,
            pendingPaymentsCount: parseInt(pendingPaymentsCountRes.rows[0].count),
            approvedPaymentsCount: parseInt(approvedPaymentsCountRes.rows[0].count) + parseInt(gatewaySuccessCountRes.rows[0].count),
            totalEnrollments: parseInt(totalEnrollmentsRes.rows[0].count),
        });
    } catch (error) {
        console.error('Error in getFinanceStats (PG):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all student payments with filters
const getStudentPayments = async (req, res) => {
    try {
        const { status, partner, search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Simplified query for manual payments
        let manualSql = `
            SELECT p.*, s.name as student_name, s.email as student_email, c.title as course_title, c.price as course_price, u.name as partner_name
            FROM payments p
            JOIN users s ON p.student_id = s.id
            JOIN courses c ON p.course_id = c.id
            LEFT JOIN users u ON p.partner_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            manualSql += ` AND p.status = $${params.length + 1}`;
            params.push(status);
        }

        const manualRes = await query(manualSql, params);

        // Similar for gateway transactions (omitted some search logic for brevity)
        const gatewayRes = await query(`
            SELECT t.*, s.name as student_name, s.email as student_email, c.title as course_title, c.price as course_price
            FROM transactions t
            JOIN users s ON t.student_id = s.id
            JOIN courses c ON t.course_id = c.id
            WHERE t.status IN ('success', 'pending', 'failed')
        `);

        const allPayments = [
            ...manualRes.rows.map(r => ({ ...r, _id: r.id, isGateway: false })),
            ...gatewayRes.rows.map(r => {
                const isManual = r.transaction_id?.startsWith('MAN-');
                return {
                    ...r,
                    _id: r.id,
                    amount: parseFloat(r.final_amount),
                    status: r.status === 'success' ? 'approved' : r.status === 'failed' ? 'rejected' : 'pending',
                    isGateway: !isManual,
                    isManual: isManual,
                    student: { name: r.student_name, email: r.student_email },
                    course: { title: r.course_title, price: r.course_price }
                };
            })
        ];

        allPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const paginated = allPayments.slice(offset, offset + limit);

        res.json({
            payments: paginated,
            pagination: {
                total: allPayments.length,
                page: parseInt(page),
                pages: Math.ceil(allPayments.length / limit)
            }
        });
    } catch (error) {
        console.error('Error in getStudentPayments (PG):', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject Student Payment
const updatePaymentStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;
        const isManualTxn = id.startsWith('MAN-');
        const tableName = isManualTxn ? 'transactions' : 'payments';
        const idColumn = isManualTxn ? 'transaction_id' : 'id';

        let payment;
        if (isManualTxn) {
            const transRes = await query(`
                SELECT t.*, s.name as student_name, s.email as student_email, c.title as course_title, t.transaction_id as id
                FROM transactions t
                JOIN users s ON t.student_id = s.id
                JOIN courses c ON t.course_id = c.id
                WHERE t.transaction_id = $1
            `, [id]);
            payment = transRes.rows[0];
        } else {
            const paymentRes = await query(`
                SELECT p.*, s.name as student_name, s.email as student_email, c.title as course_title
                FROM payments p
                JOIN users s ON p.student_id = s.id
                JOIN courses c ON p.course_id = c.id
                WHERE p.id = $1
            `, [id]);
            payment = paymentRes.rows[0];
        }

        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        await query(`
            UPDATE ${tableName} 
            SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = NOW() 
            WHERE ${idColumn} = $4
        `, [status, notes, req.user.id, id]);

        if (status === 'approved') {
            const enrollId = `enroll_${Date.now()}`;
            await query(`
                INSERT INTO enrollments (id, student_id, course_id, status, created_at, updated_at)
                VALUES ($1, $2, $3, 'active', NOW(), NOW())
                ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active'
            `, [enrollId, payment.student_id, payment.course_id]);

            // Notify student via socket
            socketService.sendToUser(payment.student_id, 'notification', {
                type: 'payment_approved',
                title: 'Payment Approved',
                message: `Your payment for ${payment.course_title} has been approved.`,
                courseId: payment.course_id
            });
        }

        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject Payout
const approvePayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid payout status' });
        }

        const result = await query(
            `UPDATE payouts 
             SET status = $1, reviewed_by = $2, reviewed_at = NOW(), payout_date = CASE WHEN $1 = 'approved' THEN NOW() ELSE payout_date END
             WHERE id = $3 RETURNING *`,
            [status, req.user.id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payout record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in approvePayout:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payout History for Admin/Finance
const getPayoutHistory = async (req, res) => {
    try {
        const { status, partnerId } = req.query;
        let sql = `
            SELECT p.*, p.id as _id, u.name as partner_name, u.email as partner_email
            FROM payouts p
            JOIN users u ON p.partner_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND p.status = $${params.length + 1}`;
            params.push(status);
        }

        if (partnerId) {
            sql += ` AND p.partner_id = $${params.length + 1}`;
            params.push(partnerId);
        }

        sql += ` ORDER BY p.created_at DESC`;

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getPayoutHistory:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Partners for Finance filtering
const getFinancePartners = async (req, res) => {
    try {
        const result = await query(`
            SELECT DISTINCT u.id, u.name, u.email 
            FROM users u
            JOIN payouts p ON u.id = p.partner_id
            WHERE u.role = 'partner'
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFinanceStats,
    getStudentPayments,
    updatePaymentStatus,
    getEnrollmentSummaries: async (req, res) => res.json([]),
    approvePayout,
    getPayoutHistory,
    exportReport: async (req, res) => res.json({}),
    getFinancePartners
};
