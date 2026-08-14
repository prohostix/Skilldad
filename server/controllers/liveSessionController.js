const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const socketService = require('../services/SocketService');
const notificationService = require('../services/NotificationService');


/**
 * Helper to notify all students enrolled in a course or all students in a university
 */
const notifyEnrolledStudents = async (session, title, message, notificationType = 'liveSession', notificationOptions = { email: true, whatsapp: true }) => {
    try {
        let studentIds = [];
        let courseTitle = 'Your Course';
        if (session.course_id) {
            const courseRes = await query('SELECT title FROM courses WHERE id = $1', [session.course_id]);
            if (courseRes.rows.length > 0) courseTitle = courseRes.rows[0].title;
        }

        if (session.course_id) {
            let enrollSql = `
                SELECT e.student_id 
                FROM enrollments e
                LEFT JOIN batches b ON e.batch_id = b.id
                WHERE e.course_id = $1 AND e.status = 'active'
                AND (e.batch_id IS NULL OR b.is_active = true)
            `;
            let enrollParams = [session.course_id];

            if (session.batch_id) {
                enrollSql += " AND e.batch_id = $2";
                enrollParams.push(session.batch_id);
            }

            const res = await query(enrollSql, enrollParams);
            studentIds = res.rows.map(r => r.student_id);
        } else if (session.university_id) {
            const res = await query(
                "SELECT id FROM users WHERE university_id = $1 AND role = 'student' AND is_active = true",
                [session.university_id]
            );
            studentIds = res.rows.map(r => r.id);
        } else if (session.partner_id) {
            const res = await query(
                "SELECT id FROM users WHERE registered_by = $1 AND role = 'student' AND is_active = true",
                [session.partner_id]
            );
            studentIds = res.rows.map(r => r.id);
        }

        if (studentIds.length > 0) {
            // 1. Send WebSocket Notification (Internal Dashboard)
            socketService.sendToUsers(studentIds, 'notification', {
                type: 'live_session',
                title,
                message,
                sessionId: session.id,
                courseId: session.course_id,
                startTime: session.start_time,
                timestamp: new Date()
            });

            // 2. Send External Notifications (WhatsApp & Email)
            // Fetch student details to get phone numbers and emails
            const studentsRes = await query(
                "SELECT id, name, email, profile FROM users WHERE id = ANY($1) AND is_active = true",
                [studentIds]
            );

            for (const student of studentsRes.rows) {
                // Ensure ID is passed correctly
                student._id = student.id;

                try {
                    await notificationService.send(
                        student,
                        notificationType,
                        {
                            topic: session.topic,
                            startTime: session.start_time,
                            description: session.description || 'No description provided',
                            courseTitle
                        },
                        notificationOptions
                    );
                } catch (err) {
                    console.error(`[Notification] Failed to send WhatsApp/Email to ${student.name}:`, err.message);
                }
            }

            console.log(`[Notification] Successfully processed live session update for ${studentsRes.rows.length} students`);

        }
    } catch (error) {
        console.error('[Notification] Failed to notify students:', error.message);
    }
};


