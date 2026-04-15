const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const socketService = require('../services/SocketService');

/**
 * Helper to notify all students enrolled in a course or all students in a university
 */
const notifyEnrolledStudents = async (session, title, message) => {
    try {
        let studentIds = [];
        
        if (session.course_id) {
            // Get all students enrolled in the specific course
            const res = await query(
                "SELECT student_id FROM enrollments WHERE course_id = $1 AND status = 'active'",
                [session.course_id]
            );
            studentIds = res.rows.map(r => r.student_id);
        } else if (session.university_id) {
            // Get all students in the university if it's a general session
            const res = await query(
                "SELECT id FROM users WHERE university_id = $1 AND role = 'student'",
                [session.university_id]
            );
            studentIds = res.rows.map(r => r.id);
        }

        if (studentIds.length > 0) {
            socketService.sendToUsers(studentIds, 'notification', {
                type: 'live_session',
                title,
                message,
                sessionId: session.id,
                courseId: session.course_id,
                startTime: session.start_time,
                timestamp: new Date()
            });
            console.log(`[Notification] Sent live session update to ${studentIds.length} students`);
        }
    } catch (error) {
        console.error('[Notification] Failed to notify students:', error.message);
    }
};

// @desc    Create a live session
const createSession = asyncHandler(async (req, res) => {
    const { topic, description, startTime, duration, timezone, instructor, courseId } = req.body;
    const universityId = req.user.id;

    const id = `sess_${Date.now()}`;

    // Create Jitsi meeting
    let jitsiData = null;
    try {
        const { createJitsiMeeting } = require('../utils/jitsiUtils');
        jitsiData = createJitsiMeeting(topic, id);
        console.log(`[Session] Jitsi meeting created for session ${id}: Room ${jitsiData.roomName}`);
    } catch (jitsiError) {
        console.error(`[Session] Failed to create Jitsi meeting for session ${id}:`, jitsiError.message);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to create Jitsi meeting: ${jitsiError.message}` 
        });
    }

    await query(`
        INSERT INTO live_sessions (id, topic, description, start_time, duration, timezone, instructor_id, university_id, course_id, zoom, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', NOW(), NOW())
    `, [id, topic, description, startTime, duration, timezone || 'Asia/Kolkata', instructor || req.user.id, universityId, courseId || null, JSON.stringify(jitsiData)]);

    // Notify students about scheduled session
    notifyEnrolledStudents(
        { id, course_id: courseId, university_id: universityId, start_time: startTime },
        'New Live Session Scheduled',
        `A new session "${topic}" has been scheduled for your course.`
    );

    res.status(201).json({ success: true, id, joinUrl: jitsiData?.joinUrl });
});

// @desc    Get all sessions for a user
const getSessions = asyncHandler(async (req, res) => {
    let sql = `
        SELECT s.*, u.name as instructor_name, c.title as course_title
        FROM live_sessions s
        JOIN users u ON s.instructor_id = u.id
        LEFT JOIN courses c ON s.course_id = c.id
        WHERE (s.is_deleted IS NULL OR s.is_deleted = false)
    `;
    const params = [];

    if (req.user.role === 'student') {
        sql += ` AND (
            s.course_id IN (SELECT course_id FROM enrollments WHERE student_id = $1 AND status = 'active')
            OR (s.course_id IS NULL AND s.university_id = (SELECT university_id FROM users WHERE id = $1))
        )`;
        params.push(req.user.id);
    } else if (req.user.role === 'university') {
        sql += ` AND s.university_id = $1`;
        params.push(req.user.id);
    }

    const resSet = await query(sql, params);
    
    const sessions = resSet.rows.map(r => {
        let zoom = r.zoom;
        let recording = r.recording;
        
        if (zoom && typeof zoom === 'string') {
            try { zoom = JSON.parse(zoom); } catch (e) {}
        }
        if (recording && typeof recording === 'string') {
            try { recording = JSON.parse(recording); } catch (e) {}
        }

        return {
            ...r,
            _id: r.id,
            meetingData: zoom,
            recording,
            startTime: r.start_time,
            instructor: { name: r.instructor_name },
            course: { title: r.course_title }
        };
    });

    res.json(sessions);
});

// @desc    Get single session
const getSession = asyncHandler(async (req, res) => {
    const resSet = await query(`
        SELECT s.*, u.name as instructor_name, u.email as instructor_email, uni.name as university_name
        FROM live_sessions s
        JOIN users u ON s.instructor_id = u.id
        JOIN users uni ON s.university_id = uni.id
        WHERE s.id = $1 AND (s.is_deleted IS NULL OR s.is_deleted = false)
    `, [req.params.id]);

    const session = resSet.rows[0];
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    // Ensure JSON fields are parsed
    if (session.zoom && typeof session.zoom === 'string') {
        try { 
            session.meetingData = JSON.parse(session.zoom);
        } catch (e) {}
    }
    if (session.recording && typeof session.recording === 'string') {
        try { session.recording = JSON.parse(session.recording); } catch (e) {}
    }

    res.json({
        ...session,
        _id: session.id,
        instructor: {
            _id: session.instructor_id,
            id: session.instructor_id,
            name: session.instructor_name,
            email: session.instructor_email
        },
        university: {
            _id: session.university_id,
            id: session.university_id,
            name: session.university_name
        }
    });
});

// @desc    Start session
const startSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Get session details first to notify students
    const resSet = await query("SELECT * FROM live_sessions WHERE id = $1", [id]);
    const session = resSet.rows[0];
    
    if (session) {
        await query("UPDATE live_sessions SET status = 'live', start_time = NOW() WHERE id = $1", [id]);
        
        // Notify students that session is now live
        notifyEnrolledStudents(
            session,
            'Live Class Started! 🔴',
            `The session "${session.topic}" is now live. Join now to participate!`
        );
    }
    
    res.json({ success: true, message: 'Session is live' });
});

// @desc    End session
const endSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await query("UPDATE live_sessions SET status = 'ended' WHERE id = $1", [id]);
    
    // Jitsi recording syncing logic will be handled via webhooks or manual trigger
    // placeholder for future Jitsi recording sync integration

    res.json({ success: true, message: 'Session ended' });
});

// @desc    Get live sessions for a specific course
const getCourseLiveSessions = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Authorization: If student, check enrollment
    if (req.user.role === 'student') {
        const enrollment = await query(
            "SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2 AND status = 'active'",
            [req.user.id, courseId]
        );
        if (enrollment.rows.length === 0) {
            res.status(403);
            throw new Error('You are not enrolled in this course');
        }
    }

    const resSet = await query(`
        SELECT s.*, u.name as instructor_name, u.profile as instructor_profile
        FROM live_sessions s
        JOIN users u ON s.instructor_id = u.id
        WHERE s.course_id = $1 AND (s.is_deleted IS NULL OR s.is_deleted = false)
        ORDER BY s.start_time ASC
    `, [courseId]);

    res.json(resSet.rows.map(r => ({
        ...r,
        _id: r.id,
        startTime: r.start_time,
        instructor: {
            name: r.instructor_name,
            profile: r.instructor_profile
        }
    })));
});

module.exports = {
    createSession,
    getSessions,
    getSession,
    startSession,
    endSession,
    deleteSession: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await query("UPDATE live_sessions SET is_deleted = true, updated_at = NOW() WHERE id = $1", [id]);
        res.json({ success: true, message: 'Session deleted' });
    }),
    updateSession: asyncHandler(async (req, res) => {
        // Implementation based on update params
        res.json({ success: true });
    }),
    sendNotification: asyncHandler(async (req, res) => res.json({ success: true })),
    getSessionStatusRoute: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT status FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)", [id]);
        if (resSet.rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ status: resSet.rows[0].status });
    }),
    getRecordingStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT zoom FROM live_sessions WHERE id = $1", [id]);
        if (resSet.rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        const zoom = typeof resSet.rows[0].zoom === 'string' ? JSON.parse(resSet.rows[0].zoom || '{}') : (resSet.rows[0].zoom || {});
        res.json({ status: zoom.recording_status || 'pending' });
    }),
    getRecordingPlaybackUrl: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT recording FROM live_sessions WHERE id = $1", [id]);
        if (resSet.rows.length === 0) {
            return res.status(404).json({ error: 'Not found' });
        }
        
        const recording = typeof resSet.rows[0].recording === 'string' ? JSON.parse(resSet.rows[0].recording || '{}') : (resSet.rows[0].recording || {});

        let playUrl = recording.playUrl || recording.play_url;

        // Fallback to a mock video for development/testing if URL is not present
        if (!playUrl) {
            playUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
        }

        res.json({ playUrl });
    }),
    getJitsiSDKConfig: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT zoom, instructor_id FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)", [id]);

        if (resSet.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = resSet.rows[0];
        const jitsiData = typeof session.zoom === 'string' ? JSON.parse(session.zoom || '{}') : (session.zoom || {});

        const { generateJitsiToken } = require('../utils/jitsiUtils');
        const isInstructor = (req.user.id === session.instructor_id || req.user.role !== 'student');

        let roomName = jitsiData.roomName;
        if (!roomName) {
            // Self-correction: If roomName is missing (e.g. legacy session), generate one
            const { generateRoomName } = require('../utils/jitsiUtils');
            roomName = generateRoomName(id);
            console.log(`[Jitsi] Legacy Session Correction: Generated room name ${roomName} for session ${id}`);
        }

        try {
            const token = generateJitsiToken(req.user, roomName, isInstructor);
            res.json({
                roomName: roomName,
                domain: jitsiData.domain || process.env.JITSI_DOMAIN || 'meet.skilldad.com',
                token,
                userName: req.user.name || 'User',
                userEmail: req.user.email,
                isInstructor
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    getCourseLiveSessions
};
