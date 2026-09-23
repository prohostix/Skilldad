const express = require('express');
const router = express.Router();
const { getCategoryCards, uploadCategoryCardImage } = require('../controllers/catalogCardController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getCategoryCards);
router.route('/:id/upload').post(protect, admin, upload.single('image'), uploadCategoryCardImage);

module.exports = router;
