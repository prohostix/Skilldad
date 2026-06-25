require('dotenv').config();
const { connectPostgres, query } = require('./config/postgres');

async function checkQuestions() {
    try {
        await connectPostgres();
        const questionsRes = await query('SELECT * FROM questions LIMIT 5');
        console.log('--- QUESTIONS DETAIL ---');
        questionsRes.rows.forEach(q => {
            console.log(`ID: ${q.id}`);
            console.log(`Question: ${q.question_text}`);
            const opts = q.options;
            console.log(`Options (raw):`, opts);
            if (Array.isArray(opts)) {
                opts.forEach((o, i) => {
                    console.log(`  Option ${i}: isCorrect=${o.isCorrect}, type=${typeof o.isCorrect}`);
                });
            }
            console.log('-------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkQuestions();
