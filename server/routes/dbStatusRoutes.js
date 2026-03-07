const express = require('express');
const router = express.Router();
const { getPool } = require('../config/postgres');

// Check PostgreSQL connection status and counts
router.get('/postgres-status', async (req, res) => {
    try {
        const pool = getPool();
        if (!pool) {
            return res.status(503).json({ success: false, message: 'PostgreSQL pool not initialized' });
        }

        const stats = {};
        const tables = ['users', 'courses', 'enrollments', 'exams', 'exam_submissions_new'];

        for (const table of tables) {
            const tableRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            stats[table] = parseInt(tableRes.rows[0].count);
        }

        const dbTimeRes = await pool.query('SELECT NOW()');

        res.json({
            success: true,
            database: 'PostgreSQL (RDS)',
            status: 'Connected',
            serverTime: dbTimeRes.rows[0].now,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
