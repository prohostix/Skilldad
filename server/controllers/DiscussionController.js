const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

// @desc    Get all discussions for a video
// @route   GET /api/discussions/:courseId/:videoId
const getDiscussions = asyncHandler(async (req, res) => {
    const { courseId, videoId } = req.params;

    const result = await query(`
        SELECT * FROM discussions 
        WHERE course_id = $1 AND video_id = $2 
        ORDER BY created_at DESC
    `, [courseId, videoId]);

    res.json(result.rows.map(r => ({ ...r, _id: r.id })));
});

// @desc    Add a discussion message
// @route   POST /api/discussions
const addDiscussion = asyncHandler(async (req, res) => {
    const { courseId, videoId, content } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    const userProfileImage = req.user.profile_image;

    if (!content) {
        res.status(400);
        throw new Error('Please add content');
    }

    const id = `disc_${Date.now()}`;
    const result = await query(`
        INSERT INTO discussions (id, course_id, video_id, user_id, user_name, user_profile_image, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
    `, [id, courseId, videoId, userId, userName, userProfileImage, content]);

    res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
});

module.exports = {
    getDiscussions,
    addDiscussion,
};
