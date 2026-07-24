const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

/**
 * @desc    Create a new batch for a course
 * @route   POST /api/batches
 * @access  Private (Instructor/Admin)
 */
const createBatch = asyncHandler(async (req, res) => {
    const { courseId, name } = req.body;

    if (!courseId || !name) {
        res.status(400);
        throw new Error('Course ID and batch name are required');
    }

    // 1. Verify course existence and instructor ownership (if not admin)
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to create batches for this course');
    }

    // 2. Insert batch
    const result = await query(
        'INSERT INTO batches (course_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [courseId, name]
    );

    res.status(201).json(result.rows[0]);
});

/**
 * @desc    Get all batches for a course
 * @route   GET /api/batches/course/:courseId
 * @access  Public
 */
const getCourseBatches = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const result = await query(
        'SELECT * FROM batches WHERE course_id = $1 ORDER BY created_at ASC',
        [courseId]
    );

    res.json(result.rows);
});

/**
 * @desc    Delete a batch
 * @route   DELETE /api/batches/:id
 * @access  Private (Instructor/Admin)
 */
const deleteBatch = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Verify batch existence and course ownership
    const batchRes = await query(`
        SELECT b.*, c.instructor_id 
        FROM batches b 
        JOIN courses c ON b.course_id = c.id 
        WHERE b.id = $1
    `, [id]);

    if (batchRes.rows.length === 0) {
        res.status(404);
        throw new Error('Batch not found');
    }

    if (req.user.role !== 'admin' && batchRes.rows[0].instructor_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to delete this batch');
    }

    // 2. Delete batch
    await query('DELETE FROM batches WHERE id = $1', [id]);

    res.json({ message: 'Batch removed successfully' });
});

/**
 * @desc    Update a batch
 * @route   PUT /api/batches/:id
 * @access  Private (Instructor/Admin)
 */
const updateBatch = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Batch name is required');
    }

    // 1. Verify batch existence and course ownership
    const batchRes = await query(`
        SELECT b.*, c.instructor_id 
        FROM batches b 
        JOIN courses c ON b.course_id = c.id 
        WHERE b.id = $1
    `, [id]);

    if (batchRes.rows.length === 0) {
        res.status(404);
        throw new Error('Batch not found');
    }

    if (req.user.role !== 'admin' && batchRes.rows[0].instructor_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this batch');
    }

    // 2. Update batch
    const result = await query(
        'UPDATE batches SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
    );

    res.json(result.rows[0]);
});

/**
 * @desc    Activate or deactivate a batch
 * @route   PATCH /api/batches/:id/status
 * @access  Private (Instructor/Admin)
 */
const toggleBatchStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        res.status(400);
        throw new Error('isActive (boolean) is required');
    }

    // 1. Verify batch existence and course ownership
    const batchRes = await query(`
        SELECT b.*, c.instructor_id
        FROM batches b
        JOIN courses c ON b.course_id = c.id
        WHERE b.id = $1
    `, [id]);

    if (batchRes.rows.length === 0) {
        res.status(404);
        throw new Error('Batch not found');
    }

    if (req.user.role !== 'admin' && batchRes.rows[0].instructor_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this batch');
    }

    // 2. Update status. Deactivating only stops the batch from being offered
    // for new enrollments/exam/session targeting going forward — it does not
    // touch students already assigned to it, their enrollments, or content
    // already published to them.
    const result = await query(
        'UPDATE batches SET is_active = $1 WHERE id = $2 RETURNING *',
        [isActive, id]
    );

    res.json(result.rows[0]);
});

module.exports = {
    createBatch,
    getCourseBatches,
    updateBatch,
    deleteBatch,
    toggleBatchStatus
};
