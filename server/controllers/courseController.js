const asyncHandler = require('express-async-handler');
const { query, getPool } = require('../config/postgres');

// @desc    Get all courses (optionally filtered by university)
// @route   GET /api/courses?university=<userId>
const getCourses = asyncHandler(async (req, res) => {
    try {
        const universityId = req.query.university;
        const search = req.query.search;
        let coursesRes;

        let queryStr = `
            SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
            FROM courses c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.is_published = true AND c.status = 'approved'
        `;
        let queryParams = [];

        if (universityId) {
            queryParams.push(universityId);
            queryStr += ` AND c.instructor_id = $${queryParams.length}`;
        }

        if (search) {
            const stopWords = ['is', 'the', 'a', 'an', 'of', 'for', 'to', 'and', 'or', 'in', 'on', 'which', 'one', 'any', 'all', 'some', 'what', 'how', 'details', 'detail'];
            const words = search.split(/[ \-–&,]+/).filter(w => w.trim().length > 1 && !stopWords.includes(w.toLowerCase()));

            if (words.length > 0) {
                let orConditions = [];
                let relevanceCases = [];
                words.forEach(word => {
                    queryParams.push(`%${word}%`);
                    const paramIdx = queryParams.length;
                    orConditions.push(`c.title ILIKE $${paramIdx} OR c.university_name ILIKE $${paramIdx}`);
                    relevanceCases.push(`(CASE WHEN c.title ILIKE $${paramIdx} THEN 2 WHEN c.university_name ILIKE $${paramIdx} THEN 1 ELSE 0 END)`);
                });

                queryStr = queryStr.replace('SELECT c.*,', `SELECT c.*, (${relevanceCases.join(' + ')}) as relevance,`);
                queryStr += ` AND (${orConditions.join(' OR ')})`;
                queryStr += ` ORDER BY relevance DESC, c.is_featured DESC, c.created_at DESC LIMIT 10`;
            } else {
                queryStr += ` ORDER BY c.is_featured DESC, c.created_at DESC`;
            }
        } else {
            queryStr += ` ORDER BY c.is_featured DESC, c.created_at DESC`;
        }

        coursesRes = await query(queryStr, queryParams);

        const validCourses = coursesRes.rows.map(course => ({
            ...course,
            _id: course.id,
            isPublished: course.is_published,
            isFeatured: course.is_featured,
            instructorId: course.instructor_id,
            instructorName: course.instructor_name,
            universityName: course.university_name,
            programType: course.program_type,
            skillDadUniversityId: course.skill_dad_university_id,
            instructor: {
                name: course.instructor_name,
                profile: course.instructor_profile,
                role: 'university'
            }
        }));

        res.status(200).json(validCourses);
    } catch (error) {
        console.error('Error in getCourses (PG):', error);
        res.status(500).json({ message: error.message || 'Error fetching courses' });
    }
});

