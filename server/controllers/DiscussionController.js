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

// @desc    Add a discussion message (or a reply, when parentId is given)
// @route   POST /api/discussions
const addDiscussion = asyncHandler(async (req, res) => {
    const { courseId, videoId, content, parentId } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    const userProfileImage = req.user.profile_image;

    if (!content) {
        res.status(400);
        throw new Error('Please add content');
    }

    const id = `disc_${Date.now()}`;
    const result = await query(`
        INSERT INTO discussions (id, course_id, video_id, user_id, user_name, user_profile_image, content, parent_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
    `, [id, courseId, videoId, userId, userName, userProfileImage, content, parentId || null]);

    res.status(201).json({ ...result.rows[0], _id: result.rows[0].id });
});

// @desc    Toggle the current user's like on a discussion message
// @route   PUT /api/discussions/:id/like
const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await query('SELECT liked_by FROM discussions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    const likedBy = Array.isArray(existing.rows[0].liked_by) ? existing.rows[0].liked_by : [];
    const alreadyLiked = likedBy.includes(userId);
    const updatedLikedBy = alreadyLiked
        ? likedBy.filter(uid => uid !== userId)
        : [...likedBy, userId];

    const result = await query(
        'UPDATE discussions SET liked_by = $1::jsonb WHERE id = $2 RETURNING liked_by',
        [JSON.stringify(updatedLikedBy), id]
    );

    res.json({ likedBy: result.rows[0].liked_by });
});

module.exports = {
    getDiscussions,
    addDiscussion,
    toggleLike,
};
