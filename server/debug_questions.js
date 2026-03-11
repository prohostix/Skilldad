const { connectPostgres, query } = require('./config/postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
  try {
    await connectPostgres();
    const res = await query('SELECT id, question_type, marks, negative_marks, options FROM questions WHERE question_type = \'mcq\' LIMIT 5');
    console.log('--- SAMPLE MCQ QUESTIONS ---');
    console.log(JSON.stringify(res.rows, null, 2));
    
    // Check one specific submission if possible
    const subRes = await query('SELECT id, exam_id, student_id, answers, obtained_marks, total_marks FROM exam_submissions_new WHERE answers IS NOT NULL LIMIT 2');
    console.log('\n--- SAMPLE SUBMISSIONS ---');
    console.log(JSON.stringify(subRes.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
