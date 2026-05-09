const { query } = require('../config/postgres');

/**
 * Auto-grades MCQ questions in a submission using PostgreSQL
 * 
 * @param {string} submissionId - The submission to grade
 * @returns {Object} Grading summary
 */
async function autoGradeMCQSubmission(submissionId) {
  // 1. Fetch submission and questions in one go if possible, or separately
  const subRes = await query('SELECT * FROM exam_submissions_new WHERE id = $1', [submissionId]);
  const submission = subRes.rows[0];

  if (!submission) {
    throw new Error('Submission not found');
  }

  const examRes = await query('SELECT * FROM exams WHERE id = $1', [submission.exam_id]);
  const exam = examRes.rows[0];
  if (!exam) {
    throw new Error('Exam not found');
  }

  const qRes = await query('SELECT * FROM questions WHERE exam_id = $1', [submission.exam_id]);
  const questions = qRes.rows;

  let obtainedMarks = 0;
  let mcqCount = 0;
  let correctCount = 0;
  let answers = submission.answers || [];

  // Grade each answer
  for (let answer of answers) {
    const question = questions.find(q => q.id === (answer.questionId || answer.question));
    if (question && question.question_type === 'mcq') {
      mcqCount++;
      const options = question.options; // This is a JSONB array
      const correctOptionIndex = options.findIndex(opt => opt.isCorrect === true || opt.isCorrect === 'true' || opt.isCorrect === 1);

      if (answer.selectedOption === correctOptionIndex) {
        answer.isCorrect = true;
        answer.marksAwarded = Math.abs(parseFloat(question.marks) || 1);
        obtainedMarks += answer.marksAwarded;
        correctCount++;
      } else if (answer.selectedOption !== undefined && answer.selectedOption !== null) {
        answer.isCorrect = false;
        answer.marksAwarded = - Math.abs(parseFloat(question.negative_marks) || 0);
        obtainedMarks += answer.marksAwarded; // Adding a negative number
      }
    }
  }

  obtainedMarks = Math.max(0, obtainedMarks);
  const totalMarks = parseFloat(exam.total_marks || 100);
  const percentage = (obtainedMarks / totalMarks) * 100;

  const passingScore = parseFloat(exam.passing_score || 40);
  const passed = percentage >= passingScore;

  // Update PG
  await query(`
    UPDATE exam_submissions_new 
    SET obtained_marks = $1, 
        percentage = $2, 
        passed = $3,
        status = CASE WHEN $4 = $5 THEN 'graded' ELSE status END,
        graded_at = CASE WHEN $4 = $5 THEN NOW() ELSE graded_at END,
        answers = $6,
        total_marks = $7
    WHERE id = $8
  `, [obtainedMarks, percentage, passed, mcqCount, answers.length, JSON.stringify(answers), totalMarks, submissionId]);

  return {
    submissionId,
    mcqCount,
    correctCount,
    obtainedMarks,
    percentage
  };
}

module.exports = {
  autoGradeMCQSubmission
};
