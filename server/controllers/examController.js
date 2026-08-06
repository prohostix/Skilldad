const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const FileUploadService = require('../services/FileUploadService');
const auditLogService = require('../services/auditLogService');
const examAccessService = require('../services/examAccessService');
const autoGradingService = require('../services/autoGradingService');

/**
 * @desc    Get student's exams
 * @access  Private (Student)
 */
const getStudentExams = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  console.log(`[Exams] Fetching exams for student: ${studentId}`);

  if (req.user && req.user.is_active === false) {
    console.warn(`[Exams] Deactivated student ${studentId} attempting to fetch exams.`);
    return res.json({ success: true, count: 0, data: [] });
  }

  // 1. Get enrolled courses from PG
  const enrollRes = await query(`
      SELECT e.course_id 
      FROM enrollments e
      LEFT JOIN batches b ON e.batch_id = b.id
      WHERE e.student_id = $1 AND e.status = 'active'
      AND (b.id IS NULL OR b.is_active IS NOT FALSE)
  `, [studentId]);
  const courseIds = enrollRes.rows.map(r => r.course_id);

  console.log(`[Exams] Active enrollments found: ${courseIds.length}`, courseIds);

  if (courseIds.length === 0) {
    console.warn(`[Exams] No active enrollments for student: ${studentId}`);
    return res.json({ success: true, data: [] });
  }

  // 2. Fetch exams for these courses from PG, filtered by batch
  const examsRes = await query(`
      SELECT e.*, c.title as course_title, u.name as university_name
      FROM exams e
      JOIN enrollments en ON e.course_id = en.course_id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.university_id = u.id
      WHERE en.student_id = $1 
      AND (e.batch_ids IS NULL OR CARDINALITY(e.batch_ids) = 0 OR en.batch_id = ANY(e.batch_ids))
      ORDER BY e.created_at DESC
  `, [studentId]);
  const exams = examsRes.rows;

  console.log(`[Exams] Exams found for courses: ${exams.length}`);

  // 3. Get questions and submissions from PG
  const examIds = exams.map(e => e.id);
  const qRes = await query('SELECT * FROM questions WHERE exam_id = ANY($1) ORDER BY "order" ASC', [examIds]);
  const questions = qRes.rows;

  const subRes = await query('SELECT * FROM exam_submissions_new WHERE student_id = $1 AND exam_id = ANY($2)', [studentId, examIds]);
  const submissions = subRes.rows;

  // 4. Combine data
  const examsWithStatus = exams.map(exam => {
    const examQuestions = questions.filter(q => q.exam_id === exam.id);
    const sub = submissions.find(s => s.exam_id === exam.id);

    return {
      _id: exam.id,
      title: exam.title,
      course_id: exam.course_id,
      course: { title: exam.course_title },
      university: { name: exam.university_name },
      examType: exam.exam_type,
      scheduledStartTime: exam.scheduled_start,
      scheduledEndTime: exam.scheduled_end,
      duration: exam.duration,
      totalMarks: exam.total_marks,
      status: exam.status,
      questions: examQuestions.map(q => {
        let parsedOptions = q.options;
        try {
          if (typeof q.options === 'string') {
            parsedOptions = JSON.parse(q.options);
          }
        } catch (e) {
          console.error(`[Exams] Failed to parse options for question ${q.id}:`, e.message);
          parsedOptions = [];
        }

        return { 
          ...q, 
          _id: q.id, 
          question: q.question_text,
          questionText: q.question_text,
          questionType: q.question_type,
          options: parsedOptions
        };
      }),
      submission: sub ? { ...sub, _id: sub.id } : null,
      hasSubmitted: sub && sub.status !== 'in-progress',
      linkedPaperId: exam.linked_paper_id,
      answerKeyId: exam.answer_key_id
    };
  });

  res.json({ success: true, count: examsWithStatus.length, data: examsWithStatus });
});

/**
 * @desc    Start exam for student
 */
const startExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;

  if (req.user && req.user.is_active === false) {
    res.status(403);
    throw new Error('Your account has been deactivated. You cannot start exams.');
  }

  // 1. Check access in PG
  const accessResult = await examAccessService.checkExamAccess(examId, studentId);
  if (!accessResult.canAccess) {
    res.status(403);
    throw new Error(accessResult.reason);
  }

  const exam = accessResult.exam;

  // 2. Check for in-progress submission in PG
  const subRes = await query(`
      SELECT * FROM exam_submissions_new 
      WHERE exam_id = $1 AND student_id = $2 AND status = 'in-progress'
  `, [examId, studentId]);

  let submission = subRes.rows[0];

  // 3. Create new if not exists
  if (!submission) {
    const newId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await query(`
      INSERT INTO exam_submissions_new (id, exam_id, student_id, started_at, status, total_marks)
      VALUES ($1, $2, $3, NOW(), 'in-progress', $4)
    `, [newId, examId, studentId, exam.total_marks]);

    const newSubRes = await query('SELECT * FROM exam_submissions_new WHERE id = $1', [newId]);
    submission = newSubRes.rows[0];

    // Log audit
    await auditLogService.logAuditEvent({
      userId: studentId,
      action: 'exam_started',
      resource: 'exam',
      resourceId: examId,
      details: { examTitle: exam.title, submissionId: submission.id },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown'
    });
  }

  // 4. Fetch questions for this exam
  const qRes = await query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY "order" ASC', [examId]);
  const questions = qRes.rows.map(q => ({
    ...q,
    _id: q.id,
    question: q.question_text,
    questionText: q.question_text,
    questionType: q.question_type,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  }));

  if (questions.length === 0 && exam.exam_type !== 'pdf-based') {
    res.status(400);
    throw new Error('This exam has no questions yet. Please contact your instructor.');
  }

  res.json({
    success: true,
    submission: { ...submission, _id: submission.id },
    questions,
    exam: {
      _id: exam.id,
      title: exam.title,
      examType: exam.exam_type,
      duration: exam.duration,
      totalMarks: exam.total_marks,
      instructions: exam.instructions,
      linkedPaperId: exam.linked_paper_id,
      answerKeyId: exam.answer_key_id,
      questionPaperUrl: exam.exam_type === 'pdf-based' ? `/api/exams/${exam.id}/download-paper` : null
    },
    questionPaperUrl: exam.exam_type === 'pdf-based' ? `/api/exams/${exam.id}/download-paper` : null,
    timeRemaining: accessResult.timeRemaining
  });
});

/**
 * @desc    Auto-grade all MCQ submissions for an exam
 */
const autoGradeExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // 1. Find exam in PG
  const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
  const exam = examRes.rows[0];
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // 2. Fetch all submitted but ungraded MCQ submissions
  const subRes = await query(`
    SELECT id FROM exam_submissions_new 
    WHERE exam_id = $1 AND status = 'submitted'
  `, [examId]);

  const submissionIds = subRes.rows.map(r => r.id);
  const results = [];

  for (const subId of submissionIds) {
    try {
      const result = await autoGradingService.autoGradeMCQSubmission(subId);
      results.push(result);
    } catch (err) {
      console.error(`[AutoGrade] Failed for ${subId}:`, err.message);
    }
  }

  res.json({
    success: true,
    count: results.length,
    gradedCount: results.length,
    message: `Processed ${results.length} submissions for auto-grading`
  });
});

/**
 * @desc    Get single exam by ID
 * @access  Private
 */
const getExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const examRes = await query(`
    SELECT e.*, c.title as course_title, u.name as university_name
    FROM exams e
    LEFT JOIN courses c ON e.course_id = c.id
    LEFT JOIN users u ON e.university_id = u.id
    WHERE e.id = $1
  `, [id]);

  const exam = examRes.rows[0];

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Map to frontend expected format
  const formattedExam = {
    _id: exam.id,
    id: exam.id,
    title: exam.title,
    description: exam.description,
    course_id: exam.course_id,
    course: { title: exam.course_title },
    university: { name: exam.university_name },
    examType: exam.exam_type,
    scheduledStartTime: exam.scheduled_start,
    scheduledEndTime: exam.scheduled_end,
    duration: exam.duration,
    totalMarks: exam.total_marks,
    passingScore: exam.passing_score,
    instructions: exam.instructions,
    status: exam.status,
    linkedPaperId: exam.linked_paper_id,
    answerKeyId: exam.answer_key_id
  };

  res.json({ success: true, exam: formattedExam, data: formattedExam });
});

/**
 * @desc    Download question paper (PDF)
 * @access  Private (Student/Admin/University)
 */
const downloadQuestionPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 1. Get exam and its linked paper ID
  const examRes = await query('SELECT linked_paper_id FROM exams WHERE id = $1', [id]);
  const exam = examRes.rows[0];
  
  if (!exam || !exam.linked_paper_id) {
    res.status(404);
    throw new Error('Question paper not found for this exam');
  }
  
  // 2. Get document details
  const docRes = await query('SELECT file_url, file_name FROM documents WHERE id = $1', [exam.linked_paper_id]);
  const document = docRes.rows[0];
  
  if (!document) {
    res.status(404);
    throw new Error('Linked document not found');
  }
  
  // 3. Serve the file
  const path = require('path');
  const fs = require('fs');
  const filePath = path.join(process.cwd(), document.file_url);
  
  if (!fs.existsSync(filePath)) {
    console.error(`[PDF Exam] File not found: ${filePath}`);
    res.status(404);
    throw new Error('Physical file not found on server');
  }
  
  res.download(filePath, document.file_name);
});

/**
 * @desc    Bulk upload questions via Excel
 * @access  Private (Admin/University/Partner)
 */
const bulkUploadQuestions = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an Excel file');
  }

  const xlsx = require('xlsx');
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  if (data.length === 0) {
    res.status(400);
    throw new Error('Excel sheet is empty');
  }

  // Question structure:
  // Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D), Marks
  
  const questions = data.map((row, index) => {
    const correctChar = (row['Correct Option (A/B/C/D)'] || '').toString().trim().toUpperCase();
    const options = [
      { text: (row['Option A'] || '').toString().trim(), isCorrect: correctChar === 'A' },
      { text: (row['Option B'] || '').toString().trim(), isCorrect: correctChar === 'B' },
      { text: (row['Option C'] || '').toString().trim(), isCorrect: correctChar === 'C' },
      { text: (row['Option D'] || '').toString().trim(), isCorrect: correctChar === 'D' },
    ];

    const correctIndex = options.findIndex(o => o.isCorrect);
    console.log(`[BulkUpload] Question ${index + 1}: Correct Index identified as ${correctIndex} (${correctChar})`);

    return {
      id: `q_${Date.now()}_${index}`,
      exam_id: examId,
      question_text: row['Question'] || '',
      question_type: 'mcq',
      options: JSON.stringify(options),
      marks: parseInt(row['Marks']) || 1,
      negative_marks: parseFloat(row['Negative Marks']) || 0,
      order: index + 1
    };
  });

  // Insert into DB
  for (const q of questions) {
    await query(`
      INSERT INTO questions (id, exam_id, question_text, question_type, options, marks, "order", negative_marks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [q.id, q.exam_id, q.question_text, q.question_type, q.options, q.marks, q.order, q.negative_marks]);
  }

  // Update exam type to online-mcq and recalculate total marks
  const totalMarksRes = await query('SELECT COALESCE(SUM(marks), 0) as total FROM questions WHERE exam_id = $1', [examId]);
  const totalMarks = parseFloat(totalMarksRes.rows[0].total) || 0;
  await query(
    "UPDATE exams SET exam_type = 'online-mcq', total_marks = $1 WHERE id = $2",
    [totalMarks, examId]
  );

  res.status(201).json({ success: true, message: `${questions.length} questions uploaded successfully`, totalMarks });
});

/**
 * @desc    Upload question paper (PDF) and link to exam
 * @access  Private (Admin/University/Partner)
 */
const uploadQuestionPaper = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF file');
  }

  // 1. Check if exam exists
  const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
  const exam = examRes.rows[0];
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // 2. Upload file via Service
  const uploadResult = await FileUploadService.uploadQuestionPaper(req.file, examId);

  // 3. Create document record (so it shows in Question Bank)
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await query(`
    INSERT INTO documents (
      id, title, description, type, file_url, file_name, file_size, 
      uploaded_by_id, university_id, course_id, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved', NOW())
  `, [
    docId,
    `Question Paper: ${exam.title}`,
    `Uploaded for exam: ${examId}`,
    'exam_paper',
    uploadResult.url,
    uploadResult.filename,
    uploadResult.size,
    req.user._id.toString(),
    exam.university_id,
    exam.course_id
  ]);

  // 4. Link document to exam
  await query('UPDATE exams SET linked_paper_id = $1 WHERE id = $2', [docId, examId]);

  // 5. Log audit
  await auditLogService.logAuditEvent({
    userId: req.user._id,
    action: 'question_paper_uploaded',
    resource: 'exam',
    resourceId: examId,
    details: { docId, fileName: uploadResult.filename },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'unknown'
  });

  res.status(200).json({
    success: true,
    message: 'Question paper uploaded and linked successfully',
    docId,
    url: uploadResult.url
  });
});

module.exports = {
  getStudentExams,
  startExam,
  getExam,
  autoGradeExam,
  downloadQuestionPaper,
  bulkUploadQuestions,
  uploadQuestionPaper
};
