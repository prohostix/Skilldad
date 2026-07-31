const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/postgres');
const { protect, authorize } = require('../middleware/authMiddleware');
// Configure multer for file uploads
// Configure multer for file uploads with robust path handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            // Use path.resolve to ensure we have an absolute path from the server root
            const serverRoot = path.resolve(__dirname, '..');
            const dest = path.join(serverRoot, 'uploads', 'documents');

            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
                console.log(`[Multer] Created destination directory: ${dest}`);
            }
            cb(null, dest);
        } catch (err) {
            console.error('[Multer] Destination error:', err.message);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const exit = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${exit}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Robust check for common extensions and mimetypes
    const allowedExts = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|webp|mp4|webm|mov|ogg/;
    const allowedMimeKeywords = /jpeg|jpg|png|pdf|word|office|excel|sheet|powerpoint|presentation|zip|octet-stream|text|webp|video/;

    const extName = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedMimeKeywords.test(file.mimetype.toLowerCase()) || 
                   file.mimetype.startsWith('image/') || 
                   file.mimetype.startsWith('application/') ||
                   file.mimetype.startsWith('video/');

    // If either the extension or a safe mimetype is present, allow it
    if (extName || mimeType) {
        return cb(null, true);
    } else {
        console.error(`[Multer] Rejecting file! Filename: ${file.originalname}, Mimetype: ${file.mimetype}`);
        cb(new Error(`File type not supported. Current: ${file.mimetype}`));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: fileFilter
});

// @desc    Get all documents (Admin)
// @route   GET /api/documents/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, type, studentId } = req.query;
        let queryStr = `
            SELECT d.*, d.id as _id, u.name as student_name, u.email as student_email,
                   uni.name as university_name
            FROM documents d
            LEFT JOIN users u ON d.student_id = u.id
            LEFT JOIN users uni ON d.university_id = uni.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            params.push(status);
            queryStr += ` AND d.status = $${params.length}`;
        }
        if (type) {
            params.push(type);
            queryStr += ` AND d.type = $${params.length}`;
        }
        if (studentId) {
            params.push(studentId);
            queryStr += ` AND d.student_id = $${params.length}`;
        }

        queryStr += ' ORDER BY d.created_at DESC';
        const result = await query(queryStr, params);

        const docs = result.rows;
        const processedDocs = docs.filter(doc => {
            if (doc.status === 'pending') {
                const isFulfilled = docs.some(d => 
                    d.student_id === doc.student_id &&
                    d.title === doc.title && 
                    (d.status === 'submitted' || d.status === 'approved' || d.status === 'rejected')
                );
                return !isFulfilled;
            }
            return true;
        });

        res.json(processedDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get university documents
// @route   GET /api/documents/university/all
// @access  Private (University)
router.get('/university/all', protect, authorize('university'), async (req, res) => {
    try {
        const uniId = req.user.id || req.user._id;
        const { status } = req.query;
        
        let queryStr = `
            SELECT d.*, d.id as _id, u.name as student_name, u.email as student_email
            FROM documents d
            LEFT JOIN users u ON d.student_id = u.id
            WHERE (
                d.university_id = $1 OR 
                d.uploaded_by_id = $1 OR
                d.student_id IN (
                    SELECT id FROM users WHERE university_id = $1
                    UNION
                    SELECT student_id FROM enrollments e 
                    JOIN courses c ON e.course_id = c.id 
                    WHERE c.instructor_id = $1
                )
            )
        `;
        const params = [uniId];

        if (status) {
            params.push(status);
            queryStr += ` AND d.status = $2`;
        }

        queryStr += ' ORDER BY d.created_at DESC';
        const result = await query(queryStr, params);

        const docs = result.rows;
        const processedDocs = docs.filter(doc => {
            if (doc.status === 'pending') {
                const isFulfilled = docs.some(d => 
                    d.student_id === doc.student_id &&
                    d.title === doc.title && 
                    (d.status === 'submitted' || d.status === 'approved' || d.status === 'rejected')
                );
                return !isFulfilled;
            }
            return true;
        });

        res.json(processedDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Review document
// @route   PUT /api/documents/:id/review
// @access  Private (Admin/University)
// Unified Review Route moved below with partner support

// @desc    Get all documents for a student
// @route   GET /api/documents/my-documents
// @access  Private (Student)
router.get('/my-documents', protect, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const result = await query(`
            SELECT d.*, d.id as _id, c.title as "courseTitle", u.name as "reviewedByName"
            FROM documents d
            LEFT JOIN courses c ON d.course_id = c.id
            LEFT JOIN users u ON d.reviewed_by_id = u.id
            WHERE d.student_id = $1 OR d.uploaded_by_id = $1
            ORDER BY d.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @access  Private (Admin/University/Partner)
