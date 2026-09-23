const { query } = require('../config/postgres');

// Awards real reward points for a genuine student action (watching a lesson video,
// completing an exercise, etc.), recorded in the same `reward_points` table the
// referral system already uses. Never throws - a points-awarding failure must
// never break the real request (progress update, submission, ...) it rides on.
const awardPoints = async (userId, points, reason, referenceName = null) => {
    try {
        await query(
            'INSERT INTO reward_points (user_id, points, reason, reference_name) VALUES ($1, $2, $3, $4)',
            [String(userId), points, reason, referenceName]
        );
    } catch (err) {
        console.error('[Points] Failed to award points:', err.message);
    }
};

module.exports = { awardPoints };
