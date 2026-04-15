const { query } = require('../config/postgres');
const crypto = require('crypto');

// --- Countries ---

exports.getCountries = async (req, res) => {
    try {
        const result = await query('SELECT * FROM study_abroad_countries ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCountry = async (req, res) => {
    try {
        const { name, image_url, description } = req.body;
        const id = crypto.randomUUID();
        const result = await query(
            'INSERT INTO study_abroad_countries (id, name, image_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, image_url, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image_url, description, is_active } = req.body;
        const result = await query(
            'UPDATE study_abroad_countries SET name = $1, image_url = $2, description = $3, is_active = $4 WHERE id = $5 RETURNING *',
            [name, image_url, description, is_active, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM study_abroad_countries WHERE id = $1', [id]);
        res.status(200).json({ message: 'Country deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Universities ---

exports.getUniversitiesByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;
        const result = await query(
            'SELECT * FROM study_abroad_universities WHERE country_id = $1 ORDER BY name ASC',
            [countryId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addUniversity = async (req, res) => {
    try {
        const { country_id, name, logo_url, website_url, description, location } = req.body;
        const id = crypto.randomUUID();
        const result = await query(
            'INSERT INTO study_abroad_universities (id, country_id, name, logo_url, website_url, description, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, country_id, name, logo_url, website_url, description, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo_url, website_url, description, location } = req.body;
        const result = await query(
            'UPDATE study_abroad_universities SET name = $1, logo_url = $2, website_url = $3, description = $4, location = $5 WHERE id = $6 RETURNING *',
            [name, logo_url, website_url, description, location, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUniversity = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM study_abroad_universities WHERE id = $1', [id]);
        res.status(200).json({ message: 'University deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Courses ---

exports.getCoursesByUniversity = async (req, res) => {
    try {
        const { universityId } = req.params;
        const result = await query(
            'SELECT * FROM study_abroad_courses WHERE university_id = $1 ORDER BY name ASC',
            [universityId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { university_id, name, level, duration, fees, requirements, description, intakes } = req.body;
        const id = crypto.randomUUID();
        const result = await query(
            'INSERT INTO study_abroad_courses (id, university_id, name, level, duration, fees, requirements, description, intakes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id, university_id, name, level, duration, fees, requirements, description, intakes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, duration, fees, requirements, description, intakes, is_active } = req.body;
        const result = await query(
            'UPDATE study_abroad_courses SET name = $1, level = $2, duration = $3, fees = $4, requirements = $5, description = $6, intakes = $7, is_active = $8 WHERE id = $9 RETURNING *',
            [name, level, duration, fees, requirements, description, intakes, is_active, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM study_abroad_courses WHERE id = $1', [id]);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT c.*, u.name as "universityName", u.logo_url as "universityLogo", u.location as "universityLocation", co.name as "countryName"
             FROM study_abroad_courses c
             JOIN study_abroad_universities u ON c.university_id = u.id
             JOIN study_abroad_countries co ON u.country_id = co.id
             WHERE c.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
