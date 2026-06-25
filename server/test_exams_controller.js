const { query } = require('./config/postgres');
const { getStudentExams } = require('./controllers/examController');
require('dotenv').config();

async function test() {
  // Mock req and res
  const req = {
    user: { id: 'user_1774248046273' } // A student ID from the DB
  };
  const res = {
    json: (data) => {
      console.log('Success:', data.success);
      console.log('Count:', data.count);
      if (data.data && data.data.length > 0) {
        data.data.forEach(exam => {
          console.log(`Exam: ${exam.title}, Questions: ${exam.questions.length}`);
          exam.questions.forEach(q => {
            console.log(`  Q: ${q.questionText}, Options Type: ${typeof q.options}, IsArray: ${Array.isArray(q.options)}`);
          });
        });
      }
    }
  };

  try {
    const { connectPostgres } = require('./config/postgres');
    await connectPostgres();
    await getStudentExams(req, res);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    process.exit();
  }
}

test();
