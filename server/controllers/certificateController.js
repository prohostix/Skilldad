const { query } = require('../config/postgres');
const FileUploadService = require('../services/FileUploadService');
const notificationService = require('../services/NotificationService');
const { v4: uuidv4 } = require('uuid');

// Notify the student that their certificate is ready, once a certificate transitions to ISSUED
const notifyCertificateIssued = async (certificate) => {
    try {
        const [studentRes, courseRes] = await Promise.all([
            query('SELECT id, name, email, phone, profile FROM users WHERE id = $1', [certificate.student_id]),
            query('SELECT title FROM courses WHERE id = $1', [certificate.course_id])
        ]);
        const student = studentRes.rows[0];
        if (!student) return;

        let phone = student.phone;
        if (!phone && student.profile) {
            const profile = typeof student.profile === 'string' ? JSON.parse(student.profile) : student.profile;
            phone = profile?.phone;
        }

        await notificationService.send(
            { _id: student.id, name: student.name, email: student.email, phone },
            'courseCompletion',
            { courseTitle: courseRes.rows[0]?.title || 'Your Course', certUrl: certificate.file_url }
        );
    } catch (error) {
        console.error('[Certificate] Failed to send completion notification:', error.message);
    }
};

/**
 * @desc    Apply for a certificate
 * @route   POST /api/certificates/apply
 * @access  Private (Student)
 */
const applyForCertificate = async (req, res) => {
    try {
        const { courseId, notes } = req.body;
        const studentId = req.user.id;

        // 1. Check if course exists
        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rowCount === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const course = courseRes.rows[0];

        // 2. Check if student is enrolled and has 100% progress
        // Note: Progress is often tracked in progress table or enrollment metadata
        // In this project, it seems enrollment tracks progress
        const enrollmentRes = await query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );

        if (enrollmentRes.rowCount === 0) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }

        const enrollment = enrollmentRes.rows[0];
        const progressVal = Number(enrollment.progress || 0);
        
        if (progressVal < 100) {
            return res.status(400).json({ 
                message: `Course completion is only ${progressVal}%. You must reach 100% to apply for a certificate.`,
                currentProgress: progressVal
            });
        }

        // 3. Check for existing request
        const existingRes = await query(
            'SELECT * FROM certificates WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (existingRes.rowCount > 0) {
            return res.status(400).json({ message: 'Certificate request already exists for this course' });
        }

        // 4. Create request
        const id = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
        let universityId = course.instructor_id || course.submitted_by;

        if (!universityId) {
            // Fallback: assign to the first available admin if no instructor/submitter is linked
            const adminRes = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
            if (adminRes.rowCount > 0) {
                universityId = adminRes.rows[0].id;
            } else {
                return res.status(400).json({ message: 'Course is not currently associated with a University partner for certification.' });
            }
        }

        await query(
            'INSERT INTO certificates (id, student_id, course_id, university_id, notes) VALUES ($1, $2, $3, $4, $5)',
            [id, studentId, courseId, universityId, notes || '']
        );

        res.status(201).json({ message: 'Certificate application submitted successfully', certificateId: id });
    } catch (error) {
        console.error('Apply Certificate Error:', error);
        res.status(500).json({ message: 'Server error while applying for certificate' });
    }
};

/**
 * @desc    Get my certificates
 * @route   GET /api/certificates/my
 * @access  Private (Student)
 */
const getMyCertificates = async (req, res) => {
    try {
        const studentId = req.user.id;
        const certsRes = await query(`
            SELECT c.*, cr.title as course_title, cr.thumbnail as course_thumbnail, cr.university_name as provider_name, u_uni.name as university_name
            FROM certificates c
            JOIN courses cr ON c.course_id = cr.id
            LEFT JOIN users u_uni ON c.university_id = u_uni.id
            WHERE c.student_id = $1
            ORDER BY c.created_at DESC
        `, [studentId]);

        res.json(certsRes.rows);
    } catch (error) {
        console.error('Get My Certificates Error:', error);
        res.status(500).json({ message: 'Server error while fetching certificates' });
    }
};

/**
 * @desc    Get certificate requests for university
 * @route   GET /api/certificates/university/requests
 * @access  Private (University)
 */
