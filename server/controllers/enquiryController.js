const { query } = require('../config/postgres');

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res) => {
    const { name, email, phone, message, courseId, courseName, universityName } = req.body;

    if (!name || !email || !phone) {
        res.status(400);
        throw new Error('Please provide name, email and phone');
    }

    const result = await query(
        'INSERT INTO enquiries (name, email, phone, message, course_id, course_name, university_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, phone, message || null, courseId || null, courseName || null, universityName || null]
    );

    if (result.rows.length > 0) {
        res.status(201).json(result.rows[0]);
    } else {
        res.status(400);
        throw new Error('Invalid enquiry data');
    }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
const getEnquiries = async (req, res) => {
    const result = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(result.rows);
};

// @desc    Update an enquiry's status
// @route   PUT /api/enquiries/:id
// @access  Private/Admin
const updateEnquiryStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'closed'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const result = await query(
        'UPDATE enquiries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, req.params.id]
    );

    if (result.rows.length === 0) {
        res.status(404);
        throw new Error('Enquiry not found');
    }

    res.json(result.rows[0]);
};

module.exports = {
    createEnquiry,
    getEnquiries,
    updateEnquiryStatus,
};
