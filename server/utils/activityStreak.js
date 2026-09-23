const { query } = require('../config/postgres');

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// Records real learning activity (video/module progress, exam submission, project
// submission) toward the student's daily streak. Idempotent per calendar day - calling
// this multiple times in the same day (e.g. finishing several videos) only counts once.
// Never throws: a streak-recording failure must never break the real request it rides on.
const recordDailyActivity = async (userId) => {
    try {
        const res = await query(
            'SELECT last_streak_date, current_streak, longest_streak FROM users WHERE id = $1',
            [userId]
        );
        const row = res.rows[0];
        if (!row) return;

        const today = todayStr();
        if (row.last_streak_date === today) return;

        const newStreak = row.last_streak_date === yesterdayStr()
            ? (row.current_streak || 0) + 1
            : 1;
        const newLongest = Math.max(newStreak, row.longest_streak || 0);

        await query(
            'UPDATE users SET current_streak = $1, longest_streak = $2, last_streak_date = $3 WHERE id = $4',
            [newStreak, newLongest, today, userId]
        );
    } catch (err) {
        console.error('[Streak] Failed to record daily activity:', err.message);
    }
};

module.exports = { recordDailyActivity };
