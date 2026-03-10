const notificationService = require('./NotificationService');
const emailTemplates = require('../utils/emailTemplates');
const { query } = require('../config/postgres');

/**
 * Exam Notification Service
 * Handles all exam-related notifications (email + in-app)
 * Integrates with existing NotificationService for multi-channel delivery
 */
class ExamNotificationService {
    /**
     * Notify students when an exam is scheduled
     * @param {Object} exam - Exam document with populated course
     * @param {Array} students - Array of student user objects (optional, will fetch if not provided)
     */
    async notifyExamScheduled(exam, students = null) {
        try {
            if (!students) {
                const courseId = exam.course_id || exam.course?._id || exam.course;
                const enrollmentsRes = await query(`
                    SELECT u.id as _id, u.name, u.email, u.profile, u.phone 
                    FROM enrollments e
                    JOIN users u ON e.student_id = u.id
                    WHERE e.course_id = $1 AND e.status = 'active'
                `, [courseId]);
                
                students = enrollmentsRes.rows;
            }

            // Get course details
            let courseTitle = exam.course?.title || exam.course_title;
            if (!courseTitle) {
                const courseRes = await query('SELECT title FROM courses WHERE id = $1', [exam.course_id || exam.course]);
                courseTitle = courseRes.rows[0]?.title || 'Course';
            }

            console.log(`[ExamNotificationService] Notifying ${students.length} students about exam: ${exam.title}`);

            // Send notifications to all students
            const notificationPromises = students.map(student => 
                notificationService.send(
                    {
                        _id: student._id,
                        name: student.name,
                        email: student.email,
                        phone: student.profile?.phone || student.phone
                    },
                    'exam',
                    {
                        examTitle: exam.title,
                        courseTitle: courseTitle,
                        scheduledDate: exam.scheduled_start_time || exam.scheduledStartTime
                    },
                    { email: true, whatsapp: true }
                ).catch(err => {
                    console.error(`[ExamNotificationService] Failed to notify ${student.email}:`, err.message);
                    return null;
                })
            );

            const results = await Promise.allSettled(notificationPromises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

            console.log(`[ExamNotificationService] Exam scheduled notifications: ${successCount}/${students.length} sent`);

            return {
                success: true,
                sent: successCount,
                total: students.length
            };
        } catch (error) {
            console.error('[ExamNotificationService] Error in notifyExamScheduled:', error.message);
            throw error;
        }
    }

    /**
     * Send exam reminder notification (30 minutes before exam)
     * @param {Object} exam - Exam document with populated course
     * @param {Array} students - Array of student user objects (optional, will fetch if not provided)
     */
    async notifyExamReminder(exam, students = null) {
        try {
            if (!students) {
                const courseId = exam.course_id || exam.course?._id || exam.course;
                const enrollmentsRes = await query(`
                    SELECT u.id as _id, u.name, u.email, u.profile, u.phone 
                    FROM enrollments e
                    JOIN users u ON e.student_id = u.id
                    WHERE e.course_id = $1 AND e.status = 'active'
                `, [courseId]);
                
                students = enrollmentsRes.rows;
            }

            // Get course details
            let courseTitle = exam.course?.title || exam.course_title;
            if (!courseTitle) {
                const courseRes = await query('SELECT title FROM courses WHERE id = $1', [exam.course_id || exam.course]);
                courseTitle = courseRes.rows[0]?.title || 'Course';
            }

            console.log(`[ExamNotificationService] Sending exam reminder to ${students.length} students for: ${exam.title}`);

            const notificationPromises = students.map(student => 
                this._sendExamReminder(student, exam, courseTitle)
                    .catch(err => {
                        console.error(`[ExamNotificationService] Failed to send reminder to ${student.email}:`, err.message);
                        return null;
                    })
            );

            const results = await Promise.allSettled(notificationPromises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

            console.log(`[ExamNotificationService] Exam reminder notifications: ${successCount}/${students.length} sent`);

            return {
                success: true,
                sent: successCount,
                total: students.length
            };
        } catch (error) {
            console.error('[ExamNotificationService] Error in notifyExamReminder:', error.message);
            throw error;
        }
    }

    /**
     * Internal method to send exam reminder
     */
    async _sendExamReminder(student, exam, course) {
        // For now, use the existing notification service with exam type
        // In the future, we can add a specific 'examReminder' type to NotificationService
        return notificationService.send(
            {
                _id: student._id,
                name: student.name,
                email: student.email,
                phone: student.profile?.phone || student.phone
            },
            'examReminder',
            {
                examTitle: exam.title,
                courseTitle: courseTitle,
                startTime: exam.scheduled_start_time || exam.scheduledStartTime,
                duration: exam.duration
            },
            { email: true, whatsapp: false } // Email only for reminders
        );
    }

    /**
     * Notify student when results are published
     * @param {Object} exam - Exam document
     * @param {Object} student - Student user object
     * @param {Object} result - Result document with scores
     */
    async notifyResultPublished(exam, student, result) {
        try {
            console.log(`[ExamNotificationService] Notifying ${student.email} about published result for: ${exam.title}`);

            await notificationService.send(
                {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    phone: student.profile?.phone || student.phone
                },
                'examResult',
                {
                    examTitle: exam.title,
                    score: `${result.score || result.obtainedMarks}/${result.total_marks || result.totalMarks}`,
                    percentage: result.percentage,
                    passed: result.passed || result.isPassed
                },
                { email: true, whatsapp: true }
            );

            return { success: true };
        } catch (error) {
            console.error('[ExamNotificationService] Error in notifyResultPublished:', error.message);
            throw error;
        }
    }

    /**
     * Notify student when exam is cancelled
     * @param {Object} exam - Exam document with populated course
     * @param {Array} students - Array of student user objects (optional, will fetch if not provided)
     * @param {String} reason - Cancellation reason
     */
    async notifyExamCancelled(exam, students = null, reason = '') {
        try {
            if (!students) {
                const courseId = exam.course_id || exam.course?._id || exam.course;
                const enrollmentsRes = await query(`
                    SELECT u.id as _id, u.name, u.email, u.profile, u.phone 
                    FROM enrollments e
                    JOIN users u ON e.student_id = u.id
                    WHERE e.course_id = $1 AND e.status = 'active'
                `, [courseId]);
                
                students = enrollmentsRes.rows;
            }

            // Get course details
            let courseTitle = exam.course?.title || exam.course_title;
            if (!courseTitle) {
                const courseRes = await query('SELECT title FROM courses WHERE id = $1', [exam.course_id || exam.course]);
                courseTitle = courseRes.rows[0]?.title || 'Course';
            }

            console.log(`[ExamNotificationService] Notifying ${students.length} students about exam cancellation: ${exam.title}`);

            const notificationPromises = students.map(student => 
                this._sendExamCancellation(student, exam, courseTitle, reason)
                    .catch(err => {
                        console.error(`[ExamNotificationService] Failed to notify ${student.email}:`, err.message);
                        return null;
                    })
            );

            const results = await Promise.allSettled(notificationPromises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

            console.log(`[ExamNotificationService] Exam cancellation notifications: ${successCount}/${students.length} sent`);

            return {
                success: true,
                sent: successCount,
                total: students.length
            };
        } catch (error) {
            console.error('[ExamNotificationService] Error in notifyExamCancelled:', error.message);
            throw error;
        }
    }

    /**
     * Internal method to send exam cancellation notification
     */
    async _sendExamCancellation(student, exam, course, reason) {
        // For now, use a custom implementation since 'examCancelled' type doesn't exist yet
        // We'll need to add this to the main NotificationService
        return notificationService.send(
            {
                _id: student._id,
                name: student.name,
                email: student.email,
                phone: student.profile?.phone || student.phone
            },
            'examCancelled',
            {
                examTitle: exam.title,
                courseTitle: courseTitle,
                reason: reason
            },
            { email: true, whatsapp: false }
        );
    }

    /**
     * Notify student when submission is received
     * @param {Object} submission - Submission document
     * @param {Object} student - Student user object
     * @param {Object} exam - Exam document
     */
    async notifySubmissionReceived(submission, student, exam) {
        try {
            console.log(`[ExamNotificationService] Sending submission confirmation to ${student.email} for: ${exam.title}`);

            await this._sendSubmissionConfirmation(student, exam, submission);

            return { success: true };
        } catch (error) {
            console.error('[ExamNotificationService] Error in notifySubmissionReceived:', error.message);
            throw error;
        }
    }

    /**
     * Internal method to send submission confirmation
     */
    async _sendSubmissionConfirmation(student, exam, submission) {
        // For now, use a custom implementation since 'submissionConfirmation' type doesn't exist yet
        return notificationService.send(
            {
                _id: student._id,
                name: student.name,
                email: student.email,
                phone: student.profile?.phone || student.phone
            },
            'submissionConfirmation',
            {
                examTitle: exam.title,
                submittedAt: submission.submitted_at || submission.submittedAt,
                isAutoSubmitted: submission.is_auto_submitted || submission.isAutoSubmitted
            },
            { email: true, whatsapp: false }
        );
    }

    /**
     * Bulk notify multiple students efficiently
     * @param {Array} userIds - Array of user IDs
     * @param {String} type - Notification type
     * @param {Object} data - Notification data
     */
    async sendBulkNotification(userIds, type, data) {
        try {
            const usersRes = await query(`
                SELECT id as _id, name, email, profile, phone 
                FROM users 
                WHERE id = ANY($1)
            `, [userIds]);
            const users = usersRes.rows;

            console.log(`[ExamNotificationService] Sending bulk notification (${type}) to ${users.length} users`);

            const notificationPromises = users.map(user => 
                notificationService.send(
                    {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.profile?.phone || user.phone
                    },
                    type,
                    data,
                    { email: true, whatsapp: true }
                ).catch(err => {
                    console.error(`[ExamNotificationService] Failed to notify ${user.email}:`, err.message);
                    return null;
                })
            );

            const results = await Promise.allSettled(notificationPromises);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
            const failedCount = users.length - successCount;

            console.log(`[ExamNotificationService] Bulk notification complete: ${successCount} sent, ${failedCount} failed`);

            return {
                success: true,
                sent: successCount,
                failed: failedCount,
                total: users.length
            };
        } catch (error) {
            console.error('[ExamNotificationService] Error in sendBulkNotification:', error.message);
            throw error;
        }
    }
}

module.exports = new ExamNotificationService();
