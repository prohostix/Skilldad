const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectPostgres, query } = require('./config/postgres');

async function check() {
    try {
        await connectPostgres();
        const res = await query('SELECT * FROM exams WHERE id = $1', ['exam_1773126159808']);
        const exam = res.rows[0];

        if (!exam) {
            console.log('EXAM NOT FOUND');
            const allExams = await query('SELECT id, title FROM exams LIMIT 5');
            console.log('SOME EXAMS:', allExams.rows);
            process.exit(1);
        }

        console.log('EXAM:', JSON.stringify(exam, null, 2));

        // Check enrollment
        const enrollmentRes = await query('SELECT * FROM enrollments WHERE course_id = $1', [exam.course_id]);
        console.log('ENROLLMENTS:', enrollmentRes.rows.length);
        if (enrollmentRes.rows.length > 0) {
            console.log('FIRST ENROLLMENT:', JSON.stringify(enrollmentRes.rows[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
