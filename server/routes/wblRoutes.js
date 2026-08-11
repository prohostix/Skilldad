const express = require('express');
const router = express.Router();
const wblController = require('../controllers/wblController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/courses', wblController.getCourses);

// Admin routes
router.post('/courses', protect, admin, wblController.addCourse);
router.put('/courses/:id', protect, admin, wblController.updateCourse);
router.delete('/courses/:id', protect, admin, wblController.deleteCourse);

module.exports = router;
