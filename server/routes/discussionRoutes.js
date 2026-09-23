const express = require('express');
const router = express.Router();
const { getDiscussions, addDiscussion, toggleLike } = require('../controllers/DiscussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId/:videoId', protect, getDiscussions);
router.post('/', protect, addDiscussion);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
