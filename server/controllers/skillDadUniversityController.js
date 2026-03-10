const { query } = require('../config/postgres');

// @desc    Get all SkillDad universities
// @route   GET /api/admin/skilldad-universities
// @access  Private (Admin)
const getSkillDadUniversities = async (req, res) => {
    try {
        const result = await query('SELECT * FROM skill_dad_universities ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching SkillDad universities:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new SkillDad university
// @route   POST /api/admin/skilldad-universities
// @access  Private (Admin)
const createSkillDadUniversity = async (req, res) => {
    try {
        const { name, location, website, phone, email, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'University name is required' });
        }

        const result = await query(
            'INSERT INTO skill_dad_universities (name, location, website, phone, email, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, location, website, phone, email, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating SkillDad university:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a SkillDad university
// @route   PUT /api/admin/skilldad-universities/:id
// @access  Private (Admin)
const updateSkillDadUniversity = async (req, res) => {
    try {
        const { name, location, website, phone, email, description, isActive } = req.body;
        const result = await query(`
            UPDATE skill_dad_universities 
            SET name = COALESCE($1, name), location = COALESCE($2, location), website = COALESCE($3, website), 
                phone = COALESCE($4, phone), email = COALESCE($5, email), description = COALESCE($6, description), 
                is_active = COALESCE($7, is_active), updated_at = NOW()
            WHERE id = $8 RETURNING *
        `, [name, location, website, phone, email, description, isActive, req.params.id]);

        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating SkillDad university:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a SkillDad university
// @route   DELETE /api/admin/skilldad-universities/:id
// @access  Private (Admin)
const deleteSkillDadUniversity = async (req, res) => {
    try {
        const result = await query('DELETE FROM skill_dad_universities WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });
        res.json({ message: 'University deleted successfully' });
    } catch (error) {
        console.error('Error deleting SkillDad university:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSkillDadUniversities,
    createSkillDadUniversity,
    updateSkillDadUniversity,
    deleteSkillDadUniversity,
};