// @desc    Get all courses (Admin/Instructor version)
const getAdminCourses = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role?.toLowerCase();
        let coursesRes;

        if (userRole === 'admin') {
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                ORDER BY c.is_featured DESC, c.created_at DESC
            `);
        } else if (userRole === 'partner') {
            // Partners see courses they created or are instructors for
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE c.instructor_id = $1 OR c.submitted_by = $1
                ORDER BY c.is_featured DESC, c.created_at DESC
            `, [userId]);
        } else {
            // Universities/Instructors see courses they are instructors for
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE c.instructor_id = $1
                ORDER BY c.is_featured DESC, c.created_at DESC
            `, [userId]);
        }

        res.status(200).json(coursesRes.rows.map(c => ({
            ...c,
            _id: c.id,
            isPublished: c.is_published,
            isFeatured: c.is_featured,
            instructorId: c.instructor_id,
            instructorName: c.instructor_name,
            universityName: c.university_name,
            programType: c.program_type,
            skillDadUniversityId: c.skill_dad_university_id
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single course
const getCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // PG Query - LEFT JOIN because Degree Programme courses (linked to a SkillDad University)
    // have a null instructor_id and no real instructor user account
    const courseRes = await query(`
        SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = $1
    `, [id]);

    const course = courseRes.rows[0];
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check enrollment if user is logged in
    let isEnrolled = false;
    let studentBatchId = null;
    let studentBatchIsActive = true;
    if (req.user) {
        const enrollRes = await query(`
            SELECT e.id, e.batch_id, b.is_active as batch_is_active 
            FROM enrollments e
            LEFT JOIN batches b ON e.batch_id = b.id
            WHERE e.student_id = $1 AND e.course_id = $2 AND e.status = 'active'
        `, [req.user.id, id]);

        if (enrollRes.rows.length > 0) {
            const enrollment = enrollRes.rows[0];
            // If they belong to a batch and the batch is explicitly inactive, track it
            if (enrollment.batch_id && enrollment.batch_is_active === false) {
                studentBatchIsActive = false;
            }
            isEnrolled = true;
            studentBatchId = enrollment.batch_id ? String(enrollment.batch_id) : null;
        }
    }

    // Filter modules based on batch publish settings for students
    if (req.user?.role === 'student' && Array.isArray(course.modules)) {
        course.modules = course.modules.filter(m => {
            if (!Array.isArray(m.publishedBatches)) return true;
            return studentBatchId ? m.publishedBatches.includes(studentBatchId) : false;
        });
    }

    // Strip sensitive content (video URLs, attachments, quizzes) for guests or non-enrolled students
    const hasFullAccess = (req.user && ['admin', 'university', 'partner'].includes(req.user.role)) || (isEnrolled && req.user?.is_active !== false && studentBatchIsActive !== false);
    if (!hasFullAccess && Array.isArray(course.modules)) {
        course.modules = course.modules.map(m => {
            const sanitizedModule = { ...m };
            delete sanitizedModule.quiz; // Hide quizzes from public

            if (Array.isArray(sanitizedModule.videos)) {
                sanitizedModule.videos = sanitizedModule.videos.map(v => {
                    const { url, attachments, exercises, zoom_recording_url, ...safeVideo } = v;
                    return safeVideo;
                });
            }
            return sanitizedModule;
        });
    }

    res.status(200).json({
        ...course,
        _id: course.id,
        isPublished: course.is_published,
        isFeatured: course.is_featured,
        instructorId: course.instructor_id,
        instructorName: course.instructor_name,
        universityName: course.university_name,
        programType: course.program_type,
        skillDadUniversityId: course.skill_dad_university_id,
        isEnrolled,
        instructor: {
            name: course.instructor_name,
            profile: course.instructor_profile,
            role: 'university'
        }
    });
});

// @desc    Create new course
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, category, price, isPublished, instructorId, instructorName, universityName, isFeatured, brochure_url, university_tools, thumbnail, programType, skillDadUniversityId, features, learning_outcomes } = req.body;
    const isDegreeProgramme = (programType || 'course') === 'degree_programme';

    // For Admin, a provider is mandatory - a real university for Skill Courses, a SkillDad University for Degree Programmes
    if (req.user.role === 'admin') {
        if (isDegreeProgramme && !skillDadUniversityId) {
            res.status(400);
            throw new Error('Provider University is mandatory for course creation');
        }
        if (!isDegreeProgramme && !instructorId) {
            res.status(400);
            throw new Error('Provider University is mandatory for course creation');
        }
    }

    // Degree Programmes are linked to a SkillDad University (no login account), not a real instructor user
    const finalInstructorId = isDegreeProgramme ? null : (req.user.role === 'admin' ? instructorId : req.user.id);
    const finalSkillDadUniversityId = isDegreeProgramme ? (skillDadUniversityId || null) : null;
    const newId = `course_${Date.now()}`;
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    await query(`
        INSERT INTO courses (id, title, description, category, price, is_published, is_featured, instructor_id, instructor_name, university_name, brochure_url, university_tools, thumbnail, status, submitted_by, program_type, skill_dad_university_id, features, learning_outcomes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
    `, [newId, title, description, category, price || 0, isPublished || false, isFeatured || false, finalInstructorId, instructorName || '', universityName || '', brochure_url || '', JSON.stringify(university_tools || []), thumbnail || '', initialStatus, req.user.id, programType || 'course', finalSkillDadUniversityId, JSON.stringify(features || []), JSON.stringify(learning_outcomes || [])]);

    // Auto-sync with University profile.assigned_courses
    try {
        const uniRes = await query('SELECT profile FROM users WHERE id = $1', [finalInstructorId]);
        if (uniRes.rows.length > 0) {
            const profile = typeof uniRes.rows[0].profile === 'string' ? JSON.parse(uniRes.rows[0].profile) : (uniRes.rows[0].profile || {});
            const assigned = profile.assigned_courses || [];
            if (!assigned.includes(newId)) {
                assigned.push(newId);
                profile.assigned_courses = assigned;
                await query('UPDATE users SET profile = $1 WHERE id = $2', [JSON.stringify(profile), finalInstructorId]);
            }
        }
    } catch (err) {
        console.error('Error syncing university course list:', err);
    }

    const saved = await query('SELECT * FROM courses WHERE id = $1', [newId]);
    res.status(201).json({
        ...saved.rows[0],
        _id: newId,
        isPublished: saved.rows[0].is_published,
        isFeatured: saved.rows[0].is_featured,
        instructorId: saved.rows[0].instructor_id,
        instructorName: saved.rows[0].instructor_name,
        universityName: saved.rows[0].university_name,
        programType: saved.rows[0].program_type,
        skillDadUniversityId: saved.rows[0].skill_dad_university_id
    });
});

// @desc    Update course
const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, category, price, isPublished, isFeatured, instructorId, instructorName, universityName, brochure_url, university_tools, thumbnail, programType, skillDadUniversityId, features, learning_outcomes } = req.body;

    // Get old course to check for instructor changes
    const oldCourseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
    const oldInstructorId = oldCourseRes.rows[0]?.instructor_id;

    if (req.user.role !== 'admin' && oldInstructorId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this course');
    }

    await query(`
        UPDATE courses
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            price = COALESCE($4, price),
            is_published = COALESCE($5, is_published),
            is_featured = COALESCE($6, is_featured),
            instructor_name = COALESCE($7, instructor_name),
            university_name = COALESCE($8, university_name),
            brochure_url = COALESCE($9, brochure_url),
            university_tools = COALESCE($10, university_tools),
            thumbnail = COALESCE($11, thumbnail),
            program_type = COALESCE($12, program_type),
            features = COALESCE($13, features),
            learning_outcomes = COALESCE($14, learning_outcomes),
            updated_at = NOW()
        WHERE id = $15
    `, [title, description, category, price, isPublished, isFeatured, instructorName, universityName, brochure_url, university_tools ? JSON.stringify(university_tools) : null, thumbnail, programType, features ? JSON.stringify(features) : null, learning_outcomes ? JSON.stringify(learning_outcomes) : null, id]);

    // instructor_id and skill_dad_university_id are mutually exclusive - a Degree Programme is
    // linked to a SkillDad University (no login account), a Skill Course to a real instructor user.
    if (programType === 'degree_programme') {
        await query(
            'UPDATE courses SET instructor_id = NULL, skill_dad_university_id = COALESCE($1, skill_dad_university_id) WHERE id = $2',
            [skillDadUniversityId, id]
        );
    } else if (programType === 'course') {
        await query(
            'UPDATE courses SET skill_dad_university_id = NULL, instructor_id = COALESCE($1, instructor_id) WHERE id = $2',
            [instructorId, id]
        );
    } else if (instructorId) {
        await query('UPDATE courses SET instructor_id = COALESCE($1, instructor_id) WHERE id = $2', [instructorId, id]);
    }

    // Handle instructor change in assigned_courses list
    if (instructorId && oldInstructorId && instructorId !== oldInstructorId) {
        try {
            // Remove from old
            const oldUniRes = await query('SELECT profile FROM users WHERE id = $1', [oldInstructorId]);
            if (oldUniRes.rows.length > 0) {
                const profile = typeof oldUniRes.rows[0].profile === 'string' ? JSON.parse(oldUniRes.rows[0].profile) : (oldUniRes.rows[0].profile || {});
                profile.assigned_courses = (profile.assigned_courses || []).filter(cid => cid !== id);
                await query('UPDATE users SET profile = $1 WHERE id = $2', [JSON.stringify(profile), oldInstructorId]);
            }
            // Add to new
            const newUniRes = await query('SELECT profile FROM users WHERE id = $1', [instructorId]);
            if (newUniRes.rows.length > 0) {
                const profile = typeof newUniRes.rows[0].profile === 'string' ? JSON.parse(newUniRes.rows[0].profile) : (newUniRes.rows[0].profile || {});
                const assigned = profile.assigned_courses || [];
                if (!assigned.includes(id)) {
                    assigned.push(id);
                    profile.assigned_courses = assigned;
                    await query('UPDATE users SET profile = $1 WHERE id = $2', [JSON.stringify(profile), instructorId]);
                }
            }
        } catch (err) {
            console.error('Error updating university course lists:', err);
        }
    }

    const updated = await query('SELECT * FROM courses WHERE id = $1', [id]);
    res.json({
        ...updated.rows[0],
        _id: id,
        isPublished: updated.rows[0].is_published,
        isFeatured: updated.rows[0].is_featured,
        instructorId: updated.rows[0].instructor_id,
        instructorName: updated.rows[0].instructor_name,
        universityName: updated.rows[0].university_name,
        programType: updated.rows[0].program_type,
        skillDadUniversityId: updated.rows[0].skill_dad_university_id
    });
});

const addModule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const modules = courseRes.rows[0].modules || [];
    const newModule = {
        _id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        videos: []
    };

    modules.push(newModule);
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.status(201).json(newModule);
});

const updateModule = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    const { title } = req.body;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    modules[moduleIndex].title = title;
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.json(modules[moduleIndex]);
});

// @desc    Set which batches a module is published to (staggered per-cohort content release)
// @route   PUT /api/courses/:id/modules/:moduleId/publish
// @access  Private (Instructor/Admin)
//
// batchIds omitted/undefined on the module (legacy data, or never touched) means the
// module is open to every enrolled student - matches today's behaviour, so existing
// courses see zero change until an instructor explicitly publishes a module.
// batchIds: [] means explicitly published to nobody yet (a real "draft" state).
// batchIds: [...ids] restricts visibility to students enrolled in one of those batches;
// students with no batch assigned won't see a batch-restricted module.
const updateModulePublishTargets = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    const { batchIds } = req.body;

    if (!Array.isArray(batchIds)) {
        return res.status(400).json({ message: 'batchIds must be an array' });
    }

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    modules[moduleIndex].publishedBatches = batchIds.map(String);
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.json(modules[moduleIndex]);
});

const deleteModule = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    modules = modules.filter(m => m._id !== moduleId);

    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.json({ message: 'Module deleted' });
});

const addVideo = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    const { title, url } = req.body;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    const newVideo = {
        _id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        url
    };

    modules[moduleIndex].videos = modules[moduleIndex].videos || [];
    modules[moduleIndex].videos.push(newVideo);

    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.status(201).json(newVideo);
});

const updateVideo = asyncHandler(async (req, res) => {
    const { id, moduleId, videoId } = req.params;
    const { title, url } = req.body;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    const videoIndex = modules[moduleIndex].videos.findIndex(v => v._id === videoId);
    if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

    modules[moduleIndex].videos[videoIndex].title = title || modules[moduleIndex].videos[videoIndex].title;
    modules[moduleIndex].videos[videoIndex].url = url || modules[moduleIndex].videos[videoIndex].url;

    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.json(modules[moduleIndex].videos[videoIndex]);
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { id, moduleId, videoId } = req.params;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    modules[moduleIndex].videos = modules[moduleIndex].videos.filter(v => v._id !== videoId);

    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

    res.json({ message: 'Video deleted' });
});

const uploadThumbnail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) return res.status(400).json({ message: 'Please upload an image' });

    const imagePath = `/uploads/${req.file.filename}`;
    await query('UPDATE courses SET thumbnail = $1, updated_at = NOW() WHERE id = $2', [imagePath, id]);

    res.json({ message: 'Thumbnail uploaded', thumbnail: imagePath });
});

const uploadBrochure = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const courseRes = await query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const filePath = `/uploads/${req.file.filename}`;
    await query('UPDATE courses SET brochure_url = $1, updated_at = NOW() WHERE id = $2', [filePath, id]);

    res.json({ message: 'Brochure uploaded', brochure_url: filePath });
});

const saveModuleQuiz = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    const { questions } = req.body;

    const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

    // Validate questions structure
    if (!Array.isArray(questions)) return res.status(400).json({ message: 'Questions must be an array' });

    modules[moduleIndex].quiz = {
        questions: questions.map((q, i) => ({
            _id: q._id || `q_${Date.now()}_${i}`,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || ''
        }))
    };

    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);
    console.log(`[Server] Module quiz saved: ${questions.length} questions for module ${moduleId}`);
    res.json({ message: 'Quiz saved successfully', quiz: modules[moduleIndex].quiz });
});


module.exports = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    getAdminCourses,
    saveModuleQuiz,
    uploadLessonVideo: asyncHandler(async (req, res) => {
        const { id, moduleId, videoId } = req.params;

        const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) return res.status(400).json({ message: 'Please upload a video file' });

        let modules = courseRes.rows[0].modules || [];
        const moduleIndex = modules.findIndex(m => m._id === moduleId);
        if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

        const videoIndex = modules[moduleIndex].videos.findIndex(v => v._id === videoId);
        if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

        const videoPath = `/uploads/${req.file.filename}`;
        modules[moduleIndex].videos[videoIndex].url = videoPath;

        await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

        res.json({ message: 'Video uploaded successfully', url: videoPath });
    }),
    uploadLessonDocument: asyncHandler(async (req, res) => {
        const { id, moduleId } = req.params;
        const { title } = req.body;

        const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) return res.status(400).json({ message: 'Please upload a document file' });
        if (!title) return res.status(400).json({ message: 'Lesson title is required' });

        let modules = courseRes.rows[0].modules || [];
        const moduleIndex = modules.findIndex(m => m._id === moduleId);
        if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

        const filePath = `/uploads/${req.file.filename}`;
        const newLesson = {
            _id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: title,
            url: filePath,
            contentType: 'document',
            fileType: req.file.mimetype,
            fileName: req.file.originalname,
            duration: 0,
            attachments: []
        };

        if (!modules[moduleIndex].videos) modules[moduleIndex].videos = [];
        modules[moduleIndex].videos.push(newLesson);

        await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

        console.log(`[Server] Document lesson created: ${title} -> ${filePath} in module ${moduleId}`);
        res.status(201).json({ message: 'Document lesson uploaded successfully', lesson: newLesson });
    }),
    deleteCourse: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const courseRes = await query('SELECT id, instructor_id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const client = await getPool().connect();
        try {
            await client.query('BEGIN');

            // Delete related simple dependencies safely using savepoints
            const dependentTables = [
                'progress', 'submissions', 'projects', 'interactive_contents',
                'enrollments', 'live_sessions', 'payments', 'transactions', 'reviews',
                'certificates', 'batches'
            ];

            for (const table of dependentTables) {
                try {
                    await client.query(`SAVEPOINT before_${table}`);
                    await client.query(`DELETE FROM ${table} WHERE course_id = $1`, [id]);
                    await client.query(`RELEASE SAVEPOINT before_${table}`);
                } catch (e) {
                    await client.query(`ROLLBACK TO SAVEPOINT before_${table}`);
                }
            }

            // Delete Exams and their related dependencies
            try {
                await client.query('SAVEPOINT before_exams');
                const examsRes = await client.query('SELECT id FROM exams WHERE course_id = $1', [id]);
                for (const exam of examsRes.rows) {
                    await client.query('DELETE FROM questions WHERE exam_id = $1', [exam.id]).catch(e => null);
                    await client.query('DELETE FROM exam_submissions_new WHERE exam_id = $1', [exam.id]).catch(e => null);
                    await client.query('DELETE FROM results WHERE exam_id = $1', [exam.id]).catch(e => null);
                }
                await client.query('DELETE FROM exams WHERE course_id = $1', [id]);
                await client.query('RELEASE SAVEPOINT before_exams');
            } catch (e) {
                await client.query('ROLLBACK TO SAVEPOINT before_exams');
            }

            // Documents must be deleted after exams - exam question papers/answer keys are
            // referenced by exams.linked_paper_id/answer_key_id, so deleting documents first
            // would violate that foreign key and silently roll back, leaving orphaned documents
            // that then block the course delete itself.
            try {
                await client.query('SAVEPOINT before_documents');
                await client.query('DELETE FROM documents WHERE course_id = $1', [id]);
                await client.query('RELEASE SAVEPOINT before_documents');
            } catch (e) {
                await client.query('ROLLBACK TO SAVEPOINT before_documents');
            }

            // Finally, delete the course
            await client.query('DELETE FROM courses WHERE id = $1', [id]);

            await client.query('COMMIT');
            res.json({ message: 'Course and all related data removed successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Cascade Delete Error:', error);
            res.status(500).json({ message: 'Failed to delete course due to referential constraints', error: error.message });
        } finally {
            client.release();
        }
    }),
    addModule,
    updateModule,
    updateModulePublishTargets,
    deleteModule,
    addVideo,
    updateVideo,
    deleteVideo,
    uploadThumbnail,
    uploadBrochure,
    addExercise: asyncHandler(async (req, res) => {
        const { id, moduleId, videoId } = req.params;
        const { title, type, content } = req.body;

        const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

        if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let modules = courseRes.rows[0].modules || [];
        const moduleIndex = modules.findIndex(m => m._id === moduleId);
        if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

        const videoIndex = modules[moduleIndex].videos.findIndex(v => v._id === videoId);
        if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

        const newExercise = {
            _id: `ex_${Date.now()}`,
            title: title || 'New Exercise',
            type: type || 'video-interaction',
            content: content || {}
        };

        if (!modules[moduleIndex].videos[videoIndex].exercises) {
            modules[moduleIndex].videos[videoIndex].exercises = [];
        }
        modules[moduleIndex].videos[videoIndex].exercises.push(newExercise);

        await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);
        res.status(201).json({ message: 'Exercise added', exercise: newExercise });
    }),
    approveCourse: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, isPublished } = req.body; // status: 'approved' | 'rejected'

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can approve courses' });
        }

        const result = await query(`
            UPDATE courses 
            SET status = $1, 
                is_published = COALESCE($2, is_published),
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [status, isPublished, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(result.rows[0]);
    }),
    uploadLessonFile: asyncHandler(async (req, res) => {
        const { id, moduleId, videoId } = req.params;
        console.log(`[Server] Lesson File Upload Attempt: course=${id}, module=${moduleId}, video=${videoId}`);

        const courseRes = await query('SELECT modules, instructor_id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) {
            console.log(`[Server] Course not found: ${id}`);
            return res.status(404).json({ message: 'Course not found' });
        }

        console.log(`[Server] Found course. Instructor: ${courseRes.rows[0].instructor_id}, Current User: ${req.user.id}, Role: ${req.user.role}`);

        if (req.user.role !== 'admin' && courseRes.rows[0].instructor_id !== req.user.id) {
            console.log(`[Server] NOT AUTHORIZED. Course belongs to: ${courseRes.rows[0].instructor_id}`);
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

        let modules = courseRes.rows[0].modules || [];
        const moduleIndex = modules.findIndex(m => m._id === moduleId);
        if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

        const videoIndex = modules[moduleIndex].videos.findIndex(v => v._id === videoId);
        if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

        const filePath = `/uploads/${req.file.filename}`;
        const newFile = {
            _id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: req.file.originalname,
            url: filePath,
            type: req.file.mimetype
        };

        modules[moduleIndex].videos[videoIndex].attachments = modules[moduleIndex].videos[videoIndex].attachments || [];
        modules[moduleIndex].videos[videoIndex].attachments.push(newFile);

        await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);

        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    })
};
