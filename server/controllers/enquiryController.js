const { query } = require('../config/postgres');

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
        res.status(400);
        throw new Error('Please provide name, email and phone');
    }

    const result = await query(
        'INSERT INTO enquiries (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone, message]
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

module.exports = {
    createEnquiry,
    getEnquiries,
};
