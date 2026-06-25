require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function run() {
    const userId = 'user_1776939305674';
    try {
        await connectPostgres();
        
        console.log(`Starting cleanup for user: ${userId}`);
        
        // Order matters to satisfy FKs
        const deletions = [
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
            { table: 'certificates', col: 'student_id' },
            { table: 'users', col: 'id' }
        ];

        for (const del of deletions) {
            try {
                const res = await query(`DELETE FROM ${del.table} WHERE ${del.col} = $1`, [userId]);
                if (res.rowCount > 0) {
                    console.log(`Deleted ${res.rowCount} rows from ${del.table}`);
                }
            } catch (e) {
                // console.log(`Failed to delete from ${del.table}: ${e.message}`);
            }
        }
        
        console.log("Cleanup complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
