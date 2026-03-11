const { query } = require('../config/postgres');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM services WHERE is_active = true ORDER BY display_order ASC, created_at ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services for admin
// @route   GET /api/services/admin
// @access  Private/Admin
const getAdminServices = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM services ORDER BY category ASC, display_order ASC, created_at ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    try {
        const { 
            title, description, icon_name, features, 
            color_class, bg_class, details, sub_services, 
            category, display_order, is_active 
        } = req.body;

        const result = await query(
            `INSERT INTO services (
                title, description, icon_name, features, 
                color_class, bg_class, details, sub_services, 
                category, display_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                title, description, icon_name, JSON.stringify(features || []),
                color_class, bg_class, details, JSON.stringify(sub_services || []),
                category || 'main', display_order || 0, is_active !== false
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, description, icon_name, features, 
            color_class, bg_class, details, sub_services, 
            category, display_order, is_active 
        } = req.body;

        const result = await query(
            `UPDATE services SET 
                title = $1, description = $2, icon_name = $3, features = $4, 
                color_class = $5, bg_class = $6, details = $7, sub_services = $8, 
                category = $9, display_order = $10, is_active = $11, updated_at = NOW()
            WHERE id = $12 RETURNING *`,
            [
                title, description, icon_name, JSON.stringify(features || []),
                color_class, bg_class, details, JSON.stringify(sub_services || []),
                category, display_order, is_active, id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getAdminServices,
    createService,
    updateService,
    deleteService
};
