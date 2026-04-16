
const asyncHandler = require('express-async-handler');
const { query } = require('../config/db');
const crypto = require('crypto');

// @desc    Get CMS content by page
// @route   GET /api/public/cms/:page
// @access  Public
const getPageContent = asyncHandler(async (req, res) => {
    const { page } = req.params;
    const result = await query('SELECT section_name, content_json FROM cms_content WHERE page_name = $1', [page]);
    
    // Transform rows into a section-key object
    const content = {};
    result.rows.forEach(row => {
        content[row.section_name] = row.content_json;
    });
    
    res.json(content);
});

// @desc    Update CMS content section
// @route   PUT /api/admin/cms/:page/:section
// @access  Private (Admin)
const updatePageContent = asyncHandler(async (req, res) => {
    const { page, section } = req.params;
    const { content } = req.body;

    const result = await query(`
        INSERT INTO cms_content (id, page_name, section_name, content_json, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (page_name, section_name) 
        DO UPDATE SET content_json = EXCLUDED.content_json, updated_at = NOW()
        RETURNING *
    `, [crypto.randomUUID(), page, section, JSON.stringify(content)]);

    res.json(result.rows[0]);
});

module.exports = {
    getPageContent,
    updatePageContent
};
