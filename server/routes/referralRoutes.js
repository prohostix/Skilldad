const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMyReferralCode,
    getMyReferrals,
    getMyRewardPoints,
    applyReferralCode
} = require('../controllers/referralController');

// All routes require authentication
router.use(protect);

router.get('/my-code', getMyReferralCode);       // Get/generate my referral code
router.get('/my-referrals', getMyReferrals);     // Get list of people I referred
router.get('/my-points', getMyRewardPoints);     // Get reward point balance + history
router.post('/apply', applyReferralCode);        // Apply a referral code (called at registration)

module.exports = router;
