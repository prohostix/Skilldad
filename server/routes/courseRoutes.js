const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    addVideo,
    updateVideo,
    deleteVideo,
    addExercise,
    getAdminCourses,
    uploadThumbnail,
    uploadBrochure,
    approveCourse,
    uploadLessonVideo,
    uploadLessonFile,
    uploadLessonDocument,
    saveModuleQuiz
} = require('../controllers/courseController');
const {
    linkZoomRecordingToVideo,
    getAvailableZoomRecordings,
    unlinkZoomRecordingFromVideo,
} = require('../controllers/courseZoomController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getCourses).post(protect, createCourse);
router.route('/admin').get(protect, getAdminCourses);
router.route('/:id/approve').put(protect, approveCourse);
router.route('/zoom-recordings/available').get(protect, getAvailableZoomRecordings);
router.route('/:id').get(optionalProtect, getCourse).put(protect, updateCourse).delete(protect, deleteCourse);
router.route('/:id/upload-thumbnail').post(protect, upload.single('thumbnail'), uploadThumbnail);
router.route('/:id/upload-brochure').post(protect, upload.single('brochure'), uploadBrochure);
router.route('/:id/modules').post(protect, addModule);
router.route('/:id/modules/:moduleId').put(protect, updateModule).delete(protect, deleteModule);
router.route('/:id/modules/:moduleId/videos').post(protect, addVideo);
router.route('/:id/modules/:moduleId/videos/:videoId').put(protect, updateVideo).delete(protect, deleteVideo);
router.route('/:id/modules/:moduleId/videos/:videoId/upload').post(protect, (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || err });
        next();
    });
}, uploadLessonVideo);

router.route('/:id/modules/:moduleId/videos/:videoId/files').post(protect, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || err });
        next();
    });
}, uploadLessonFile);

router.route('/:id/modules/:moduleId/upload-document').post(protect, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message || err });
        next();
    });
}, uploadLessonDocument);
router.route('/:id/modules/:moduleId/quiz').put(protect, saveModuleQuiz);
router.route('/:id/modules/:moduleId/videos/:videoId/exercises').post(protect, addExercise);
router.route('/:courseId/modules/:moduleIndex/videos/:videoIndex/link-zoom-recording').post(protect, linkZoomRecordingToVideo);
router.route('/:courseId/modules/:moduleIndex/videos/:videoIndex/unlink-zoom-recording').delete(protect, unlinkZoomRecordingFromVideo);

module.exports = router;
