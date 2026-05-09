const { query } = require('../config/postgres');
const crypto = require('crypto');

const POINTS_PER_REFERRAL = 100;
const WELCOME_POINTS = 50;

const generateCode = (userId) => {
    const hash = crypto.createHash('sha256').update(`${userId}-skilldad`).digest('hex');
    return `SKD-${hash.slice(0, 8).toUpperCase()}`;
};

/**
 * GET /api/referrals/my-code
 */
const getMyReferralCode = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        if (!userId) return res.status(401).json({ message: 'User not found' });

        let result = await query('SELECT code FROM referral_codes WHERE user_id = $1', [String(userId)]);

        if (result.rows.length === 0) {
            const code = generateCode(String(userId));
            result = await query(
                `INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)
                 ON CONFLICT (user_id) DO UPDATE SET code = referral_codes.code
                 RETURNING code`,
                [String(userId), code]
            );
        }

        const code = result.rows[0].code;
        const baseUrl = process.env.CLIENT_URL || 'https://skilldad.com';
        const link = `${baseUrl}/register?ref=${code}`;

        res.json({ code, link });
    } catch (error) {
        console.error('[Referral] getMyReferralCode error:', error.message);
        res.status(500).json({ message: 'Failed to get referral code', error: error.message });
    }
};

/**
 * GET /api/referrals/my-referrals
 */
const getMyReferrals = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await query(`
            SELECT r.id, r.points_awarded, r.created_at,
                   u.name AS referred_name, u.email AS referred_email
            FROM referrals r
            JOIN users u ON u.id = r.referred_id
            WHERE r.referrer_id = $1
            ORDER BY r.created_at DESC
        `, [String(userId)]);
        res.json(result.rows);
    } catch (error) {
        console.error('[Referral] getMyReferrals error:', error.message);
        res.status(500).json({ message: 'Failed to fetch referrals' });
    }
};

/**
 * GET /api/referrals/my-points
 */
const getMyRewardPoints = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const [totalRes, historyRes] = await Promise.all([
            query('SELECT COALESCE(SUM(points), 0) AS total FROM reward_points WHERE user_id = $1', [String(userId)]),
            query('SELECT points, reason, reference_name, created_at FROM reward_points WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [String(userId)])
        ]);
        res.json({
            total: parseInt(totalRes.rows[0].total, 10),
            history: historyRes.rows
        });
    } catch (error) {
        console.error('[Referral] getMyRewardPoints error:', error.message);
        res.status(500).json({ message: 'Failed to fetch reward points' });
    }
};

/**
 * POST /api/referrals/apply
 * Body: { code }
 */
const applyReferralCode = async (req, res) => {
    try {
        const { code } = req.body;
        const referredId = String(req.user.id || req.user._id);

        if (!code) return res.status(400).json({ message: 'Referral code is required' });

        const codeRes = await query('SELECT user_id FROM referral_codes WHERE code = $1', [code.trim().toUpperCase()]);
        if (codeRes.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        const referrerId = codeRes.rows[0].user_id;

        if (referrerId === referredId) {
            return res.status(400).json({ message: 'You cannot use your own referral code' });
        }

        const existing = await query('SELECT id FROM referrals WHERE referred_id = $1', [referredId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'A referral code has already been applied to your account' });
        }

        await query('BEGIN');
        await query(
            'INSERT INTO referrals (referrer_id, referred_id, code_used, points_awarded) VALUES ($1, $2, $3, $4)',
            [referrerId, referredId, code, POINTS_PER_REFERRAL]
        );
        await query(
            'INSERT INTO reward_points (user_id, points, reason, reference_name) VALUES ($1, $2, $3, $4)',
            [referrerId, POINTS_PER_REFERRAL, `Referral bonus: ${req.user.name || req.user.email} joined via your code`, req.user.name || req.user.email]
        );
        await query(
            'INSERT INTO reward_points (user_id, points, reason) VALUES ($1, $2, $3)',
            [referredId, WELCOME_POINTS, `Welcome bonus for joining via referral code ${code}`]
        );
        await query('COMMIT');

        res.json({ message: 'Referral applied successfully', pointsEarned: WELCOME_POINTS });
    } catch (error) {
        await query('ROLLBACK').catch(() => {});
        console.error('[Referral] applyReferralCode error:', error.message);
        res.status(500).json({ message: 'Failed to apply referral code' });
    }
};

module.exports = { getMyReferralCode, getMyReferrals, getMyRewardPoints, applyReferralCode };
