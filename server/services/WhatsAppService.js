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
     * Resolve a Gupshup template ID from env, falling back to a hardcoded UUID.
     * Gupshup's send API silently "succeeds" (submitted) even when given a
     * human-readable template name instead of the real dashboard UUID - it
     * only fails later, asynchronously, via the delivery webhook ("template
     * did not match"). So an env var holding a name instead of a UUID looks
     * fine until you check delivery status. Only trust the env value if it's
     * actually shaped like a UUID.
     */
    _resolveTemplateId(envValue, fallbackUuid) {
        const isUuid = envValue && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(envValue);
        return isUuid ? envValue : fallbackUuid;
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
                params: variables.map(v => (v && v.toString().trim() !== '') ? v.toString() : ' ')
            }));
            payload.append('src.name', 'SkillDadChat');

            console.log(`[WhatsApp Gupshup DEBUG] Payload to send:`, {
                destination: cleanPhone,
                template: JSON.stringify({
                    id: templateId,
                    params: variables.map(v => (v && v.toString().trim() !== '') ? v.toString() : ' ')
                })
            });

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
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // skilldad_live_session [Name, CourseTitle, Topic, DateTime]
        const templateId = this._resolveTemplateId(process.env.GUPSHUP_TEMPLATE_LIVE, 'b77e149c-70ac-4002-86f8-f38bc1f2049c');

        return this.sendTemplateMessage(
            phone,
            templateId,
            [studentName, courseTitle || 'Your Course', topic, formattedTime]
        );
    }

    /**
     * Notify about a newly scheduled exam
     */
    async notifyExamScheduled(studentName, phone, examTitle, courseTitle, scheduledDate) {
        const formattedDate = new Date(scheduledDate).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // skilldad_exam_scheduled [Name, CourseTitle, ExamTitle, DateTime]
        const templateId = this._resolveTemplateId(process.env.GUPSHUP_TEMPLATE_EXAM, '698a0181-1504-4eea-bfc6-3180e7a21ebb');

        return this.sendTemplateMessage(
            phone,
            templateId,
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
            process.env.GUPSHUP_TEMPLATE_CERT || 'skilldad_certificate',
            [studentName, courseTitle]
        );
    }

    /**
     * Notify about admin enrollment in a course
     */
    async notifyAdminEnrollment(studentName, phone, courseTitle, enrolledBy) {
        return this.notifyEnrollment(studentName, phone, courseTitle);
    }

    /**
     * Notify a new user with a welcome message right after registration
     */
    async notifyWelcome(studentName, phone) {
        // skilldad_welcome [Name]
        const templateId = this._resolveTemplateId(process.env.GUPSHUP_TEMPLATE_WELCOME, '067cd9c3-ce68-417c-90cf-aaf81aa74232');
        return this.sendTemplateMessage(phone, templateId, [studentName]);
    }

    /**
     * Notify about a course enrollment being confirmed
     */
    async notifyEnrollment(studentName, phone, courseTitle) {
        // skilldad_enrollment [Name, CourseTitle]
        const templateId = this._resolveTemplateId(process.env.GUPSHUP_TEMPLATE_ENROLL, 'e0659c7e-0ec9-48e2-876c-6a233594326b');
        return this.sendTemplateMessage(phone, templateId, [studentName, courseTitle]);
    }


}

module.exports = new WhatsAppService();
