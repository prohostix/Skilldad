require('dotenv').config();
const { connectPostgres, query } = require('../config/postgres');

async function run() {
    const userId = 'user_1776939305674';
    try {
        await connectPostgres();
        
        const tables = [
            'enrollments',
            'submissions',
            'results',
            'exam_sessions',
            'transactions',
            'notifications',
            'support_tickets'
        ];

        console.log(`Checking dependencies for user: ${userId}`);
        
        for (const table of tables) {
            try {
                const res = await query(`SELECT count(*) FROM ${table} WHERE user_id = $1`, [userId]);
                console.log(`${table}: ${res.rows[0].count}`);
            } catch (e) {
                // Some tables might not exist or use different column name
                // console.log(`${table}: skip (${e.message})`);
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
