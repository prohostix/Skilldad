const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');
const { query } = require('../config/postgres');
const Project = require('../models/projectModel');
const ProjectSubmission = require('../models/projectSubmissionModel');
const socketService = require('../services/SocketService');

// Configure multer for project file uploads with absolute path resolution
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const serverRoot = path.resolve(__dirname, '..');
            const dest = path.join(serverRoot, 'uploads', 'projects');

            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
                console.log(`[Project Storage] Created directory: ${dest}`);
            }
            cb(null, dest);
        } catch (err) {
            console.error('[Project Storage] Destination error:', err.message);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for projects
    }
});

// @desc    Get all projects (Admin only)
// @route   GET /api/projects
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                c.id as "courseId",
                c.title as "courseTitle",
                p_def->>'_id' as id,
                p_def->>'_id' as _id,
                p_def->>'title' as title,
                p_def->>'description' as description,
                p_def->>'deadline' as deadline,
                u.name as "instructorName",
                u.email as "instructorEmail"
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            CROSS JOIN LATERAL jsonb_array_elements(c.projects) p_def
            ORDER BY c.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all projects for a course
// @route   GET /api/projects/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const result = await query(`
            SELECT 
                c.id as "courseId",
                c.title as "courseTitle",
                p_def->>'_id' as id,
                p_def->>'_id' as _id,
                p_def->>'title' as title,
                p_def->>'description' as description,
                p_def->>'deadline' as deadline,
                u.name as "instructorName",
                u.email as "instructorEmail",
                ps.status,
                ps.id as "submissionId",
                ps.file_url as "fileUrl",
                ps.github_url as "githubUrl",
                ps.grade,
                ps.feedback
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            CROSS JOIN LATERAL jsonb_array_elements(c.projects) p_def
            LEFT JOIN projects ps ON ps.course_id = c.id AND ps.student_id = $2 AND ps.id = p_def->>'_id'
            WHERE c.id = $1 AND c.is_published = true
            ORDER BY p_def->>'deadline' ASC
        `, [req.params.courseId, studentId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get student's projects
// @route   GET /api/projects/my-projects
// @access  Private (Student)
router.get('/my-projects', protect, async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const result = await query(`
            SELECT 
                c.id as "courseId",
                c.title as "courseTitle",
                p_def->>'_id' as id,
                p_def->>'_id' as _id,
                p_def->>'title' as title,
                p_def->>'description' as description,
                p_def->>'deadline' as deadline,
                u.name as "instructorName",
                ps.status,
                ps.id as "submissionId",
                ps.id as "_id",
                ps.status as "submissionStatus",
                ps.file_url as "fileUrl",
                ps.github_url as "githubUrl",
                ps.grade,
                ps.feedback
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN users u ON c.instructor_id = u.id
            CROSS JOIN LATERAL jsonb_array_elements(c.projects) p_def
            LEFT JOIN projects ps ON ps.id = p_def->>'_id' AND ps.student_id = e.student_id AND ps.course_id = c.id
            WHERE e.student_id = $1 AND e.status = 'active' AND c.is_published = true
            ORDER BY p_def->>'deadline' ASC
        `, [studentId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const projectId = req.params.id;
        const studentId = req.user.id || req.user._id;
        const userRole = req.user.role;

        let projectQuery = `
            SELECT 
                c.id as "courseId",
                c.title as "courseTitle",
                p_def->>'_id' as id,
                p_def->>'_id' as _id,
                p_def->>'title' as title,
                p_def->>'description' as description,
                p_def->>'deadline' as deadline,
                p_def->>'rubric' as rubric,
                u.id as "instructorId",
                u.name as "instructorName",
                u.email as "instructorEmail"
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            CROSS JOIN LATERAL jsonb_array_elements(c.projects) p_def
            WHERE p_def->>'_id' = $1
        `;

        const projectResult = await query(projectQuery, [projectId]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = projectResult.rows[0];

        // If student, include their submission
        if (userRole === 'student') {
            const submissionResult = await query(`
                SELECT 
                    ps.id as "submissionId",
                    ps.status,
                    ps.file_url as "fileUrl",
                    ps.github_url as "githubUrl",
                    ps.submission_date as "submittedAt",
                    ps.grade,
                    ps.feedback
                FROM projects ps
                WHERE ps.id = $1 AND ps.student_id = $2
            `, [projectId, studentId]);

            project.submission = submissionResult.rows.length > 0 ? submissionResult.rows[0] : null;
            project.status = project.submission ? project.submission.status : 'not-started';
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Instructor/Admin)
router.post('/', protect, authorize('university', 'admin'), async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            instructor: req.user._id
        });

        const savedProject = await project.save();
        await savedProject.populate('course', 'title');
        await savedProject.populate('instructor', 'name email');

        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Submit project
// @route   POST /api/projects/:id/submit
// @access  Private (Student)
router.post('/:id/submit', protect, upload.array('files', 10), async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;
        const projectId = req.params.id;
        console.log(`[Project Submit] User: ${req.user.email}, Project ID: ${projectId}`);

        // Find the project definition and course
        const projectDefResult = await query(`
            SELECT c.id as "courseId", p_def
            FROM courses c,
            jsonb_array_elements(c.projects) p_def
            WHERE p_def->>'_id' = $1
        `, [projectId]);

        if (projectDefResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { courseId, p_def: projectDef } = projectDefResult.rows[0];

        // Check if deadline has passed
        if (projectDef.deadline && new Date() > new Date(projectDef.deadline)) {
            // return res.status(400).json({ message: 'Project deadline has passed' });
        }

        const fileUrl = req.files && req.files.length > 0 ? `uploads/projects/${req.files[0].filename}` : null;
        const githubUrl = req.body.githubUrl || '';

        // Check for existing submission
        const existingSub = await query('SELECT id FROM projects WHERE id = $1 AND student_id = $2', [projectId, studentId]);

        if (existingSub.rows.length > 0) {
            await query(`
                UPDATE projects 
                SET file_url = $1, github_url = $2, status = 'submitted', submission_date = NOW(), updated_at = NOW()
                WHERE id = $3 AND student_id = $4
            `, [fileUrl, githubUrl, projectId, studentId]);
        } else {
            await query(`
                INSERT INTO projects (id, student_id, course_id, title, description, file_url, github_url, status, submission_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', NOW(), NOW(), NOW())
            `, [projectId, studentId, courseId, projectDef.title, projectDef.description, fileUrl, githubUrl]);
        }

        res.status(201).json({ success: true, message: 'Project submitted successfully' });
    } catch (error) {
        console.error('[Project Submit] 500 Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get project submissions (for instructors)
// @route   GET /api/projects/:id/submissions
// @access  Private (Instructor/Admin)
router.get('/:id/submissions', protect, authorize('university', 'admin'), async (req, res) => {
    try {
        const projectId = req.params.id;

        const submissions = await query(`
            SELECT ps.*, u.name as "studentName", u.email as "studentEmail"
            FROM projects ps
            JOIN users u ON ps.student_id = u.id
            WHERE ps.id = $1
            ORDER BY ps.submission_date DESC
        `, [projectId]);

        res.json(submissions.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Grade project submission
// @route   PUT /api/projects/submissions/:submissionId/grade
// @access  Private (Instructor/Admin)
router.put('/submissions/:submissionId/grade', protect, authorize('university', 'admin'), async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submissionId = req.params.submissionId;

        const result = await query(`
            UPDATE projects 
            SET grade = $1, feedback = $2, status = 'graded', updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [grade, feedback, submissionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get student's submission for a project
// @route   GET /api/projects/:id/my-submission
// @access  Private (Student)
router.get('/:id/my-submission', protect, async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;
        const result = await query(`
            SELECT * FROM projects 
            WHERE id = $1 AND student_id = $2
        `, [req.params.id, studentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No submission found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;