const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadMedia } = require('../controllers/uploadController');

router.post('/media', protect, admin, upload.single('file'), uploadMedia);

module.exports = router;
