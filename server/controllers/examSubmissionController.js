const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const FileUploadService = require('../services/FileUploadService');
const auditLogService = require('../services/auditLogService');

/**
 * @desc    Submit answer for a question during exam (auto-save)
 * @route   POST /api/exam-submissions/:submissionId/answer
 * @access  Private (Student)
 */
const submitAnswer = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { questionId, selectedOption, textAnswer } = req.body;
  const studentId = req.user._id;

  // 1. Find submission and validate ownership in PG
  const subRes = await query('SELECT * FROM exam_submissions_new WHERE id = $1', [submissionId]);
  const submission = subRes.rows[0];

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  if (submission.student_id !== studentId.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this submission');
  }

  // 2. Validate status
  if (submission.status !== 'in-progress') {
    res.status(400);
    throw new Error('Cannot modify submitted exam');
  }

  // 3. Get question from PG
  const qRes = await query('SELECT * FROM questions WHERE id = $1', [questionId]);
  const question = qRes.rows[0];
  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  // 4. Update or add answer in JSONB array
  let answers = submission.answers || [];
  const existingAnswerIndex = answers.findIndex(a => (a.questionId === questionId || a.question === questionId));

  const answerData = {
    questionId: questionId,
    questionType: question.question_type,
    selectedOption: question.question_type === 'mcq' ? selectedOption : undefined,
    textAnswer: question.question_type === 'descriptive' ? textAnswer : undefined
  };

  if (existingAnswerIndex >= 0) {
    answers[existingAnswerIndex] = answerData;
  } else {
    answers.push(answerData);
  }

  // 5. Update PG
  await query(
    'UPDATE exam_submissions_new SET answers = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(answers), submissionId]
  );

  res.json({
    success: true,
    message: 'Answer saved',
    submission: { ...submission, answers }
  });
});

/**
 * @desc    Submit exam (finalize submission)
 * @route   POST /api/exam-submissions/:submissionId/submit
 * @access  Private (Student)
 */
const submitExam = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { isAutoSubmit = false, answers } = req.body;
  const studentId = req.user._id;

  // 1. Find submission and validate ownership
  const subRes = await query(`
    SELECT s.*, e.title as exam_title, e.total_marks, e.exam_type, e.passing_score
    FROM exam_submissions_new s 
    JOIN exams e ON s.exam_id = e.id 
    WHERE s.id = $1
  `, [submissionId]);

  const submission = subRes.rows[0];

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  if (submission.student_id !== studentId.toString()) {
    res.status(403);
    throw new Error('Not authorized to submit this exam');
  }

  if (submission.status !== 'in-progress') {
    res.status(400);
    throw new Error('Exam already submitted');
  }

  // 2. Fetch all questions for auto-grading
  const qRes = await query('SELECT * FROM questions WHERE exam_id = $1', [submission.exam_id]);
  const questions = qRes.rows;
  const questionsMap = {};
  questions.forEach(q => {
    questionsMap[q.id] = q;
  });

  // 3. Process final answers and auto-grade MCQs
  let finalAnswers = answers || submission.answers || [];
  let totalObtainedMarks = 0;
  let hasDescriptive = false;

  finalAnswers = finalAnswers.map(ans => {
    const qId = ans.questionId || (ans.question && (ans.question._id || ans.question));
    const question = questionsMap[qId];

    if (!question) return ans;

    if (question.question_type === 'mcq') {
      const options = question.options || [];
      const selectedIdx = ans.selectedOption !== undefined ? ans.selectedOption : ans.answer;
      const isCorrect = options[selectedIdx]?.isCorrect === true;

      const marksAwarded = isCorrect ? (Number(question.marks) || 1) : 0;
      totalObtainedMarks += marksAwarded;

      return {
        ...ans,
        questionType: 'mcq',
        selectedOption: selectedIdx !== undefined ? Number(selectedIdx) : null,
        marksAwarded,
        isCorrect,
        gradedAt: new Date()
      };
    } else {
      hasDescriptive = true;
      return {
        ...ans,
        questionType: 'descriptive',
        textAnswer: ans.textAnswer !== undefined ? ans.textAnswer : ans.answer
      };
    }
  });

  // Calculate percentage and pass status
  const totalExamMarks = Number(submission.total_marks) || 100;
  const passingScore = Number(submission.passing_score) || 40;
  const percentage = (totalObtainedMarks / totalExamMarks) * 100;
  const passed = percentage >= passingScore;

  // 4. Update status and timestamps
  const submittedAt = new Date();
  const timeSpent = Math.floor((submittedAt - new Date(submission.started_at)) / 1000);

  // If only MCQs, we can mark as 'graded' immediately
  const finalStatus = hasDescriptive ? 'submitted' : 'graded';

  await query(`
    UPDATE exam_submissions_new 
    SET status = $1, 
        submitted_at = $2, 
        time_spent = $3, 
        is_auto_submitted = $4, 
        answers = $5,
        obtained_marks = $6,
        percentage = $7,
        passed = $8,
        updated_at = NOW()
    WHERE id = $9
  `, [finalStatus, submittedAt, timeSpent, isAutoSubmit, JSON.stringify(finalAnswers), totalObtainedMarks, percentage, passed, submissionId]);

  // Log audit event
  await auditLogService.logAuditEvent({
    userId: studentId,
    action: isAutoSubmit ? 'exam_submitted_auto' : 'exam_submitted_manual',
    resource: 'submission',
    resourceId: submissionId,
    details: {
      examId: submission.exam_id,
      examTitle: submission.exam_title,
      timeSpent: timeSpent,
      isAutoSubmitted: isAutoSubmit,
      obtainedMarks: totalObtainedMarks,
      percentage: percentage,
      status: finalStatus
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'unknown'
  });

  res.json({
    success: true,
    message: isAutoSubmit ? 'Exam auto-submitted' : 'Exam submitted successfully',
    submission: {
      ...submission,
      status: finalStatus,
      submitted_at: submittedAt,
      time_spent: timeSpent,
      obtained_marks: totalObtainedMarks,
      percentage: percentage
    }
  });
});

