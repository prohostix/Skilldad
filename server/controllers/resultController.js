const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const resultService = require('../services/resultService');
const auditLogService = require('../services/auditLogService');

/**
 * @desc    Publish results for an exam
 */
const publishResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // 1. Verify exam exists and check authorization in PG
  const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
  const exam = examRes.rows[0];
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  const userRole = req.user.role?.toLowerCase();
  if (userRole !== 'admin' && exam.university_id !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to publish results for this exam');
  }

  // 2. Generate results (ranking/grading)
  await resultService.generateExamResults(examId);

  // 3. Set isPublished to true in PG
  const publishedAt = new Date();
  await query(`
    UPDATE results 
    SET is_published = true, published_at = $1, updated_at = NOW() 
    WHERE exam_id = $2
  `, [publishedAt, examId]);

  // 4. Update exam status
  await query(`
    UPDATE exams 
    SET status = 'published', updated_at = NOW() 
    WHERE id = $1
  `, [examId]);

  res.json({
    success: true,
    message: 'Results published successfully',
    publishedAt
  });
});

/**
 * @desc    Get all results for an exam
 */
const getExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // 1. Fetch results with student info from PG
  const resSet = await query(`
    SELECT r.id as _id, r.exam_id, r.student_id, r.submission_id,
           r.obtained_marks as "obtainedMarks", r.total_marks as "totalMarks",
           r.percentage, r.grade, r.rank, r.is_passed as "isPassed",
           u.name as student_name, u.email as student_email
    FROM results r
    JOIN users u ON r.student_id = u.id
    WHERE r.exam_id = $1
    ORDER BY r.rank ASC
  `, [examId]);

  res.json({
    success: true,
    results: resSet.rows
  });
});

/**
 * @desc    Get result for a specific student
 */
const getStudentResult = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const resSet = await query(`
    SELECT r.id as _id, r.exam_id, r.student_id, r.submission_id,
           r.obtained_marks as "obtainedMarks", r.total_marks as "totalMarks",
           r.percentage, r.grade, r.rank, r.is_passed as "isPassed",
           r.overall_feedback as "overallFeedback",
           e.title as exam_title, s.answers, s.submitted_at as "submittedAt", s.time_spent as "timeSpent"
    FROM results r
    JOIN exams e ON r.exam_id = e.id
    LEFT JOIN exam_submissions_new s ON r.submission_id = s.id
    WHERE r.exam_id = $1 AND r.student_id = $2
  `, [examId, studentId]);

  const result = resSet.rows[0];
  if (!result) {
    return res.json({
      success: true,
      result: null,
      message: 'Result not published yet'
    });
  }

  // Enrich answers with question detail if submission exists
  if (result.answers && Array.isArray(result.answers)) {
    const qRes = await query('SELECT * FROM questions WHERE exam_id = $1', [examId]);
    const questions = qRes.rows;

    result.answers = result.answers.map(ans => {
      const question = questions.find(q => q.id === ans.questionId || q.id === ans.question);
      return {
        ...ans,
        question: question ? {
          questionText: question.question_text,
          marks: question.marks,
          options: question.options, // Assuming options is already JSONB
          questionType: question.question_type
        } : null
      };
    });
  }

  res.json({
    success: true,
    result
  });
});

module.exports = {
  publishResults,
  getExamResults,
  getStudentResult
};
