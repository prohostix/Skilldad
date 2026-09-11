const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

/**
 * @desc    Enroll in a course
 * @route   POST /api/enrollment/:courseId
 * @access  Private (Student)
 */
const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1. Check if course exists in PG
    const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
    const course = courseRes.rows[0];
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // 2. Check if already enrolled
    const existingRes = await query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [userId, courseId]);
    if (existingRes.rows.length > 0) {
        res.status(400);
        throw new Error('Already enrolled in this course');
    }

    // 3. Create enrollment in PG
    const { batchId } = req.body;
    const enrollmentId = `enroll_${Date.now()}`;
    await query(`
        INSERT INTO enrollments (id, student_id, course_id, status, progress, batch_id, created_at, updated_at)
        VALUES ($1, $2, $3, 'active', 0, $4, NOW(), NOW())
    `, [enrollmentId, userId, courseId, batchId || null]);

    // 4. Update student's universityId if course has instructor
    if (course.instructor_id) {
        const instRes = await query('SELECT role FROM users WHERE id = $1', [course.instructor_id]);
        if (instRes.rows[0]?.role === 'university') {
            await query('UPDATE users SET university_id = $1 WHERE id = $2', [course.instructor_id, userId]);
        }
    }

    res.status(201).json({ success: true, enrollmentId });
});

/**
 * @desc    Get enrolled courses for user
 */
const getMyCourses = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const enrollRes = await query(`
        SELECT e.*, c.title, c.thumbnail, c.category, c.modules, u.name as instructor_name, b.name as batch_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN batches b ON e.batch_id = b.id
        WHERE e.student_id = $1 AND e.status != 'inactive' AND (b.is_active IS NULL OR b.is_active = true)
    `, [userId]);

    const transformed = enrollRes.rows.map(row => {
        const rawModules = Array.isArray(row.modules) 
            ? row.modules 
            : (typeof row.modules === 'string' ? JSON.parse(row.modules || '[]') : []);
        const modules = Array.isArray(rawModules) ? rawModules : [];
        const totalModules = modules.length > 0 ? modules.length : (row.total_modules || 0);
        const completedVideos = Array.isArray(row.completed_videos) ? row.completed_videos : [];

        let completedModules = 0;
        if (totalModules > 0 && completedVideos.length > 0) {
            completedModules = modules.filter(m => {
                const vids = Array.isArray(m.videos) ? m.videos : [];
                if (vids.length === 0) return false;
                return vids.every(v => completedVideos.includes(v._id || v.id));
            }).length;
        } else {
            completedModules = row.completed_modules || 0;
        }

        return {
            ...row,
            _id: row.id,
            completedVideos,
            completedExercises: Array.isArray(row.completed_exercises) ? row.completed_exercises : [],
            totalModules,
            completedModules,
            course: {
                _id: row.course_id,
                title: row.title,
                thumbnail: row.thumbnail,
                category: row.category,
                modules,
                instructor: { name: row.instructor_name }
            }
        };
    });

    res.json(transformed);
});

/**
 * @desc    Update progress
 */
