const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

// @desc    Get all courses (optionally filtered by university)
// @route   GET /api/courses?university=<userId>
const getCourses = asyncHandler(async (req, res) => {
    try {
        const universityId = req.query.university;
        let coursesRes;

        if (universityId) {
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
                FROM courses c
                JOIN users u ON c.instructor_id = u.id
                WHERE c.is_published = true AND c.instructor_id = $1
            `, [universityId]);
        } else {
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
                FROM courses c
                JOIN users u ON c.instructor_id = u.id
                WHERE c.is_published = true
            `);
        }

        const validCourses = coursesRes.rows.map(course => ({
            ...course,
            _id: course.id,
            instructor: {
                name: course.instructor_name,
                profile: course.instructor_profile,
                role: 'university'
            }
        }));

        res.status(200).json(validCourses);
    } catch (error) {
        console.error('Error in getCourses (PG):', error);
        res.status(500).json({ message: 'Error fetching courses' });
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
                ORDER BY c.created_at DESC
            `);
        } else {
            coursesRes = await query(`
                SELECT c.*, u.name as instructor_name
                FROM courses c
                LEFT JOIN users u ON c.instructor_id = u.id
                WHERE c.instructor_id = $1
                ORDER BY c.created_at DESC
            `, [userId]);
        }

        res.status(200).json(coursesRes.rows.map(c => ({ ...c, _id: c.id })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single course
const getCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // PG Query
    const courseRes = await query(`
        SELECT c.*, u.name as instructor_name, u.profile as instructor_profile
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.id = $1
    `, [id]);

    const course = courseRes.rows[0];
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    res.status(200).json({
        ...course,
        _id: course.id,
        instructor: {
            name: course.instructor_name,
            profile: course.instructor_profile,
            role: 'university'
        }
    });
});

// @desc    Create new course
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, category, price, isPublished, instructorId } = req.body;
    const finalInstructorId = req.user.role === 'admin' ? (instructorId || req.user.id) : req.user.id;
    const newId = `course_${Date.now()}`;

    await query(`
        INSERT INTO courses (id, title, description, category, price, is_published, instructor_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    `, [newId, title, description, category, price || 0, isPublished || false, finalInstructorId]);

    const saved = await query('SELECT * FROM courses WHERE id = $1', [newId]);
    res.status(201).json({ ...saved.rows[0], _id: newId });
});

// @desc    Update course
const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, category, price, isPublished } = req.body;

    await query(`
        UPDATE courses 
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            price = COALESCE($4, price),
            is_published = COALESCE($5, is_published),
            updated_at = NOW()
        WHERE id = $6
    `, [title, description, category, price, isPublished, id]);

    const updated = await query('SELECT * FROM courses WHERE id = $1', [id]);
    res.json({ ...updated.rows[0], _id: id });
});

const addModule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
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
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });
    
    modules[moduleIndex].title = title;
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);
    
    res.json(modules[moduleIndex]);
});

const deleteModule = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
    let modules = courseRes.rows[0].modules || [];
    modules = modules.filter(m => m._id !== moduleId);
    
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);
    
    res.json({ message: 'Module deleted' });
});

const addVideo = asyncHandler(async (req, res) => {
    const { id, moduleId } = req.params;
    const { title, url } = req.body;
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
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
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
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
    
    const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
    
    let modules = courseRes.rows[0].modules || [];
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });
    
    modules[moduleIndex].videos = modules[moduleIndex].videos.filter(v => v._id !== videoId);
    
    await query('UPDATE courses SET modules = $1::jsonb, updated_at = NOW() WHERE id = $2', [JSON.stringify(modules), id]);
    
    res.json({ message: 'Video deleted' });
});

const uploadThumbnail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Please upload an image' });
    
    const imagePath = `/uploads/${req.file.filename}`;
    await query('UPDATE courses SET thumbnail = $1, updated_at = NOW() WHERE id = $2', [imagePath, id]);
    
    res.json({ message: 'Thumbnail uploaded', thumbnail: imagePath });
});

module.exports = {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    getAdminCourses,
    deleteCourse: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const courseRes = await query('SELECT id FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await query('DELETE FROM courses WHERE id = $1', [id]);
        res.json({ message: 'Course removed' });
    }),
    addModule,
    updateModule,
    deleteModule,
    addVideo,
    updateVideo,
    deleteVideo,
    uploadThumbnail,
    addExercise: asyncHandler(async (req, res) => {
        const { id, moduleId, videoId } = req.params;
        const { title, type, content } = req.body;
        
        const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
        
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
    })
};
