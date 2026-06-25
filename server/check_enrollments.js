require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const result = await query(`
            SELECT u.name, e.course_id, c.title as course_title
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            JOIN courses c ON e.course_id = c.id
            WHERE u.name ILIKE '%rinsna%' OR u.name ILIKE '%nidha%'
        `);
        console.log('Student Enrollments:');
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

check();
