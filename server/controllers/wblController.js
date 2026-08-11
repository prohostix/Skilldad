const { query } = require('../config/postgres');
const crypto = require('crypto');

exports.getCourses = async (req, res) => {
    try {
        const { category } = req.query; // 'domestic' or 'abroad'
        let sql = 'SELECT * FROM wbl_courses';
        const params = [];
        if (category) {
            sql += ' WHERE category = $1';
            params.push(category);
        }
        sql += ' ORDER BY created_at DESC';
        const result = await query(sql, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching WBL courses:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { category, title, university_name, location, duration, fees, description } = req.body;
        const id = crypto.randomUUID();
        const result = await query(
            'INSERT INTO wbl_courses (id, category, title, university_name, location, duration, fees, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, category, title, university_name, location, duration, fees, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding WBL course:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, title, university_name, location, duration, fees, description, is_active } = req.body;
        const result = await query(
            'UPDATE wbl_courses SET category = $1, title = $2, university_name = $3, location = $4, duration = $5, fees = $6, description = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
            [category, title, university_name, location, duration, fees, description, is_active, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'WBL course not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating WBL course:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM wbl_courses WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'WBL course not found' });
        }
        res.status(200).json({ message: 'WBL Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting WBL course:', error);
        res.status(500).json({ message: error.message });
    }
};
