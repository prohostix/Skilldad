const { query } = require('../config/postgres');

// Frontend expects Mongo-style `_id`; DB uses a plain integer `id`.
const withId = (row) => row && { ...row, _id: row.id };

// @desc    Get all SkillDad universities
// @route   GET /api/admin/skilldad-universities
// @access  Private (Admin)
const getSkillDadUniversities = async (req, res) => {
    try {
        const result = await query('SELECT * FROM skill_dad_universities ORDER BY created_at DESC');
        res.json(result.rows.map(withId));
    } catch (error) {
        console.error('Error fetching SkillDad universities:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single SkillDad university
// @route   GET /api/admin/skilldad-universities/:id
// @access  Private (Admin)
const getSkillDadUniversityById = async (req, res) => {
    try {
        const result = await query('SELECT * FROM skill_dad_universities WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });
        res.json(withId(result.rows[0]));
    } catch (error) {
        console.error('Error fetching SkillDad university:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new SkillDad university
// @route   POST /api/admin/skilldad-universities
// @access  Private (Admin)
const createSkillDadUniversity = async (req, res) => {
    try {
        const { 
            name, location, website, phone, email, description,
            badge, foundation_year, total_scholars, specialized_courses,
            quality_rating, career_success, global_network,
            youtubeUrl, achievements, assignedCourses, certificates
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'University name is required' });
        }

        const result = await query(
            `INSERT INTO skill_dad_universities (
                name, location, website, phone, email, description,
                badge, foundation_year, total_scholars, specialized_courses,
                quality_rating, career_success, global_network,
                youtube_url, achievements, assigned_courses, certificates
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [
                name, location, website, phone, email, description,
                badge, foundation_year, total_scholars, specialized_courses,
                quality_rating, career_success, global_network,
                youtubeUrl,
                achievements ? JSON.stringify(achievements) : '[]',
                assignedCourses ? JSON.stringify(assignedCourses) : '[]',
                certificates ? JSON.stringify(certificates) : '[]'
            ]
        );

        res.status(201).json(withId(result.rows[0]));
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
        const { 
            name, location, website, phone, email, description, isActive,
            badge, foundation_year, total_scholars, specialized_courses,
            quality_rating, career_success, global_network,
            youtubeUrl, achievements, assignedCourses, certificates
        } = req.body;
        const result = await query(`
            UPDATE skill_dad_universities 
            SET name = COALESCE($1, name), location = COALESCE($2, location), website = COALESCE($3, website), 
                phone = COALESCE($4, phone), email = COALESCE($5, email), description = COALESCE($6, description), 
                is_active = COALESCE($7, is_active), 
                badge = COALESCE($8, badge), foundation_year = COALESCE($9, foundation_year),
                total_scholars = COALESCE($10, total_scholars), specialized_courses = COALESCE($11, specialized_courses),
                quality_rating = COALESCE($12, quality_rating), career_success = COALESCE($13, career_success),
                global_network = COALESCE($14, global_network),
                youtube_url = COALESCE($15, youtube_url),
                achievements = COALESCE($16, achievements),
                assigned_courses = COALESCE($17, assigned_courses),
                certificates = COALESCE($18, certificates),
                updated_at = NOW()
            WHERE id = $19 RETURNING *
        `, [
            name, location, website, phone, email, description, isActive,
            badge, foundation_year, total_scholars, specialized_courses,
            quality_rating, career_success, global_network,
            youtubeUrl,
            achievements ? JSON.stringify(achievements) : null,
            assignedCourses ? JSON.stringify(assignedCourses) : null,
            certificates ? JSON.stringify(certificates) : null,
            req.params.id
        ]);

        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });
        res.json(withId(result.rows[0]));
    } catch (error) {
        console.error('Error updating SkillDad university:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload SkillDad university profile image (logo)
// @route   POST /api/admin/skilldad-universities/:id/upload-image
// @access  Private (Admin)
const uploadSkillDadUniversityProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE skill_dad_universities SET profile_image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [imagePath, req.params.id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });

        res.json({
            message: 'University profile image updated',
            profileImage: imagePath
        });
    } catch (error) {
        console.error('[uploadSkillDadUniversityProfileImage] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading image' });
    }
};

// @desc    Upload SkillDad university cover image
// @route   POST /api/admin/skilldad-universities/:id/upload-cover
// @access  Private (Admin)
const uploadSkillDadUniversityCoverImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imagePath = `/uploads/${req.file.filename}`;
        const result = await query(
            'UPDATE skill_dad_universities SET cover_image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [imagePath, req.params.id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'University not found' });

        res.json({
            message: 'University cover image updated',
            coverImage: imagePath
        });
    } catch (error) {
        console.error('[uploadSkillDadUniversityCoverImage] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading cover image' });
    }
};

// @desc    Upload SkillDad university gallery images
// @route   POST /api/admin/skilldad-universities/:id/upload-gallery
// @access  Private (Admin)
const uploadSkillDadUniversityGalleryImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload images' });
        }

        const existingRes = await query('SELECT gallery FROM skill_dad_universities WHERE id = $1', [req.params.id]);
        if (existingRes.rowCount === 0) return res.status(404).json({ message: 'University not found' });

        const currentGallery = existingRes.rows[0].gallery || [];
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        const updatedGallery = [...currentGallery, ...newImages];

        await query(
            'UPDATE skill_dad_universities SET gallery = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(updatedGallery), req.params.id]
        );

        res.json({
            message: `${req.files.length} images added to gallery`,
            gallery: updatedGallery
        });
    } catch (error) {
        console.error('[uploadSkillDadUniversityGalleryImages] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading gallery' });
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

// @desc    Upload SkillDad university certificates
// @route   POST /api/admin/skilldad-universities/:id/upload-certificates
// @access  Private (Admin)
const uploadSkillDadUniversityCertificates = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload certificate images' });
        }

        const existingRes = await query('SELECT certificates FROM skill_dad_universities WHERE id = $1', [req.params.id]);
        if (existingRes.rowCount === 0) return res.status(404).json({ message: 'University not found' });

        const currentCertificates = existingRes.rows[0].certificates || [];
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        const updatedCertificates = [...currentCertificates, ...newImages];

        await query(
            'UPDATE skill_dad_universities SET certificates = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(updatedCertificates), req.params.id]
        );

        res.json({
            message: `${req.files.length} certificates added`,
            certificates: updatedCertificates
        });
    } catch (error) {
        console.error('[uploadSkillDadUniversityCertificates] Error:', error);
        res.status(500).json({ message: error.message || 'Server error uploading certificates' });
    }
};

module.exports = {
    getSkillDadUniversities,
    getSkillDadUniversityById,
    createSkillDadUniversity,
    updateSkillDadUniversity,
    deleteSkillDadUniversity,
    uploadSkillDadUniversityProfileImage,
    uploadSkillDadUniversityCoverImage,
    uploadSkillDadUniversityGalleryImages,
    uploadSkillDadUniversityCertificates,
};
