const asyncHandler = require('express-async-handler');

// @desc    Upload media file
// @route   POST /api/upload/media
// @access  Private
const uploadMedia = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }
    // Return the URL path to the uploaded file
    res.status(200).json({
        url: `/uploads/${req.file.filename}`
    });
});

module.exports = {
    uploadMedia
};
