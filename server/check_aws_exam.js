require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function checkAwsExam() {
    try {
        await connectPostgres();
        
        const res = await query(`
            SELECT id, title, exam_type, linked_paper_id 
            FROM exams 
            WHERE title ILIKE '%aws exam%'
        `);
        console.log('--- AWS EXAM DATA ---');
        console.table(res.rows);

        if (res.rows.length > 0) {
            const examId = res.rows[0].id;
            const qRes = await query('SELECT id, question_text FROM questions WHERE exam_id = $1', [examId]);
            console.log(`--- QUESTIONS FOR ${examId} ---`);
            console.table(qRes.rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkAwsExam();
