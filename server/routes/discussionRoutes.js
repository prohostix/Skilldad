const express = require('express');
const router = express.Router();
const { getDiscussions, addDiscussion } = require('../controllers/DiscussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:courseId/:videoId', protect, getDiscussions);
router.post('/', protect, addDiscussion);

module.exports = router;
