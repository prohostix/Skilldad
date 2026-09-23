const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

const VALID_CARD_IDS = ['skill_courses', 'skill_integrated_diploma', 'wbl', 'study_abroad'];

// @desc    Get the current cover image (if any) for each of the 4 fixed
//          category cards on the course catalog page
// @route   GET /api/catalog-cards
const getCategoryCards = asyncHandler(async (req, res) => {
    const result = await query('SELECT id, image_path FROM catalog_category_cards');
    const cards = {};
    result.rows.forEach(row => {
        cards[row.id] = row.image_path;
    });
    res.json(cards);
});

// @desc    Replace the cover image for one category card
// @route   POST /api/catalog-cards/:id/upload
const uploadCategoryCardImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!VALID_CARD_IDS.includes(id)) {
        return res.status(400).json({ message: 'Invalid category card id' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Please select an image file to upload' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    await query(
        'UPDATE catalog_category_cards SET image_path = $1, updated_at = NOW() WHERE id = $2',
        [imagePath, id]
    );

    res.json({ message: 'Category card image updated', id, imagePath });
});

module.exports = { getCategoryCards, uploadCategoryCardImage };
