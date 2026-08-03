const express = require('express');
const router = express.Router();

const {
    createSession,
    getSessions,
    getSession,
    startSession,
    endSession,
    sendNotification,
    updateSession,
    deleteSession,
    getSessionStatusRoute,
    getRecordingStatus,
    getRecordingPlaybackUrl,
    getCourseLiveSessions,
    getJitsiSDKConfig,
} = require('../controllers/liveSessionController');

const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for recording uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../uploads/recordings');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, `rec_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for recordings
});

const {
    apiLimiter,
    createSessionLimiter,
    signedUrlLimiter,
    notifLimiter,
    redisRateLimiter,
} = require('../middleware/rateLimiter');

/*
 * RBAC Matrix
 * ─────────────────────────────────────────────────────────────
 * POST   /                      university, admin
 * GET    /                      university, admin, student
 * GET    /:id                   university, admin, student
 * PUT    /:id                   university, admin
 * DELETE /:id                   university, admin
 * PUT    /:id/start             university, admin
 * PUT    /:id/end               university, admin
 * GET    /:id/status            university, admin, student (lightweight)
 * POST   /:id/notify            university, admin
 * GET    /:id/recording         university, admin, student
 * GET    /:id/recording/playback university, admin, student
 */

// Apply global API rate limiter to all session routes
router.use(apiLimiter);

/* ── Collection routes ─────────────────────────────────────── */
router.route('/')
    .post(
        protect,
        authorize('university', 'admin', 'partner'),
        createSessionLimiter,
        redisRateLimiter('session_create', 15 * 60 * 1000, 10), // 10/15min cross-process
        createSession
    )
    .get(
        protect,
        authorize('university', 'admin', 'partner', 'student'),
        getSessions
    );

/* ── Item routes ───────────────────────────────────────────── */
router.route('/:id')
    .get(
        protect,
        authorize('university', 'admin', 'partner', 'student'),
        getSession
    )
    .put(
        protect,
        authorize('university', 'admin', 'partner'),
        updateSession
    )
    .delete(
        protect,
        authorize('university', 'admin', 'partner'),
        deleteSession
    );

/* ── State machine ─────────────────────────────────────────── */
router.put(
    '/:id/start',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    startSession
);

router.put(
    '/:id/end',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    endSession
);

/* ── Lightweight status poll (students can poll every 30s) ─── */
router.get(
    '/:id/status',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    getSessionStatusRoute
);

/* ── Notification dispatch ─────────────────────────────────── */
router.post(
    '/:id/notify',
    protect,
    authorize('university', 'admin', 'partner'),
    notifLimiter,
    redisRateLimiter('session_notify', 24 * 60 * 60 * 1000, 5), // 5/day cross-process
    sendNotification
);

/* ── Host session link (university + admin only) ──────────────*/
// router.get(
//     '/:id/host-link',
//     protect,
//     authorize('university', 'admin', 'partner', 'student'),
//     generateHostLink
// );

/* ── Recording status and Upload ───────────────────────────── */
router.post(
    '/:id/recording',
    protect,
    authorize('university', 'admin', 'partner'),
    upload.single('recording'), // Field name for file upload
    require('../controllers/liveSessionController').uploadSessionRecording
);

router.get(
    '/:id/recording',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    getRecordingStatus
);

/* ── Recording playback URL ────────────────────────────────── */
router.get(
    '/:id/recording/playback',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    getRecordingPlaybackUrl
);

/* ── Jitsi SDK configuration ────────────────────────────────── */
router.get(
    '/:id/jitsi-config',
    protect,
    authorize('university', 'admin', 'partner', 'student'),
    getJitsiSDKConfig
);

/* ── Track session join (metrics) ──────────────────────────── */
// router.post(
//     '/:id/join',
//     protect,
//     authorize('university', 'admin', 'student'),
//     trackSessionJoin
// );

/* ── Track session leave (metrics) ─────────────────────────── */
// router.post(
//     '/:id/leave',
//     protect,
//     authorize('university', 'admin', 'student'),
//     trackSessionLeave
// );

/* ── Get live sessions for a course ────────────────────────── */
router.get(
    '/course/:courseId',
    protect,
    authorize('university', 'admin', 'student'),
    getCourseLiveSessions
);

module.exports = router;
