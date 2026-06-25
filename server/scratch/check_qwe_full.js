require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function run() {
    const userId = 'user_1776939305674';
    try {
        await connectPostgres();
        
        const checks = [
            { table: 'enrollments', col: 'student_id' },
            { table: 'submissions', col: 'user_id' },
            { table: 'projects', col: 'student_id' },
            { table: 'payments', col: 'student_id' },
            { table: 'results', col: 'student_id' },
            { table: 'support_tickets', col: 'user_id' },
            { table: 'reward_points', col: 'user_id' },
            { table: 'referrals', col: 'referrer_id' },
            { table: 'referrals', col: 'referred_id' },
            { table: 'referral_codes', col: 'user_id' },
            { table: 'certificates', col: 'student_id' }
        ];

        console.log(`Checking rows for user: ${userId}`);
        
        for (const check of checks) {
            try {
                const res = await query(`SELECT count(*) FROM ${check.table} WHERE ${check.col} = $1`, [userId]);
                if (res.rows[0].count > 0) {
                    console.log(`${check.table} (${check.col}): ${res.rows[0].count}`);
                }
            } catch (e) {
                // Ignore if table/column doesn't exist
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
