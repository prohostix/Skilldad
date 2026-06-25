const { query } = require('./config/postgres');
const { getExamQuestions } = require('./controllers/questionController');
require('dotenv').config();

async function test() {
  // Mock req and res
  const req = {
    params: { examId: 'exam_1774262319483' } // Exam with 1 question
  };
  const res = {
    json: (data) => {
      console.log('ExamId:', data.examId);
      console.log('Total Questions:', data.totalQuestions);
      if (data.questions && data.questions.length > 0) {
        data.questions.forEach(q => {
          console.log(`  Q: ${q.questionText}, Options Type: ${typeof q.options}, IsArray: ${Array.isArray(q.options)}`);
          console.log('  Options:', JSON.stringify(q.options));
        });
      }
    }
  };

  try {
    const { connectPostgres } = require('./config/postgres');
    await connectPostgres();
    await getExamQuestions(req, res);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

test();