/**
 * @desc    Get my submission for an exam
 * @route   GET /api/exam-submissions/exam/:examId/my-submission
 * @access  Private (Student)
 */
const getMySubmission = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id || req.user._id;

  const subRes = await query(`
    SELECT s.id as _id, s.exam_id, s.student_id, s.status, 
           s.started_at as "startedAt", s.submitted_at as "submittedAt", 
           s.time_spent as "timeSpent", s.is_auto_submitted as "isAutoSubmitted",
           s.answers, s.total_marks as "totalMarks", s.obtained_marks as "obtainedMarks",
           e.title as exam_title, e.exam_type, e.duration 
    FROM exam_submissions_new s
    JOIN exams e ON s.exam_id = e.id
    WHERE s.exam_id = $1 AND s.student_id = $2
  `, [examId, studentId.toString()]);

  let submission = subRes.rows[0];

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Populate question details into answers if they exist
  if (submission.answers && Array.isArray(submission.answers)) {
    const qRes = await query(`
      SELECT id as _id, question_text as "questionText", question_type as "questionType", 
             options, marks, negative_marks as "negativeMarks", "order"
      FROM questions 
      WHERE exam_id = $1
      ORDER BY "order" ASC
    `, [examId]);
    
    const questionsMap = {};
    qRes.rows.forEach(q => { questionsMap[q._id] = q; });
    
    submission.answers = submission.answers.map(ans => {
      const qId = ans.questionId || (ans.question && (ans.question._id || ans.question)) || ans.question;
      return {
        ...ans,
        question: questionsMap[qId] || ans.question || null
      };
    });
  }

  res.json({
    success: true,
    submission
  });
});

/**
 * @desc    Get submission details for grading
 * @route   GET /api/exam-submissions/:submissionId
 * @access  Private (University/Admin)
 */
const getSubmissionForGrading = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  // 1. Fetch submission with exam and student basic info
  const subRes = await query(`
    SELECT s.*, e.title as exam_title, e.total_marks, e.passing_score, u.name as student_name, u.email as student_email
    FROM exam_submissions_new s
    JOIN exams e ON s.exam_id = e.id
    JOIN users u ON s.student_id = u.id
    WHERE s.id = $1
  `, [submissionId]);

  const submission = subRes.rows[0];

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // 2. Fetch all questions for this exam to populate answers
  const qRes = await query(`
    SELECT id as _id, question_text as "questionText", question_type as "questionType", 
           options, marks, negative_marks as "negativeMarks", "order"
    FROM questions 
    WHERE exam_id = $1
    ORDER BY "order" ASC
  `, [submission.exam_id]);

  const questions = qRes.rows;
  const questionsMap = {};
  questions.forEach(q => {
    questionsMap[q._id] = q;
  });

  // 3. Populate questions into answers
  let answers = submission.answers || [];
  answers = answers.map(ans => {
    const qId = ans.questionId || (ans.question && (ans.question._id || ans.question));
    return {
      ...ans,
      question: questionsMap[qId] || null
    };
  });

  res.json({
    success: true,
    submission: {
      ...submission,
      answers
    }
  });
});

