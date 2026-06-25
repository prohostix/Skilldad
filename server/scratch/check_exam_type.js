const { query } = require('./config/postgres');

async function check() {
    try {
        const res = await query("SELECT id, exam_type FROM exams WHERE id = 'exam_1774866428316'");
        console.log('Exam Data:', res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
