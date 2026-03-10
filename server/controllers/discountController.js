const { query } = require('../config/postgres');

// @desc    Validate a discount code
// @route   POST /api/discount/validate
// @access  Protected
const validateDiscount = async (req, res) => {
    try {
        const { code, courseId } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Discount code is required' });
        }

        const result = await query(`
            SELECT * FROM discounts 
            WHERE code = $1 AND active = true 
            /* AND (expiry_date > NOW() OR expiry_date IS NULL) */
        `, [code.toUpperCase()]);

        const discount = result.rows[0];

        if (!discount) {
            return res.status(404).json({ message: 'Invalid or expired discount code' });
        }

        res.json(discount);
    } catch (error) {
        console.error('Discount validation error:', error);
        res.status(500).json({ message: 'Server error validating discount code' });
    }
};

// @desc    Create a new discount code
// @route   POST /api/discount
// @access  Protected/Admin
const createDiscount = async (req, res) => {
    try {
        const { code, type, value, expiryDate, partner } = req.body;

        const checkResult = await query('SELECT * FROM discounts WHERE code = $1', [code.toUpperCase()]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'Discount code already exists' });
        }

        const id = `disc_${Date.now()}`;
        const result = await query(`
            INSERT INTO discounts (id, code, type, value, partner_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `, [id, code.toUpperCase(), type || 'percentage', value, partner || null]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create discount error:', error);
        res.status(500).json({ message: 'Server error creating discount code' });
    }
};

// @desc    Get all discount codes
// @route   GET /api/discount
// @access  Protected/Admin
const getDiscounts = async (req, res) => {
    try {
        const result = await query('SELECT * FROM discounts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get discounts error:', error);
        res.status(500).json({ message: 'Server error fetching discounts' });
    }
};

module.exports = { validateDiscount, createDiscount, getDiscounts };
