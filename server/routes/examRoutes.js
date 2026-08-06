const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { query } = require('../config/postgres');
const auditLogService = require('../services/auditLogService');
const socketService = require('../services/SocketService');
const examController = require('../controllers/examController');
const examSubmissionController = require('../controllers/examSubmissionController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadQuestionPaper: uploadPaper, handleUploadError } = require('../middleware/examUploadMiddleware');

// Configure multer for student answer sheet uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(process.cwd(), 'uploads', 'exams', 'answers');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `answer-${req.params.examId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Helper to notify all students enrolled in a course or all students in a university
 */
const notifyEnrolledStudents = async (session, title, message) => {
    try {
        let studentIds = [];
        
        // 1. Fetch by Course and optional Batch
        if (session.course_id) {
            // Join with batches to ensure we don't notify students in an explicitly inactive batch
            let q = `
                SELECT e.student_id 
                FROM enrollments e
                LEFT JOIN batches b ON e.batch_id = b.id
                WHERE e.course_id = $1 AND e.status = 'active'
                AND (e.batch_id IS NULL OR b.is_active = true)
            `;
            let params = [session.course_id];
            
            if (session.batch_ids && Array.isArray(session.batch_ids) && session.batch_ids.length > 0) {
                const validBatchIds = session.batch_ids.filter(Boolean);
                if (validBatchIds.length > 0) {
                    q += " AND e.batch_id = ANY($2)";
                    params.push(validBatchIds);
                }
            }
            
            const res = await query(q, params);
            studentIds = res.rows.map(r => r.student_id);

            // Note: phone/course_id are not direct columns on users; enrollments table is the source of truth
        }

        // 2. Fetch by Partner or University if specified
        if (session.partner_id) {
            const res = await query(
                "SELECT id FROM users WHERE registered_by = $1 AND role = 'student'",
                [session.partner_id]
            );
            const partnerStudentIds = res.rows.map(r => r.id);
            studentIds = Array.from(new Set([...studentIds, ...partnerStudentIds]));
        }
        
        if (session.university_id) {
            const res = await query(
                "SELECT id FROM users WHERE university_id = $1 AND role = 'student'",
                [session.university_id]
            );
            const uniStudentIds = res.rows.map(r => r.id);
            studentIds = Array.from(new Set([...studentIds, ...uniStudentIds]));
        }

        // 3. Fallback: If no specific partner/university/course students matched, fetch all active students
        if (studentIds.length === 0) {
            const allStudentsRes = await query("SELECT id FROM users WHERE role = 'student' LIMIT 250");
            studentIds = allStudentsRes.rows.map(r => r.id);
        }

        if (studentIds.length > 0) {
            // Real-time socket notification
            socketService.sendToUsers(studentIds, 'notification', {
                type: 'exam_scheduled',
                title,
                message,
                courseId: session.course_id,
                startTime: session.scheduled_start,
                timestamp: new Date()
            });

            // Multi-channel notifications (WhatsApp + Email)
            const notificationService = require('../services/NotificationService');
            const studentsRes = await query(
                "SELECT id, name, email, profile->>'phone' AS phone, profile->>'phoneNumber' AS phone_alt, profile FROM users WHERE id = ANY($1) AND is_active = true",
                [studentIds]
            );

            // Fetch course title if not provided
            let courseTitle = 'Your Course';
            if (session.course_id) {
                const cRes = await query('SELECT title FROM courses WHERE id = $1', [session.course_id]);
                if (cRes.rows.length > 0) courseTitle = cRes.rows[0].title;
            }

            console.log(`[ExamNotify] Dispatching Email & WhatsApp notifications to ${studentsRes.rows.length} enrolled students for course: ${courseTitle}`);

            for (const student of studentsRes.rows) {
                // Phone is stored inside the profile JSONB - already extracted by the query
                let phone = student.phone || student.phone_alt;
                if (!phone && student.profile) {
                    let p = student.profile;
                    if (typeof p === 'string') {
                        try { p = JSON.parse(p); } catch(e) { p = {}; }
                    }
                    phone = p.phone || p.phoneNumber || p.contact || p.mobile;
                }
                notificationService.send(
                    { ...student, phone }, 
                    'exam_scheduled', 
                    { 
                        examTitle: title.replace('📝', '').trim(), 
                        courseTitle: courseTitle,
                        scheduledDate: session.scheduled_start
                    },
                    { email: true, whatsapp: true }
                ).catch(err => console.error(`[ExamNotify] Failed for student ${student.id}:`, err.message));
            }
        }
    } catch (error) {
        console.error('[Notification] Failed to notify students:', error.message);
    }
};

// Standardized PG implementation for Exam Routes

// @desc    Get all exams (Admin/University)
router.get('/', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const userRole = req.user.role?.toLowerCase();
        let queryStr = `
            SELECT e.id as _id, e.*, 
                   e.scheduled_start as "scheduledStartTime", 
                   e.scheduled_end as "scheduledEndTime",
                   e.total_marks as "totalMarks",
                   e.exam_type as "examType",
                   c.id as course_id, c.title as course_title,
                   u.id as university_id, u.name as university_name, u.profile as university_profile,
                   cr.name as creator_name, cr.role as creator_role,
                   (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count,
                   (SELECT COUNT(*) FROM results r WHERE r.exam_id = e.id) as total_results_count,
                   (SELECT COUNT(*) FROM results r WHERE r.exam_id = e.id AND r.is_passed = true) as passed_results_count
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON e.university_id = u.id
            LEFT JOIN users cr ON e.created_by_id = cr.id
        `;

        let examsRes;
        if (userRole === 'admin') {
            examsRes = await query(queryStr + ' ORDER BY e.created_at DESC');
        } else {
            // University/Partner filter: see exams assigned to them OR exams they created
            examsRes = await query(queryStr + ' WHERE e.university_id = $1 OR e.created_by_id = $1 ORDER BY e.created_at DESC', [req.user._id.toString()]);
        }

        const exams = examsRes.rows.map(row => {
            const totalResCount = parseInt(row.total_results_count || 0, 10);
            const passedResCount = parseInt(row.passed_results_count || 0, 10);
            const passRate = totalResCount > 0 ? Math.round((passedResCount / totalResCount) * 100) : 0;

            return {
                ...row,
                questionCount: parseInt(row.question_count || 0, 10),
                totalResultsCount: totalResCount,
                passedResultsCount: passedResCount,
                passRate: passRate,
                university: { _id: row.university_id, name: row.university_name, profile: row.university_profile },
                course: { _id: row.course_id, title: row.course_title },
                createdBy: { name: row.creator_name, role: row.creator_role }
            };
        });

        res.json(exams);
    } catch (error) {
        console.error('[PG EXAM] Error fetching all exams:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all exams for admin (explicitly requested by frontend)
router.get('/admin/all', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const queryStr = `
            SELECT e.id as _id, e.*, 
                   e.scheduled_start as "scheduledStartTime", 
                   e.scheduled_end as "scheduledEndTime",
                   e.total_marks as "totalMarks",
                   e.exam_type as "examType",
                   c.id as course_id, c.title as course_title,
                   u.id as university_id, u.name as university_name, u.profile as university_profile,
                   cr.name as creator_name, cr.role as creator_role,
                   (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON e.university_id = u.id
            LEFT JOIN users cr ON e.created_by_id = cr.id
            ORDER BY e.created_at DESC
        `;
        const examsRes = await query(queryStr);

        const exams = examsRes.rows.map(row => ({
            ...row,
            questionCount: parseInt(row.question_count || 0, 10),
            university: { _id: row.university_id, name: row.university_name, profile: row.university_profile },
            course: { _id: row.course_id, title: row.course_title },
            createdBy: { name: row.creator_name, role: row.creator_role }
        }));

        res.json({ data: exams });
    } catch (error) {
        console.error('[PG EXAM] Error fetching admin exams:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single exam for admin
router.get('/admin/:id', protect, authorize('admin', 'university', 'partner'), examController.getExam);

// @desc    Delete an exam (Admin/University/Partner)
router.delete('/admin/:id', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const examId = req.params.id;
        const userRole = req.user.role?.toLowerCase();
        const userId = req.user._id?.toString();

        // Partners and universities can only delete their own exams
        if (userRole === 'partner' || userRole === 'university') {
            const examCheck = await query('SELECT created_by_id, university_id FROM exams WHERE id = $1', [examId]);
            if (examCheck.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
            const exam = examCheck.rows[0];
            if (exam.created_by_id !== userId && exam.university_id !== userId) {
                return res.status(403).json({ message: 'Not authorized to delete this exam' });
            }
        }

        // Sequential deletes due to FK constraints
        await query('DELETE FROM results WHERE exam_id = $1', [examId]);
        await query('DELETE FROM exam_submissions_new WHERE exam_id = $1', [examId]);
        await query('DELETE FROM questions WHERE exam_id = $1', [examId]);
        await query('DELETE FROM exams WHERE id = $1', [examId]);

        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('[PG EXAM] Error deleting exam:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Assign linked paper to an existing exam
router.put('/admin/:id/link-paper', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const examId = req.params.id;
        const { linkedPaperId } = req.body;
        
        await query('UPDATE exams SET linked_paper_id = $1 WHERE id = $2', [linkedPaperId, examId]);
        res.json({ success: true, message: 'Paper successfully linked to exam.' });
    } catch (error) {
        console.error('[PG EXAM] Error linking paper:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Publish results for an exam (makes results visible to students)
router.put('/admin/:id/publish-results', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user._id.toString();
        const userRole = req.user.role?.toLowerCase();

        // Fetch exam and verify ownership for partner/university
        const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
        if (examRes.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
        const exam = examRes.rows[0];

        if (userRole === 'partner' || userRole === 'university') {
            if (exam.created_by_id !== userId && exam.university_id !== userId) {
                return res.status(403).json({ message: 'Not authorized to publish results for this exam' });
            }
        }

        // Set results_published = true
        await query('UPDATE exams SET results_published = TRUE WHERE id = $1', [examId]);

        // Notify enrolled students that results are published
        notifyEnrolledStudents(
            { course_id: exam.course_id, university_id: exam.university_id, partner_id: userRole === 'partner' ? userId : null, batch_ids: exam.batch_ids },
            '📊 Exam Results Published',
            `Results for "${exam.title}" have been published. Check your score now!`
        );

        res.json({ success: true, message: 'Results published successfully. Students have been notified.' });
    } catch (error) {
        console.error('[PG EXAM] Error publishing results:', error);
        res.status(500).json({ message: error.message });
    }
});

// Helper for exam scheduling
const handleSchedulePost = async (req, res) => {
    try {
        const {
            title, description, course, university,
            examType, scheduledStartTime, scheduledEndTime,
            duration, totalMarks, passingScore, isMockExam, instructions,
            mandatedSlotId, linkedPaper, answerKey, batchIds
        } = req.body;

        const newId = `exam_${Date.now()}`;

        // Normalize empty strings to null for PostgreSQL foreign keys
        const courseId = course && course.trim() !== '' ? course : null;
        const universityId = university && university.trim() !== '' ? university : (req.user.university_id || req.user._id.toString());
        const createdById = req.user._id.toString();

        await query(`
            INSERT INTO exams (
                id, title, description, course_id, university_id, 
                exam_type, scheduled_start, scheduled_end, 
                duration, total_marks, passing_score, created_by_id, 
                is_mock_exam, instructions, status, mandated_slot_id,
                linked_paper_id, answer_key_id, batch_ids
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled', $15, $16, $17, $18)
        `, [
            newId, title, description, courseId, universityId,
            examType || 'online-mcq',
            scheduledStartTime || null,
            scheduledEndTime || null,
            duration, totalMarks || 100, passingScore || 40, createdById,
            isMockExam || false, instructions || null, mandatedSlotId || null,
            linkedPaper || null, answerKey || null,
            batchIds || null
        ]);

        // Notify students about scheduled exam
        const partnerId = req.user.role?.toLowerCase() === 'partner' ? createdById : null;
        notifyEnrolledStudents(
            { course_id: courseId, university_id: universityId, partner_id: partnerId, scheduled_start: scheduledStartTime, batch_ids: batchIds },
            `${title} 📝`,
            `A new exam "${title}" has been scheduled for your course.`
        );

        await auditLogService.logAuditEvent({
            userId: req.user._id,
            action: 'exam_created',
            resource: 'exam',
            resourceId: newId,
            details: { title, courseId },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent') || 'unknown'
        });

        res.status(201).json({ success: true, examId: newId });
    } catch (error) {
        console.error('[PG EXAM] Error scheduling exam:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Schedule a new exam
router.post('/admin/schedule', protect, authorize('admin', 'university', 'partner'), handleSchedulePost);

// Alias for university & partner deployment
router.post('/', protect, authorize('admin', 'university', 'partner'), handleSchedulePost);

// Use refactored controller methods for student flow
router.get('/student/my-exams', protect, examController.getStudentExams);
router.get('/:id', protect, examController.getExam);
router.post('/:examId/start', protect, examController.startExam);
router.get('/:id/question-paper', protect, examController.downloadQuestionPaper);
router.post('/:examId/question-paper', protect, authorize('admin', 'university', 'partner'), uploadPaper, handleUploadError, examController.uploadQuestionPaper);

// Submission related routes
router.post('/:submissionId/answer', protect, examSubmissionController.submitAnswer);
router.post('/:submissionId/submit', protect, examSubmissionController.submitExam);
router.post('/:examId/upload-answer', protect, upload.single('document'), examSubmissionController.uploadAnswerSheet);
router.get('/exam/:examId/my-submission', protect, examSubmissionController.getMySubmission);

// Admin/University Result/Grading routes
router.get('/:submissionId/for-grading', protect, authorize('admin', 'university', 'partner'), examSubmissionController.getSubmissionForGrading);
router.get('/exam-submissions/:submissionId', protect, authorize('admin', 'university', 'partner'), examSubmissionController.getSubmissionForGrading);

// Bulk upload questions
router.post('/:examId/bulk-upload-questions', protect, authorize('admin', 'university', 'partner'), excelUpload.single('excel'), examController.bulkUploadQuestions);

module.exports = router;