const updateProgress = asyncHandler(async (req, res) => {
    const { courseId, progress, videoId, exerciseScore } = req.body;
    const userId = req.user.id;

    if (videoId) {
        const userId = req.user.id;
        console.log(`[Progress] Updating progress for User: ${userId}, Course: ${courseId}, Video: ${videoId}`);
        
        // 1. Update completion arrays
        if (exerciseScore !== undefined) {
             await query(`
                UPDATE enrollments 
                SET completed_videos = COALESCE(completed_videos, '[]'::jsonb) || $1::jsonb,
                    completed_exercises = COALESCE(completed_exercises, '[]'::jsonb) || $2::jsonb,
                    updated_at = NOW() 
                WHERE student_id = $3 AND course_id = $4
                AND NOT (COALESCE(completed_videos, '[]'::jsonb) ? $5)
            `, [
                JSON.stringify([videoId]), 
                JSON.stringify([{ video: videoId, score: exerciseScore }]), 
                userId, 
                courseId,
                videoId
            ]);
        } else {
            await query(`
                UPDATE enrollments 
                SET completed_videos = COALESCE(completed_videos, '[]'::jsonb) || $1::jsonb,
                    updated_at = NOW() 
                WHERE student_id = $2 AND course_id = $3
                AND NOT (COALESCE(completed_videos, '[]'::jsonb) ? $4)
            `, [JSON.stringify([videoId]), userId, courseId, videoId]);
        }

        // 2. Recalculate and update the progress percentage
        // We fetch the course to get total videos count and modules count
        const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows[0]) {
            const rawModules = courseRes.rows[0].modules || [];
            const modules = Array.isArray(rawModules) 
                ? rawModules 
                : (typeof rawModules === 'string' ? JSON.parse(rawModules || '[]') : []);
            const totalModules = modules.length;
            const courseVideoIds = new Set();
            modules.forEach(m => (m.videos || []).forEach(v => {
                const vid = v._id || v.id;
                if (vid) courseVideoIds.add(String(vid));
            }));
            const totalVideos = courseVideoIds.size || 1;
            
            const enrollData = await query('SELECT completed_videos FROM enrollments WHERE student_id = $1 AND course_id = $2', [userId, courseId]);
            if (enrollData.rows[0]) {
                const completedVideos = Array.isArray(enrollData.rows[0].completed_videos) ? enrollData.rows[0].completed_videos : [];
                const completed = completedVideos.filter(id => courseVideoIds.has(String(id))).length;
                const newProgress = Math.min(100, Math.max(0, Math.round((completed / totalVideos) * 100)));
                
                let completedModules = 0;
                if (totalModules > 0 && completedVideos.length > 0) {
                    completedModules = modules.filter(m => {
                        const vids = Array.isArray(m.videos) ? m.videos : [];
                        if (vids.length === 0) return false;
                        return vids.every(v => completedVideos.includes(v._id || v.id));
                    }).length;
                }

                await query(
                    'UPDATE enrollments SET progress = $1, completed_modules = $2, total_modules = $3, updated_at = NOW() WHERE student_id = $4 AND course_id = $5',
                    [newProgress, completedModules, totalModules, userId, courseId]
                );
                console.log(`[Progress Update] Student ${userId} course ${courseId} is now ${newProgress}%, modules: ${completedModules}/${totalModules}`);
                
                return res.json({ success: true, progress: newProgress, completedModules, totalModules });
            }
        }
    } else if (progress !== undefined) {
        // Generic progress update
        await query(`
            UPDATE enrollments 
            SET progress = $1, updated_at = NOW() 
            WHERE student_id = $2 AND course_id = $3
        `, [progress, userId, courseId]);
        
        return res.json({ success: true, progress });
    }

    res.json({ success: true });
});

/**
 * @desc    Assign a student to a batch
 * @route   PUT /api/enrollment/assign-batch
 * @access  Private (Admin/University/Partner)
 */
const assignBatch = asyncHandler(async (req, res) => {
    const { studentId, courseId, batchId } = req.body;

    if (!studentId || !courseId) {
        res.status(400);
        throw new Error('Please provide studentId and courseId');
    }

    // Verify if enrollment exists
    const enrollRes = await query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, courseId]
    );

    if (enrollRes.rows.length === 0) {
        res.status(404);
        throw new Error('Enrollment not found');
    }

    // Update batch_id
    await query(
        'UPDATE enrollments SET batch_id = $1, updated_at = NOW() WHERE student_id = $2 AND course_id = $3',
        [batchId || null, studentId, courseId]
    );

    res.json({ success: true, message: 'Batch assigned successfully' });
});

module.exports = {
    enrollInCourse,
    getMyCourses,
    updateProgress,
    assignBatch
};
