const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    getSkillDadUniversities,
    getSkillDadUniversityById,
    createSkillDadUniversity,
    updateSkillDadUniversity,
    deleteSkillDadUniversity,
    uploadSkillDadUniversityProfileImage,
    uploadSkillDadUniversityCoverImage,
    uploadSkillDadUniversityGalleryImages,
} = require('../controllers/skillDadUniversityController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getSkillDadUniversities)
    .post(createSkillDadUniversity);

router.route('/:id')
    .get(getSkillDadUniversityById)
    .put(updateSkillDadUniversity)
    .delete(deleteSkillDadUniversity);

router.post('/:id/upload-image', upload.single('profileImage'), uploadSkillDadUniversityProfileImage);
router.post('/:id/upload-cover', upload.single('coverImage'), uploadSkillDadUniversityCoverImage);
router.post('/:id/upload-gallery', upload.array('galleryImages', 10), uploadSkillDadUniversityGalleryImages);

module.exports = router;
