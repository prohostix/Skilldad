const express = require('express');
const router = express.Router();
const {
    createBatch,
    getCourseBatches,
    updateBatch,
    deleteBatch,
    toggleBatchStatus
} = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBatch);

router.route('/course/:courseId')
    .get(getCourseBatches);

router.route('/:id')
    .put(protect, updateBatch)
    .delete(protect, deleteBatch);

router.patch('/:id/status', protect, toggleBatchStatus);

module.exports = router;
