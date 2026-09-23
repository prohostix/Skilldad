const express = require('express');
const router = express.Router();
const { getCareerProgress, updateCareerGoal, updateInterviewPrep } = require('../controllers/careerProgressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/career-progress', protect, getCareerProgress);
router.put('/career-goal', protect, updateCareerGoal);
router.put('/interview-prep', protect, updateInterviewPrep);

module.exports = router;
