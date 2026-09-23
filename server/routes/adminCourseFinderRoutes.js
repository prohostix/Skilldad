const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    listQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    moveAnswer,
    getTagSuggestions,
    getAnalytics
} = require('../controllers/adminCourseFinderController');

router.use(protect, admin);

router.get('/questions', listQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/:id/duplicate', duplicateQuestion);
router.put('/questions/:id/move', moveQuestion);

router.post('/questions/:questionId/answers', createAnswer);
router.put('/answers/:id', updateAnswer);
router.delete('/answers/:id', deleteAnswer);
router.put('/answers/:id/move', moveAnswer);

router.get('/tag-suggestions', getTagSuggestions);
router.get('/analytics', getAnalytics);

module.exports = router;