const getUniversityRequests = async (req, res) => {
    try {
        const universityId = req.user.id;
        const certsRes = await query(`
            SELECT c.*, u.name as student_name, u.email as student_email, u.profile as student_profile, cr.title as course_title
            FROM certificates c
            JOIN users u ON c.student_id = u.id
            JOIN courses cr ON c.course_id = cr.id
            WHERE c.university_id = $1
            ORDER BY c.created_at DESC
        `, [universityId]);

        res.json(certsRes.rows);
    } catch (error) {
        console.error('Get University Requests Error:', error);
        res.status(500).json({ message: 'Server error while fetching requests' });
    }
};

/**
 * @desc    Update certificate status
 * @route   PUT /api/certificates/:id/status
 * @access  Private (University/Admin)
 */
const updateCertificateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        // Validate status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ISSUED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateFields = ['status = $1', 'updated_at = NOW()'];
        const values = [status, id];
        let paramIndex = 3;

        if (notes) {
            updateFields.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }

        if (status === 'APPROVED') {
            updateFields.push(`approval_date = NOW()`);
        } else if (status === 'ISSUED') {
            updateFields.push(`issue_date = NOW()`);
        }

        const queryText = `UPDATE certificates SET ${updateFields.join(', ')} WHERE id = $2 RETURNING *`;
        const certRes = await query(queryText, values);

        if (certRes.rowCount === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (status === 'ISSUED') {
            notifyCertificateIssued(certRes.rows[0]).catch(() => {});
        }

        res.json({ message: 'Certificate status updated', certificate: certRes.rows[0] });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

/**
 * @desc    Upload certificate file
 * @route   POST /api/certificates/:id/upload
 * @access  Private (University/Admin)
 */
const uploadCertificateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1. Check certificate existence
        const certRes = await query('SELECT * FROM certificates WHERE id = $1', [id]);
        if (certRes.rowCount === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // 2. Upload to storage (using FileUploadService logic)
        const path = require('path');
        const ext = file.originalname ? path.extname(file.originalname).toLowerCase() : '.pdf';
        const filename = `CERT-${id}-${Date.now()}${ext || '.pdf'}`;
        const relativePath = `certificates/${id}/${filename}`;
        
        // Use FileUploadService's internal validation / upload logic if possible
        const uploadResult = await FileUploadService.uploadToLocal(file, relativePath);

        // 3. Update DB
        const updatedRes = await query(
            'UPDATE certificates SET file_url = $1, status = $2, issue_date = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *',
            [uploadResult.url, 'ISSUED', id]
        );

        notifyCertificateIssued(updatedRes.rows[0]).catch(() => {});

        res.json({ message: 'Certificate uploaded and issued successfully', url: uploadResult.url });
    } catch (error) {
        console.error('Upload Certificate Error:', error);
        res.status(500).json({ message: 'Server error while uploading certificate' });
    }
};

/**
 * @desc    Get all certificates (Admin)
 * @route   GET /api/certificates/admin/all
 * @access  Private (Admin)
 */
const getAllCertificates = async (req, res) => {
    try {
        const userRole = req.user.role?.toLowerCase();
        const userId = req.user.id;
        const { studentId } = req.query;
        
        let queryStr = `
            SELECT c.*, u.name as student_name, cr.title as course_title, uni.name as university_name
            FROM certificates c
            JOIN users u ON c.student_id = u.id
            JOIN courses cr ON c.course_id = cr.id
            JOIN users uni ON c.university_id = uni.id
            WHERE 1=1
        `;
        let queryParams = [];

        if (userRole === 'partner') {
            queryParams.push(userId);
            queryStr += ` AND u.registered_by = $${queryParams.length}`;
        }

        if (studentId) {
            queryParams.push(studentId);
            queryStr += ` AND c.student_id = $${queryParams.length}`;
        }

        queryStr += ` ORDER BY c.created_at DESC`;

        const certsRes = await query(queryStr, queryParams);
        res.json(certsRes.rows);
    } catch (error) {
        console.error('Get All Certificates Error:', error);
        res.status(500).json({ message: 'Server error while fetching all certificates' });
    }
};

module.exports = {
    applyForCertificate,
    getMyCertificates,
    getUniversityRequests,
    updateCertificateStatus,
    uploadCertificateFile,
    getAllCertificates
};
