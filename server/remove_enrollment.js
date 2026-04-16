require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        console.log('Postgres initialized');
        const studentRes = await query("SELECT id, name FROM users WHERE name ILIKE '%rinsna%'");
        if (studentRes.rows.length === 0) {
            console.log('Student not found');
            process.exit(1);
        }
        const studentId = studentRes.rows[0].id;
        console.log('Student:', studentRes.rows[0].name, '(', studentId, ')');

        const courseRes = await query("SELECT id, title FROM courses WHERE title ILIKE '%Cloud Computing%'");
        if (courseRes.rows.length === 0) {
            console.log('Course not found');
            process.exit(1);
        }
        const courseId = courseRes.rows[0].id;
        console.log('Course:', courseRes.rows[0].title, '(', courseId, ')');

        const enrollmentRes = await query("SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
        if (enrollmentRes.rows.length > 0) {
            console.log('Enrollment found, deleting...');
            await query("DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2", [studentId, courseId]);
            console.log('Enrollment deleted successfully');
        } else {
            console.log('Enrollment not found');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
