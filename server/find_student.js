require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');
const fs = require('fs');

async function check() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        const res = await query("SELECT id, name FROM users WHERE name ILIKE '%risna%'");
        console.log(JSON.stringify(res.rows, null, 2));
        
        // Also look for course Cloud Computing
        const courseRes = await query("SELECT id, title FROM courses WHERE title ILIKE '%Cloud Computing%'");
        console.log(JSON.stringify(courseRes.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
