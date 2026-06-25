require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function checkExams() {
    try {
        await connectPostgres();
        const examsRes = await query('SELECT id, title FROM exams');
        console.log('--- EXAMS ---');
        console.table(examsRes.rows);

        const questionsRes = await query('SELECT id, exam_id, question_text FROM questions');
        console.log('\n--- QUESTIONS ---');
        console.table(questionsRes.rows);

        const countsRes = await query('SELECT exam_id, COUNT(*) as q_count FROM questions GROUP BY exam_id');
        console.log('\n--- QUESTION COUNTS PER EXAM ---');
        console.table(countsRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkExams();
