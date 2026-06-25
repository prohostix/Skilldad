require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const result = await query(`
            SELECT id, topic, course_id, university_id, created_at 
            FROM live_sessions 
            ORDER BY created_at DESC LIMIT 5
        `);
        console.log('Recent Live Sessions:');
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
