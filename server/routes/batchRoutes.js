const express = require('express');
const router = express.Router();
const { 
    createBatch, 
    getCourseBatches, 
    updateBatch,
    deleteBatch 
} = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBatch);

router.route('/course/:courseId')
    .get(getCourseBatches);

router.route('/:id')
    .put(protect, updateBatch)
    .delete(protect, deleteBatch);

module.exports = router;
