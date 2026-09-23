const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getActiveQuestions,
    startAttempt,
    getAttemptResponses,
    submitResponse,
    completeAttempt,
    getMyLatestResult,
    getAttemptResult,
    dismissInvitation,
    getMyStatus
} = require('../controllers/courseFinderController');

router.get('/status', protect, getMyStatus);
router.get('/questions', protect, getActiveQuestions);
router.post('/attempts', protect, startAttempt);
router.get('/attempts/:id/responses', protect, getAttemptResponses);
router.put('/attempts/:id/responses', protect, submitResponse);
router.post('/attempts/:id/complete', protect, completeAttempt);
router.get('/attempts/:id/result', protect, getAttemptResult);
router.get('/my-result', protect, getMyLatestResult);
router.put('/dismiss', protect, dismissInvitation);

module.exports = router;
