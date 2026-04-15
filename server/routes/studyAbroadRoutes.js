const express = require('express');
const router = express.Router();
const {
    getCountries,
    getUniversitiesByCountry,
    getCoursesByUniversity,
    getCourseDetails
} = require('../controllers/studyAbroadController');

router.get('/countries', getCountries);
router.get('/countries/:countryId/universities', getUniversitiesByCountry);
router.get('/universities/:universityId/courses', getCoursesByUniversity);
router.get('/courses/:id', getCourseDetails);

module.exports = router;