router.get('/', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const { status, type, student, university_id } = req.query;
        let whereClauses = [];
        let params = [];

        if (status) {
            params.push(status);
            whereClauses.push(`d.status = $${params.length}`);
        }
        if (type) {
            params.push(type);
            whereClauses.push(`d.type = $${params.length}`);
        }
        if (student) {
            params.push(student);
            whereClauses.push(`d.student_id = $${params.length}`);
        }
        if (university_id) {
            params.push(university_id);
            whereClauses.push(`d.university_id = $${params.length}`);
        }

        // Restriction for university role
        if (req.user.role === 'university') {
            const uId = req.user.id || req.user._id;
            params.push(uId);
            const pIdx = params.length;
            whereClauses.push(`(
                d.university_id = $${pIdx} OR 
                d.uploaded_by_id = $${pIdx} OR 
                d.reviewed_by_id = $${pIdx} OR
                d.student_id IN (
                    SELECT id FROM users WHERE university_id = $${pIdx}
                    UNION
                    SELECT student_id FROM enrollments e 
                    JOIN courses c ON e.course_id = c.id 
                    WHERE c.instructor_id = $${pIdx}
                )
            )`);
        }

        // Restriction for partner role - show docs for students linked to their codes or enrolled in their courses
        if (req.user.role === 'partner') {
            const pId = req.user.id || req.user._id;
            params.push(pId);
            const pIdx = params.length;
            whereClauses.push(`(
                d.uploaded_by_id = $${pIdx} OR
                d.student_id IN (
                    SELECT id FROM users WHERE registered_by = $${pIdx} OR partner_code IN (
                        SELECT code FROM discounts WHERE partner_id = $${pIdx}
                    )
                    UNION
                    SELECT student_id FROM enrollments e 
                    JOIN courses c ON e.course_id = c.id 
                    WHERE c.instructor_id = $${pIdx}
                )
            )`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const result = await query(`
            SELECT d.*, d.id as _id, s.name as "studentName", s.email as "studentEmail", 
                   c.title as "courseTitle", up.name as "uploadedByName", 
                   rv.name as "reviewedByName", un.name as "universityName"
            FROM documents d
            LEFT JOIN users s ON d.student_id = s.id
            LEFT JOIN courses c ON d.course_id = c.id
            LEFT JOIN users up ON d.uploaded_by_id = up.id
            LEFT JOIN users rv ON d.reviewed_by_id = rv.id
            LEFT JOIN users un ON d.university_id = un.id
            ${whereSql}
            ORDER BY d.created_at DESC
        `, params);

        const docs = result.rows;
        const processedDocs = docs.filter(doc => {
            if (doc.status === 'pending') {
                const isFulfilled = docs.some(d => 
                    d.student_id === doc.student_id &&
                    d.title === doc.title && 
                    (d.status === 'submitted' || d.status === 'approved' || d.status === 'rejected')
                );
                return !isFulfilled;
            }
            return true;
        });

        res.json(processedDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const docId = req.params.id;
        const result = await query(`
            SELECT d.*, d.id as _id, s.name as "studentName", s.email as "studentEmail", 
                   c.title as "courseTitle", up.name as "uploadedByName", 
                   rv.name as "reviewedByName"
            FROM documents d
            LEFT JOIN users s ON d.student_id = s.id
            LEFT JOIN courses c ON d.course_id = c.id
            LEFT JOIN users up ON d.uploaded_by_id = up.id
            LEFT JOIN users rv ON d.reviewed_by_id = rv.id
            WHERE d.id = $1
        `, [docId]);

        const document = result.rows[0];
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if user has access to this document
        const userId = req.user.id || req.user._id;
        if (req.user.role === 'student' &&
            document.student_id !== userId &&
            document.uploaded_by_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id || req.user._id;
        const { title, description, type, course, student, university_id } = req.body;

        const fileName = req.file.originalname;
        const fileUrl = `/uploads/documents/${req.file.filename}`;
        const fileSize = req.file.size;
        const format = path.extname(fileName).substring(1).toUpperCase();
        const newId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const insertResult = await query(`
            INSERT INTO documents (
                id, title, description, type, format, file_name, file_url, file_size, 
                status, uploaded_by_id, student_id, course_id, university_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            RETURNING *, id as _id, file_url as "fileUrl"
        `, [
            newId,
            title || fileName,
            description || '',
            type || 'other',
            format,
            fileName,
            fileUrl,
            fileSize,
            'submitted',
            userId,
            student || (req.user.role === 'student' ? userId : null),
            course || null,
            university_id || (req.user.role === 'university' ? userId : null)
        ]);


        res.status(201).json(insertResult.rows[0]);
    } catch (error) {
        console.error('[Document Upload] CRITICAL ERROR:', error);
        res.status(500).json({ 
            message: 'Server error during document upload',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Review document
// @route   PUT /api/documents/:id/review
// @access  Private (Admin/University/Partner)
router.put('/:id/review', protect, authorize('admin', 'university', 'partner'), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const userId = req.user.id || req.user._id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Security Check: Verify Relationship
        if (req.user.role !== 'admin') {
            const docCheck = await query(`
                SELECT d.university_id, d.uploaded_by_id, d.student_id 
                FROM documents d WHERE d.id = $1
            `, [req.params.id]);

            if (docCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Document not found' });
            }

            const doc = docCheck.rows[0];
            let hasAccess = false;

            if (req.user.role === 'university') {
                // Check if university is direct owner or has student relationship
                if (doc.university_id === userId || doc.uploaded_by_id === userId) {
                    hasAccess = true;
                } else {
                    const relCheck = await query(`
                        SELECT id FROM users WHERE id = $1 AND (university_id = $2 OR registered_by = $2)
                        UNION
                        SELECT student_id FROM enrollments e 
                        JOIN courses c ON e.course_id = c.id 
                        WHERE student_id = $1 AND c.instructor_id = $2
                    `, [doc.student_id, userId]);
                    if (relCheck.rows.length > 0) hasAccess = true;
                }
            } else if (req.user.role === 'partner') {
                // Check if partner is direct owner, registered the student, or has partner code/course relationship
                if (doc.uploaded_by_id === userId) {
                    hasAccess = true;
                } else {
                    const relCheck = await query(`
                        SELECT id FROM users WHERE id = $1 AND (
                            registered_by = $2 OR partner_code IN (
                                SELECT code FROM discounts WHERE partner_id = $2
                            )
                        )
                        UNION
                        SELECT student_id FROM enrollments e 
                        JOIN courses c ON e.course_id = c.id 
                        WHERE student_id = $1 AND c.instructor_id = $2
                    `, [doc.student_id, userId]);
                    if (relCheck.rows.length > 0) hasAccess = true;
                }
            }

            if (!hasAccess) {
                return res.status(403).json({ message: 'Unauthorized to review this document' });
            }
        }

        const result = await query(`
            UPDATE documents 
            SET status = $1, rejection_reason = $2, reviewed_by_id = $3, reviewed_at = NOW(), updated_at = NOW()
            WHERE id = $4
            RETURNING *, id as _id
        `, [status, rejectionReason || null, userId, req.params.id]);

        const updatedDoc = result.rows[0];

        // Send notification log to student
        if (updatedDoc && updatedDoc.student_id) {
            try {
                if (status === 'rejected') {
                    await query(`
                        INSERT INTO notification_logs (user_id, type, message, metadata, delivery_status, created_at, updated_at)
                        VALUES ($1, 'DOCUMENT_REJECTED', $2, $3, 'sent', NOW(), NOW())
                    `, [
                        updatedDoc.student_id,
                        `Document Rejected: Your document "${updatedDoc.title || updatedDoc.type}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please upload a clear copy.'}`,
                        JSON.stringify({ docId: updatedDoc.id, docTitle: updatedDoc.title, reason: rejectionReason })
                    ]);
                } else if (status === 'approved') {
                    await query(`
                        INSERT INTO notification_logs (user_id, type, message, metadata, delivery_status, created_at, updated_at)
                        VALUES ($1, 'DOCUMENT_APPROVED', $2, $3, 'sent', NOW(), NOW())
                    `, [
                        updatedDoc.student_id,
                        `Document Verified: Your document "${updatedDoc.title || updatedDoc.type}" has been approved.`,
                        JSON.stringify({ docId: updatedDoc.id, docTitle: updatedDoc.title })
                    ]);
                }
            } catch (notifErr) {
                console.error('Failed to log document review notification:', notifErr);
            }
        }

        res.json(updatedDoc);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Create document requirement
// @route   POST /api/documents/requirements
// @access  Private (Admin/University)
router.post('/requirements', protect, authorize('admin', 'university'), async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { title, description, type, course_id, university_id, is_required, deadline } = req.body;

        const result = await query(`
            INSERT INTO documents (
                title, description, type, status, is_required, deadline, 
                course_id, university_id, uploaded_by_id, created_at, updated_at
            ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *, id as _id
        `, [
            title, description, type || 'other', is_required || false,
            deadline || null, course_id || null, university_id || null, userId
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const docId = req.params.id;
        const userId = req.user.id || req.user._id;
        const { title, description, status } = req.body;

        const result = await query(`
            UPDATE documents 
            SET title = COALESCE($1, title), 
                description = COALESCE($2, description), 
                status = COALESCE($3, status),
                updated_at = NOW()
            WHERE id = $4 AND (uploaded_by_id = $5 OR $6 = 'admin')
            RETURNING *, id as _id
        `, [title, description, status, docId, userId, req.user.role]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const docId = req.params.id;
        const userId = req.user.id || req.user._id;

        const result = await query(`
            DELETE FROM documents 
            WHERE id = $1 AND (uploaded_by_id = $2 OR $3 = 'admin')
            RETURNING id
        `, [docId, userId, req.user.role]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found or unauthorized' });
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private (Admin/University)
router.get('/stats', protect, authorize('admin', 'university'), async (req, res) => {
    try {
        const statusStats = await query(`
            SELECT status as _id, count(*) as count 
            FROM documents GROUP BY status
        `);

        const typeStats = await query(`
            SELECT type as _id, count(*) as count 
            FROM documents GROUP BY type
        `);

        res.json({
            statusStats: statusStats.rows,
            typeStats: typeStats.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;