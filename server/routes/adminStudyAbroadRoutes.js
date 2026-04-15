const express = require('express');
const router = express.Router();
const {
    getCountries,
    addCountry,
    updateCountry,
    deleteCountry,
    getUniversitiesByCountry,
    addUniversity,
    updateUniversity,
    deleteUniversity,
    getCoursesByUniversity,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/studyAbroadController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

// Countries
router.get('/countries', getCountries);
router.post('/countries', addCountry);
router.put('/countries/:id', updateCountry);
router.delete('/countries/:id', deleteCountry);

// Universities
router.get('/countries/:countryId/universities', getUniversitiesByCountry);
router.post('/universities', addUniversity);
router.put('/universities/:id', updateUniversity);
router.delete('/universities/:id', deleteUniversity);

// Courses
router.get('/universities/:universityId/courses', getCoursesByUniversity);
router.post('/courses', addCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
