const notificationService = require('../services/NotificationService');
const { query } = require('../config/postgres');

/**
 * @desc    Send demo notifications (Email & WhatsApp)
 * @route   POST /api/public/demo-notification
 * @access  Public
 */
const sendDemoNotification = async (req, res) => {
    try {
        const { name, email, phone, type = 'welcome' } = req.body;

        if (!name || (!email && !phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least a name and one contact method (email or phone)'
            });
        }

        // Mock data for the demo
        const demoData = {
            topic: 'Advanced Quantum Computing',
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
            examTitle: 'Final Neural Evaluation',
            courseTitle: 'Cybernetic Enhancements 101',
            scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
        };

        // Trigger Notification Engine (Industrial Grade)
        const finalLog = await notificationService.send(
            { name, email, phone },
            type,
            demoData,
            { email: !!email, whatsapp: !!phone }
        );

        res.json({
            success: true,
            message: 'Notification Processed',
            log: finalLog
        });
    } catch (error) {
        console.error('Demo Notification Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

/**
 * @desc    Get Recent Notification Logs (for the monitor)
 * @route   GET /api/public/notification-logs
 * @access  Public
 */
const getNotificationLogs = async (req, res) => {
    try {
        const result = await query('SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 10');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendDemoNotification,
    getNotificationLogs
};
