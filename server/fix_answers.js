const { connectPostgres, query } = require('./config/postgres');
require('dotenv').config();

async function fixOldAnswers() {
    try {
        await connectPostgres();
        const res = await query("SELECT id, answers FROM exam_submissions_new WHERE answers IS NOT NULL");

        let count = 0;
        for (const sub of res.rows) {
            let answers = sub.answers;
            if (typeof answers === 'string') {
                answers = JSON.parse(answers);
            }
            if (!Array.isArray(answers)) continue;

            let changed = false;
            const newAnswers = answers.map(ans => {
                let mod = { ...ans };
                if (ans.answer !== undefined && ans.textAnswer === undefined && ans.selectedOption === undefined) {
                    changed = true;
                    // Try to guess if MCQ or Descriptive based on answer type
                    if (typeof ans.answer === 'number') {
                        mod.questionType = 'mcq';
                        mod.selectedOption = ans.answer;
                    } else if (typeof ans.answer === 'string') {
                        mod.questionType = 'descriptive';
                        mod.textAnswer = ans.answer;
                    }
                }
                return mod;
            });

            if (changed) {
                await query("UPDATE exam_submissions_new SET answers = $1 WHERE id = $2", [JSON.stringify(newAnswers), sub.id]);
                count++;
            }
        }
        console.log(`Updated ${count} legacy submissions.`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
fixOldAnswers();
