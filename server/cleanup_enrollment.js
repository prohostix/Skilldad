require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        
        const studentRes = await query("SELECT id, name FROM users WHERE name ILIKE '%rinsna%'");
        const studentId = studentRes.rows[0].id;
        
        const courseRes = await query("SELECT id, title FROM courses WHERE title ILIKE '%Cloud Computing%'");
        const courseId = courseRes.rows[0].id;

        console.log('Cleaning up Progress...');
        await query("DELETE FROM progress WHERE user_id = $1 AND course_id = $2", [studentId, courseId]);
        
        console.log('Cleaning up Transactions...');
        await query("DELETE FROM transactions WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        
        console.log('Cleanup complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
