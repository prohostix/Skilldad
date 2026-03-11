const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

// @desc    Create a live session
const createSession = asyncHandler(async (req, res) => {
    const { topic, description, startTime, duration, timezone, instructor, courseId } = req.body;
    const universityId = req.user.id;

    const id = `sess_${Date.now()}`;

    // Create Zoom meeting
    let zoomData = null;
    try {
        const { createZoomMeeting } = require('../utils/zoomUtils');
        const meetingStartTime = new Date(startTime);
        const meetingDuration = parseInt(duration) || 60;
        const hostEmail = req.user.email;
        const tz = timezone || 'Asia/Kolkata';

        zoomData = await createZoomMeeting(topic, meetingStartTime, meetingDuration, hostEmail, tz);
        console.log(`[Session] Zoom meeting created for session ${id}: Meeting ID ${zoomData.meetingId}`);
    } catch (zoomError) {
        console.error(`[Session] Failed to create Zoom meeting for session ${id}:`, zoomError.message);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to create Zoom meeting: ${zoomError.message}` 
        });
    }

    await query(`
        INSERT INTO live_sessions (id, topic, description, start_time, duration, timezone, instructor_id, university_id, course_id, zoom, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', NOW(), NOW())
    `, [id, topic, description, startTime, duration, timezone || 'Asia/Kolkata', instructor || req.user.id, universityId, courseId || null, JSON.stringify(zoomData)]);

    res.status(201).json({ success: true, id, joinUrl: zoomData?.joinUrl });
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
    res.json(resSet.rows.map(r => ({
        ...r,
        _id: r.id,
        startTime: r.start_time,
        instructor: { name: r.instructor_name },
        course: { title: r.course_title }
    })));
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
        try { session.zoom = JSON.parse(session.zoom); } catch (e) {}
    }
    if (session.recording && typeof session.recording === 'string') {
        try { session.recording = JSON.parse(session.recording); } catch (e) {}
    }

    res.json({ ...session, _id: session.id });
});

// @desc    Start session
const startSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await query("UPDATE live_sessions SET status = 'live', start_time = NOW() WHERE id = $1", [id]);
    res.json({ success: true, message: 'Session is live' });
});

// @desc    End session
const endSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await query("UPDATE live_sessions SET status = 'ended', end_time = NOW() WHERE id = $1", [id]);
    
    // Trigger recording sync from Zoom
    try {
        const { syncZoomRecordings } = require('../utils/zoomUtils');
        // Run in background, don't await
        syncZoomRecordings(id).catch(err => {
            console.error(`[Session] Async recording sync failed for ${id}:`, err.message);
        });
    } catch (err) {
        console.error(`[Session] Error initiating recording sync:`, err.message);
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
    getZoomSDKConfig: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resSet = await query("SELECT zoom, instructor_id FROM live_sessions WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)", [id]);

        if (resSet.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = resSet.rows[0];
        const zoom = typeof session.zoom === 'string' ? JSON.parse(session.zoom || '{}') : (session.zoom || {});

        const { generateZoomSignature, decryptPasscode } = require('../utils/zoomUtils');
        const role = (req.user.id === session.instructor_id || req.user.role !== 'student') ? 1 : 0;

        let passWord = '';
        if (zoom.passcode) {
            try {
                // Determine if we are in mock mode from env or if mock utility should be used
                if (process.env.ZOOM_MOCK_MODE === 'true' || process.env.ZOOM_SDK_KEY?.startsWith('MOCK_')) {
                    passWord = zoom.passcode;
                } else {
                    passWord = decryptPasscode(zoom.passcode);
                }
            } catch (e) {
                // If it fails to decrypt, just use the raw value
                passWord = zoom.passcode;
            }
        }

        const meetingNumber = zoom.meeting_number || zoom.meetingNumber || zoom.meeting_id || zoom.meetingId;

        if (!meetingNumber) {
            return res.status(400).json({ message: 'No Zoom meeting associated with this session' });
        }

        try {
            const signature = await generateZoomSignature(meetingNumber, role);
            res.json({
                sdkKey: process.env.ZOOM_SDK_KEY || process.env.ZOOM_CLIENT_ID || 'MOCK_SDK_KEY',
                signature,
                meetingNumber: meetingNumber.toString(),
                passWord,
                userName: req.user.name || 'User',
                userEmail: req.user.email
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    getCourseLiveSessions
};
