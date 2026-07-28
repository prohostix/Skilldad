const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { query } = require('../config/postgres');
const whatsAppService = require('../services/WhatsAppService');
const notificationService = require('../services/NotificationService');

// @desc    Get student's own notifications
// @route   GET /api/notifications/my
// @access  Private (Student)
router.get('/my', protect, async (req, res) => {
    try {
        const logsRes = await query(`
            SELECT id, type, metadata, message, delivery_status, created_at, is_read
            FROM notification_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.user.id]);
        res.json(logsRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private (Student)
router.put('/read', protect, async (req, res) => {
    try {
        await query(`
            UPDATE notification_logs SET is_read = true, updated_at = NOW()
            WHERE user_id = $1 AND is_read = false
        `, [req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all notification logs (Admin only)
// @route   GET /api/notifications/logs
// @access  Private (Admin)
router.get('/logs', protect, authorize('admin'), async (req, res) => {
    try {
        const logsRes = await query(`
            SELECT *, delivery_status as status FROM notification_logs
            ORDER BY created_at DESC
            LIMIT 100
        `);
        res.json(logsRes.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get service status
// @route   GET /api/notifications/status
// @access  Private (Admin)
router.get('/status', protect, authorize('admin'), async (req, res) => {
    res.json({
        whatsapp: {
            enabled: whatsAppService.isEnabled,
            provider: 'Gupshup',
            baseUrl: whatsAppService.baseUrl
        },
        email: {
            enabled: true, // Assuming email is always active if configured
            provider: 'Nodemailer/SendGrid'
        }
    });
});

// @desc    Send test WhatsApp message
// @route   POST /api/notifications/test-whatsapp
// @access  Private (Admin)
router.post('/test-whatsapp', protect, authorize('admin'), async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await whatsAppService.sendTemplateMessage(
            phone,
            'test_notification_v1',
            ['Admin Test User', 'SkillDad Engineering Hub']
        );
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
