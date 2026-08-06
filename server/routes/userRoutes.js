const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    updateProfile,
    updatePassword,
    uploadProfileImage,
    uploadCoverImage,
    forgotPassword,
    resetPassword,
    updateUserStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.get('/', protect, getUsers);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.post('/upload-cover-image', protect, upload.single('coverImage'), uploadCoverImage);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/:id/status', protect, updateUserStatus);

module.exports = router;