// @desc    Create a live session
const createSession = asyncHandler(async (req, res) => {
    const { topic, description, startTime, duration, timezone, instructor, courseId, batchId } = req.body;
    const universityId = req.user.role === 'university' ? req.user.id : null;
    const partnerId = req.user.role === 'partner' ? req.user.id : null;

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
        INSERT INTO live_sessions (id, topic, description, start_time, duration, timezone, instructor_id, university_id, partner_id, course_id, batch_id, zoom, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled', NOW(), NOW())
    `, [id, topic, description, startTime, duration, timezone || 'Asia/Kolkata', instructor || req.user.id, universityId, partnerId, courseId || null, batchId || null, JSON.stringify(jitsiData)]);

    // Notify students about scheduled session
    await notifyEnrolledStudents(
        { id, course_id: courseId, university_id: universityId, partner_id: partnerId, batch_id: batchId, start_time: startTime, topic, description },
        'New Live Session Scheduled',
        `A new session "${topic}" has been scheduled for your course.`
    );


    res.status(201).json({ success: true, id, joinUrl: jitsiData?.joinUrl });
});

// @desc    Get all sessions for a user
const getSessions = asyncHandler(async (req, res) => {
    if (req.user && req.user.role === 'student' && req.user.is_active === false) {
        return res.json([]);
    }

    let sql = `
        SELECT s.*, u.name as instructor_name, c.title as course_title, b.name as batch_name,
        COALESCE(
            CASE 
                WHEN s.course_id IS NOT NULL AND s.batch_id IS NOT NULL THEN (
                    SELECT COUNT(DISTINCT e.student_id)::int 
                    FROM enrollments e 
                    WHERE e.course_id = s.course_id AND (e.batch_id = s.batch_id OR e.batch_id::text = s.batch_id::text) AND (e.status = 'active' OR e.status IS NULL)
                )
                WHEN s.course_id IS NOT NULL AND s.batch_id IS NULL THEN (
                    SELECT COUNT(DISTINCT e.student_id)::int 
                    FROM enrollments e 
                    WHERE e.course_id = s.course_id AND (e.status = 'active' OR e.status IS NULL)
                )
                WHEN s.university_id IS NOT NULL THEN (
                    SELECT COUNT(DISTINCT id)::int 
                    FROM users 
                    WHERE university_id = s.university_id AND role = 'student'
                )
                WHEN s.partner_id IS NOT NULL THEN (
                    SELECT COUNT(DISTINCT id)::int 
                    FROM users 
                    WHERE registered_by = s.partner_id AND role = 'student'
                )
                ELSE 0
            END, 0
        ) as dynamic_enrolled_count
        FROM live_sessions s
        JOIN users u ON s.instructor_id = u.id
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN batches b ON s.batch_id = b.id
        WHERE (s.is_deleted IS NULL OR s.is_deleted = false)
    `;
    const params = [];

    if (req.user.role === 'student') {
        // Students only see sessions for courses they're actively enrolled in - no
        // institution-wide sessions regardless of enrollment (course_id IS NULL branch removed).
        // Also excludes sessions from courses where the student's batch is inactive.
        sql += ` AND (
            s.course_id IN (
                SELECT e.course_id 
                FROM enrollments e 
                LEFT JOIN batches b ON e.batch_id = b.id 
                WHERE e.student_id = $1 AND e.status = 'active' 
                AND (b.id IS NULL OR b.is_active IS NOT FALSE)
            )
            AND (s.batch_id IS NULL OR s.batch_id = (SELECT batch_id FROM enrollments WHERE student_id = $1 AND course_id = s.course_id LIMIT 1))
        )`;
        params.push(req.user.id);
    } else if (req.user.role === 'university') {
        sql += ` AND s.university_id = $1`;
        params.push(req.user.id);
    } else if (req.user.role === 'partner') {
        sql += ` AND s.partner_id = $1`;
        params.push(req.user.id);
    }

    sql += ' ORDER BY s.created_at DESC, s.start_time DESC';

    const resSet = await query(sql, params);

    const sessions = resSet.rows.map(r => {
        let zoom = r.zoom;
        let recording = r.recording;

        if (zoom && typeof zoom === 'string') {
            try { zoom = JSON.parse(zoom); } catch (e) { }
        }
        if (recording && typeof recording === 'string') {
            try { recording = JSON.parse(recording); } catch (e) { }
        }

        const enrolledCount = r.dynamic_enrolled_count !== undefined && r.dynamic_enrolled_count !== null
            ? Number(r.dynamic_enrolled_count)
            : (Array.isArray(r.enrolled_students) ? r.enrolled_students.length : (typeof r.enrolled_students === 'number' ? r.enrolled_students : 0));

        return {
            ...r,
            _id: r.id,
            meetingData: zoom,
            recording,
            startTime: r.start_time,
            instructor: { name: r.instructor_name },
            course: { title: r.course_title },
            batchName: r.batch_name,
            enrolledStudents: enrolledCount,
            enrolledCount: enrolledCount
        };
    });

    res.json(sessions);
});

// @desc    Get single session
const getSession = asyncHandler(async (req, res) => {
    const resSet = await query(`
        SELECT s.*, u.name as instructor_name, u.email as instructor_email, 
               uni.name as university_name, p.name as partner_name, c.title as course_title
        FROM live_sessions s
        JOIN users u ON s.instructor_id = u.id
        LEFT JOIN users uni ON s.university_id = uni.id
        LEFT JOIN users p ON s.partner_id = p.id
        LEFT JOIN courses c ON s.course_id = c.id
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
        } catch (e) { }
    }
    if (session.recording && typeof session.recording === 'string') {
        try { session.recording = JSON.parse(session.recording); } catch (e) { }
    }

    // Calculate dynamic enrolled count for this session
    let enrolledCount = 0;
    if (session.course_id) {
        if (session.batch_id) {
            const countRes = await query(
                'SELECT COUNT(*)::int as count FROM enrollments WHERE course_id = $1 AND batch_id = $2',
                [session.course_id, session.batch_id]
            );
            enrolledCount = countRes.rows[0]?.count || 0;
        } else {
            const countRes = await query(
                'SELECT COUNT(*)::int as count FROM enrollments WHERE course_id = $1',
                [session.course_id]
            );
            enrolledCount = countRes.rows[0]?.count || 0;
        }
    }

    res.json({
        ...session,
        _id: session.id,
        startTime: session.start_time,
        course: { title: session.course_title },
        enrolledStudents: enrolledCount,
        enrolledCount: enrolledCount,
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
        },
        partner: {
            _id: session.partner_id,
            id: session.partner_id,
            name: session.partner_name
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

    const resSet = await query("SELECT * FROM live_sessions WHERE id = $1", [id]);
    const session = resSet.rows[0];

    await query("UPDATE live_sessions SET status = 'ended' WHERE id = $1", [id]);

    // Jitsi recording syncing logic will be handled via webhooks or manual trigger
    // placeholder for future Jitsi recording sync integration

    if (session) {
        // Email only - no approved WhatsApp template exists for session completion
        notifyEnrolledStudents(
            session,
            'Live Class Completed',
            `The session "${session.topic}" has ended.`,
            'liveSessionCompleted',
            { email: true, whatsapp: false }
        );
    }

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
        LEFT JOIN enrollments en ON s.course_id = en.course_id AND en.student_id = $2
        WHERE s.course_id = $1 
        AND (s.is_deleted IS NULL OR s.is_deleted = false)
        AND ($3 = false OR s.batch_id IS NULL OR s.batch_id = en.batch_id)
        ORDER BY s.start_time ASC
    `, [courseId, req.user.id, req.user.role === 'student']);

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
    uploadSessionRecording: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { recordingUrl } = req.body;
        let finalUrl = recordingUrl;

        // If file was uploaded natively via multer
        if (req.file) {
            finalUrl = `/uploads/recordings/${req.file.filename}`;
        }

        if (!finalUrl) {
            return res.status(400).json({ success: false, message: 'Please provide a file or a recording URL.' });
        }

        const resSet = await query("SELECT * FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)", [id]);
        if (resSet.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const session = resSet.rows[0];

        // Ensure user owns this or is admin
        if ((req.user.role === 'university' && session.university_id !== req.user.id) ||
            (req.user.role === 'partner' && session.partner_id !== req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this session.' });
        }

        const existingRecording = typeof session.recording === 'string' ? JSON.parse(session.recording || '{}') : (session.recording || {});
        const newRecording = {
            ...existingRecording,
            playUrl: finalUrl,
            status: 'available',
            addedAt: new Date().toISOString(),
            type: req.file ? 'file' : 'link'
        };

        await query("UPDATE live_sessions SET recording = $1, updated_at = NOW() WHERE id = $2", [JSON.stringify(newRecording), id]);

        res.json({ success: true, message: 'Recording added successfully!', recording: newRecording });
    }),
    deleteSession: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await query("UPDATE live_sessions SET is_deleted = true, updated_at = NOW() WHERE id = $1", [id]);
        res.json({ success: true, message: 'Session deleted' });
    }),
    updateSession: asyncHandler(async (req, res) => {
        // Implementation based on update params
        res.json({ success: true });
    }),
    sendNotification: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT * FROM live_sessions WHERE id = $1", [id]);
        const session = resSet.rows[0];

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Notify students
        await notifyEnrolledStudents(
            session,
            'Live Class Reminder 🔔',
            `Reminder: The session "${session.topic}" is starting soon.`
        );

        res.json({ success: true, message: 'Notifications sent' });
    }),
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

        if (playUrl && !playUrl.startsWith('http') && !playUrl.startsWith('/')) {
            if (playUrl.startsWith('rec_') || playUrl.endsWith('.webm') || playUrl.endsWith('.mp4')) {
                playUrl = `/uploads/recordings/${playUrl}`;
            } else {
                playUrl = `/uploads/${playUrl}`;
            }
        }

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
