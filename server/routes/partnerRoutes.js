const express = require('express');
const router = express.Router();
const { getPartnerStats, createDiscount, getDiscounts, requestPayout, getPartnerStudents, getPayoutHistory, registerStudent, deletePartnerStudent } = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware to check if user is partner
const checkPartner = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'partner') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a B2B Partner');
    }
};

router.get('/stats', protect, checkPartner, getPartnerStats);
router.get('/students', protect, checkPartner, getPartnerStudents);
router.delete('/students/:id', protect, checkPartner, deletePartnerStudent);
router.post('/register-student', protect, checkPartner, registerStudent);
router.get('/payouts', protect, checkPartner, getPayoutHistory);
router.route('/discounts')
    .post(protect, checkPartner, createDiscount)
    .get(protect, checkPartner, getDiscounts);

router.post('/payout', protect, checkPartner, upload.single('screenshot'), requestPayout);

module.exports = router;