/**
 * @desc    Get all submissions for an exam (for grading)
 * @route   GET /api/submissions/exam/:examId
 * @access  Private (University/Admin)
 */
const getSubmissionsForExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Verify authorization
  const userId = req.user.id || req.user._id;

  const examRes = await query('SELECT university_id, created_by_id FROM exams WHERE id = $1', [examId]);
  const exam = examRes.rows[0];

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  if (exam.university_id?.toString() !== userId.toString() &&
    exam.created_by_id?.toString() !== userId.toString() &&
    req.user.role?.toLowerCase() !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view submissions for this exam');
  }

  // Fetch submissions with student details
  const subRes = await query(`
        SELECT 
            s.*,
            s.id as _id,
            s.student_id,
            s.status,
            s.submitted_at as "submittedAt",
            s.started_at as "startedAt",
            s.total_marks as "totalMarks",
            s.obtained_marks as "obtainedMarks",
            u.name as "studentName", 
            u.email as "studentEmail"
        FROM exam_submissions_new s
        JOIN users u ON s.student_id = u.id
        WHERE s.exam_id = $1
        ORDER BY s.submitted_at DESC NULLS LAST
    `, [examId]);

  const submissions = subRes.rows.map(sub => ({
    ...sub,
    student: {
      _id: sub.student_id,
      name: sub.studentName,
      email: sub.studentEmail
    }
  }));

  res.json({
    success: true,
    count: submissions.length,
    submissions
  });
});

/**
 * @desc    Grade a submission manually
 * @route   POST /api/submissions/:submissionId/grade
 * @access  Private (University/Admin)
 */
const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { answers } = req.body; // Array of { questionId, marksAwarded, feedback }

  // 1. Find submission and exam info
  const subRes = await query(`
    SELECT s.*, e.total_marks as exam_total_marks
    FROM exam_submissions_new s
    JOIN exams e ON s.exam_id = e.id
    WHERE s.id = $1
  `, [submissionId]);
  const submission = subRes.rows[0];

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // 2. Map existing answers to update them
  let currentAnswers = submission.answers || [];
  const gradingMap = {};
  if (Array.isArray(answers)) {
    answers.forEach(a => {
      gradingMap[a.questionId] = a;
    });
  }

  currentAnswers = currentAnswers.map(ans => {
    const qId = ans.questionId || (ans.question && (ans.question._id || ans.question)) || ans.question;
    const gradeInfo = gradingMap[qId];
    if (gradeInfo) {
      return {
        ...ans,
        marksAwarded: Number(gradeInfo.marksAwarded),
        feedback: gradeInfo.feedback
      };
    }
    return ans;
  });

  // 3. Calculate total obtained marks
  const totalObtainedMarks = currentAnswers.reduce((sum, ans) => sum + (Number(ans.marksAwarded) || 0), 0);
  const totalExamMarks = submission.exam_total_marks || submission.total_marks || 100;
  const passingScore = Number(submission.passing_score) || 40;
  const percentage = (totalObtainedMarks / totalExamMarks) * 100;
  const passed = percentage >= passingScore;

  // 4. Update in PG
  await query(`
    UPDATE exam_submissions_new 
    SET answers = $1, 
        obtained_marks = $2, 
        percentage = $3,
        passed = $4,
        status = 'graded',
        updated_at = NOW()
    WHERE id = $5
  `, [JSON.stringify(currentAnswers), totalObtainedMarks, percentage, passed, submissionId]);

  res.json({
    success: true,
    message: 'Submission graded successfully',
    obtainedMarks: totalObtainedMarks,
    percentage: percentage,
    passed
  });
});

module.exports = {

  submitAnswer,
  submitExam,
  getMySubmission,
  getSubmissionForGrading,
  // Placeholders for other methods if needed
  uploadAnswerSheet: async (req, res) => res.status(501).json({ message: 'Not implemented' }),
  getSubmissionsForExam,
  gradeSubmission
};
