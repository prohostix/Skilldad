const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const examId = 'exam_1773126159808';

        const subs = await query('SELECT * FROM exam_submissions_new WHERE exam_id = $1', [examId]);
        console.log('SUBMISSIONS:', subs.rows);

        // Check if the student who is trying to start is actually enrolled
        // Let's find the student from the logs... wait, I don't have the ID from logs.
        // I'll just check all active enrollments for this course.
        const examRes = await query('SELECT course_id FROM exams WHERE id = $1', [examId]);
        const courseId = examRes.rows[0].course_id;
        const enrolls = await query('SELECT student_id, status FROM enrollments WHERE course_id = $1', [courseId]);
        console.log('ENROLLMENTS:', enrolls.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
