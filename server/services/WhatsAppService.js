const axios = require('axios');

/**
 * WhatsApp Service (Gupshup Implementation)
 * 
 * Handles automated WhatsApp communications using Gupshup's Template API.
 */
class WhatsAppService {
    constructor() {
        this.apiKey = process.env.GUPSHUP_API_KEY || '';
        this.source = process.env.GUPSHUP_SOURCE || ''; // Your Gupshup Source Number (e.g., 91xxxxxxxxxx)
        this.baseUrl = 'https://api.gupshup.io/wa/api/v1/template/msg';
        this.isEnabled = !!(this.apiKey && this.source);
    }

    /**
     * Send a template message to a student via Gupshup
     * @param {string} phone - Student phone number with country code (e.g., 919999999999)
     * @param {string} templateId - The Template ID from Gupshup Dashboard
     * @param {Array} variables - Variables to inject into the template
     */
    async sendTemplateMessage(phone, templateId, variables = []) {
        // Gupshup expects phone numbers without the '+' sign usually, or handles it. 
        // We'll strip everything except digits.
        const cleanPhone = phone ? phone.toString().replace(/\D/g, '') : '';

        if (!this.isEnabled) {
            console.log(`[WhatsApp Gupshup] SIMULATION: Template ID "${templateId}" -> ${cleanPhone || 'UNKNOWN'} | Vars: ${variables.join(', ')}`);
            return {
                id: `sim_${Math.random().toString(36).substr(2, 9)}`,
                status: 'simulated'
            };
        }

        if (!cleanPhone) {
            console.error(`[WhatsApp Gupshup] Attempted to send to empty phone number`);
            return;
        }

        try {
            // 1. Gupshup Template Message Format
            const payload = new URLSearchParams();
            payload.append('source', this.source);
            payload.append('destination', cleanPhone);
            payload.append('template', JSON.stringify({
                id: templateId,
                params: variables.map(v => v ? v.toString() : '')
            }));
            payload.append('src.name', 'SkillDadChat');

            const response = await axios.post(
                this.baseUrl,
                payload,
                {
                    headers: {
                        'apikey': this.apiKey,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );


            if (response.data.status === 'submitted' || response.data.status === 'success') {
                console.log(`[WhatsApp Gupshup] Success: ${templateId} sent to ${cleanPhone}`);
                return response.data;
            } else {
                console.error(`[WhatsApp Gupshup] API REJECTION for ${cleanPhone}:`, response.data);
                throw new Error(response.data.message || 'Gupshup submission failed');
            }
        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error(`[WhatsApp Gupshup] API ERROR for ${cleanPhone}:`, errorMsg);
            throw error;
        }
    }


    /**
     * Notify about a newly scheduled live session
     */
    async notifyLiveSessionScheduled(studentName, phone, topic, startTime, courseTitle) {
        const formattedTime = new Date(startTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // skilldad_live_session [Name, CourseTitle, Topic, DateTime]
        return this.sendTemplateMessage(
            phone,
            process.env.GUPSHUP_TEMPLATE_LIVE || 'common_status',
            [studentName, courseTitle || 'Your Course', topic, formattedTime]
        );
    }

    /**
     * Notify about a newly scheduled exam
     */
    async notifyExamScheduled(studentName, phone, examTitle, courseTitle, scheduledDate) {
        const formattedDate = new Date(scheduledDate).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // skilldad_exam_scheduled [Name, CourseTitle, ExamTitle, DateTime]
        return this.sendTemplateMessage(
            phone,
            process.env.GUPSHUP_TEMPLATE_EXAM || 'common_status',
            [studentName, courseTitle || 'Your Course', examTitle, formattedDate]
        );
    }

    /**
     * Notify about exam results
     */
    async notifyExamResult(studentName, phone, examTitle, score, percentage, passed) {
        const resultStatus = passed ? 'Passed ✅' : 'Not Cleared ❌';
        const scoreText = `${score} (${percentage.toFixed(2)}%)`;

        // skilldad_exam_result [Name, ExamTitle, Score, Status]
        return this.sendTemplateMessage(
            phone,
            process.env.GUPSHUP_TEMPLATE_RESULT || 'common_status',
            [studentName, examTitle, scoreText, resultStatus]
        );
    }

    /**
     * Notify about course completion and certificate
     */
    async notifyCourseCompletion(studentName, phone, courseTitle) {
        // skilldad_certificate [Name, CourseTitle]
        return this.sendTemplateMessage(
            phone,
            process.env.GUPSHUP_TEMPLATE_CERT || 'common_status',
            [studentName, courseTitle]
        );
    }

    /**
     * Notify about admin enrollment in a course
     */
    async notifyAdminEnrollment(studentName, phone, courseTitle, enrolledBy) {
        // common_status [Item, NewStatus]
        return this.sendTemplateMessage(
            phone,
            process.env.GUPSHUP_TEMPLATE_ENROLL || 'common_status',
            [`Enrollment in ${courseTitle}`, `Activated by ${enrolledBy}`]
        );
    }


}

module.exports = new WhatsAppService();
