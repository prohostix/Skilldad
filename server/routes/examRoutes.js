const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { query } = require('../config/postgres');
const auditLogService = require('../services/auditLogService');
const examController = require('../controllers/examController');
const examSubmissionController = require('../controllers/examSubmissionController');

// Standardized PG implementation for Exam Routes

// @desc    Get all exams (Admin/University)
router.get('/', protect, authorize('admin', 'university'), async (req, res) => {
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
                   cr.name as creator_name, cr.role as creator_role
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON e.university_id = u.id
            LEFT JOIN users cr ON e.created_by_id = cr.id
        `;

        let examsRes;
        if (userRole === 'admin') {
            examsRes = await query(queryStr + ' ORDER BY e.created_at DESC');
        } else {
            // University filter: see exams assigned to them OR exams they created
            examsRes = await query(queryStr + ' WHERE e.university_id = $1 OR e.created_by_id = $1 ORDER BY e.created_at DESC', [req.user._id.toString()]);
        }

        const exams = examsRes.rows.map(row => ({
            ...row,
            university: { _id: row.university_id, name: row.university_name, profile: row.university_profile },
            course: { _id: row.course_id, title: row.course_title },
            createdBy: { name: row.creator_name, role: row.creator_role }
        }));

        res.json(exams);
    } catch (error) {
        console.error('[PG EXAM] Error fetching all exams:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all exams for admin (explicitly requested by frontend)
router.get('/admin/all', protect, authorize('admin', 'university'), async (req, res) => {
    try {
        const queryStr = `
            SELECT e.id as _id, e.*, 
                   e.scheduled_start as "scheduledStartTime", 
                   e.scheduled_end as "scheduledEndTime",
                   e.total_marks as "totalMarks",
                   e.exam_type as "examType",
                   c.id as course_id, c.title as course_title,
                   u.id as university_id, u.name as university_name, u.profile as university_profile,
                   cr.name as creator_name, cr.role as creator_role
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON e.university_id = u.id
            LEFT JOIN users cr ON e.created_by_id = cr.id
            ORDER BY e.created_at DESC
        `;
        const examsRes = await query(queryStr);

        const exams = examsRes.rows.map(row => ({
            ...row,
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
router.get('/admin/:id', protect, authorize('admin', 'university'), examController.getExam);

// @desc    Delete an exam (Admin)
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const examId = req.params.id;

        // Use a transaction or sequential deletes due to FK constraints
        // 1. Delete results
        await query('DELETE FROM results WHERE exam_id = $1', [examId]);

        // 2. Delete submissions
        await query('DELETE FROM exam_submissions_new WHERE exam_id = $1', [examId]);

        // 3. Delete questions
        await query('DELETE FROM questions WHERE exam_id = $1', [examId]);

        // 4. Finally delete the exam
        await query('DELETE FROM exams WHERE id = $1', [examId]);

        res.json({ success: true, message: 'Exam and all associated data deleted successfully' });
    } catch (error) {
        console.error('[PG EXAM] Error deleting exam:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Schedule a new exam
router.post('/admin/schedule', protect, authorize('admin', 'university'), async (req, res) => {
    try {
        const {
            title, description, course, university,
            examType, scheduledStartTime, scheduledEndTime,
            duration, totalMarks, passingScore, isMockExam, instructions,
            mandatedSlotId
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
                is_mock_exam, instructions, status, mandated_slot_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled', $15)
        `, [
            newId, title, description, courseId, universityId,
            examType || 'online-mcq',
            scheduledStartTime || null,
            scheduledEndTime || null,
            duration, totalMarks || 100, passingScore || 40, createdById,
            isMockExam || false, instructions || null, mandatedSlotId || null
        ]);

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
});

// Alias for university deployment
router.post('/', protect, authorize('admin', 'university'), async (req, res, next) => {
    // We just re-use the same logic by calling the existing handler or redirecting
    // For simplicity, we just duplicate the handler or call it. 
    // I'll just copy the logic here or wrap it in a function if I had more time, 
    // but for now, making it hit the same logic is easiest.
    return res.status(308).redirect(307, '/api/exams/admin/schedule');
});

// Use refactored controller methods for student flow
router.get('/student/my-exams', protect, examController.getStudentExams);
router.get('/:id', protect, examController.getExam);
router.post('/:examId/start', protect, examController.startExam);

// Submission related routes
router.post('/:submissionId/answer', protect, examSubmissionController.submitAnswer);
router.post('/:submissionId/submit', protect, examSubmissionController.submitExam);
router.get('/exam/:examId/my-submission', protect, examSubmissionController.getMySubmission);

// Admin/University Result/Grading routes
router.get('/:submissionId/for-grading', protect, authorize('admin', 'university'), examSubmissionController.getSubmissionForGrading);
router.get('/exam-submissions/:submissionId', protect, authorize('admin', 'university'), examSubmissionController.getSubmissionForGrading);

module.exports = router;