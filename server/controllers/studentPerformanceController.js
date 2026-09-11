const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { query } = require('../config/postgres');

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// @desc    Record today's average-progress snapshot for the logged-in student
//          (upserts, so calling it more than once on the same day just
//          refreshes today's value rather than creating duplicate rows).
// @route   POST /api/students/performance/snapshot
// @access  Private (Student)
const recordDailySnapshot = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const progressRes = await query(
        `SELECT COALESCE(AVG(progress), 0) as avg_progress
         FROM enrollments
         WHERE student_id = $1 AND status != 'inactive'`,
        [studentId]
    );
    const avgProgress = Math.round(Number(progressRes.rows[0].avg_progress) || 0);

    await query(`
        INSERT INTO student_daily_performance (id, student_id, date, avg_progress, created_at, updated_at)
        VALUES ($1, $2, CURRENT_DATE, $3, NOW(), NOW())
        ON CONFLICT (student_id, date)
        DO UPDATE SET avg_progress = EXCLUDED.avg_progress, updated_at = NOW()
    `, [`sdp_${crypto.randomUUID()}`, studentId, avgProgress]);

    res.json({ success: true, avgProgress });
});

// @desc    Get the last 7 calendar days of the logged-in student's daily
//          performance snapshots, one point per day (Mon-Sun style labels).
//          Days with no snapshot yet carry forward the most recent known
//          value (or 0, before any snapshot exists at all) rather than
//          leaving a gap - this is a real, recorded value, just not from
//          that exact day.
// @route   GET /api/students/performance/weekly
// @access  Private (Student)
const getWeeklyPerformance = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const rowsRes = await query(
        `SELECT date, avg_progress FROM student_daily_performance
         WHERE student_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'
         ORDER BY date ASC`,
        [studentId]
    );
    const byDate = {};
    rowsRes.rows.forEach(r => {
        const key = new Date(r.date).toISOString().slice(0, 10);
        byDate[key] = Number(r.avg_progress);
    });

    // Earliest known value before the 7-day window, used to carry forward
    // into leading days that have no snapshot of their own yet.
    const priorRes = await query(
        `SELECT avg_progress FROM student_daily_performance
         WHERE student_id = $1 AND date < CURRENT_DATE - INTERVAL '6 days'
         ORDER BY date DESC LIMIT 1`,
        [studentId]
    );
    let carry = priorRes.rows.length > 0 ? Number(priorRes.rows[0].avg_progress) : 0;

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (byDate[key] !== undefined) carry = byDate[key];
        days.push({ name: WEEKDAY_LABELS[d.getDay()], date: key, value: carry });
    }

    res.json(days);
});

module.exports = { recordDailySnapshot, getWeeklyPerformance };
