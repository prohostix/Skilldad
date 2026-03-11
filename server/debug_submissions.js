const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pgPool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: process.env.PGSSL_CERT_PATH ? {
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(__dirname, process.env.PGSSL_CERT_PATH)).toString(),
    } : false
});

async function checkSubmissions() {
    try {
        const res = await pgPool.query(`
            SELECT id, exam_id, student_id, status, obtained_marks, percentage 
            FROM exam_submissions_new 
            LIMIT 20
        `);
        console.log('Recent Submissions:');
        console.table(res.rows);
        if (res.rows.length > 0) {
            console.log('\nTypes of first row:');
            console.log('obtained_marks:', typeof res.rows[0].obtained_marks);
            console.log('percentage:', typeof res.rows[0].percentage);
        }
        
        const statsRes = await pgPool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(percentage) as with_percentage,
                AVG(percentage::numeric) as avg_percentage
            FROM exam_submissions_new
            WHERE status IN ('graded', 'submitted')
        `);
        console.log('\nOverall Stats:');
        console.table(statsRes.rows);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkSubmissions();
