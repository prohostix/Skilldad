const { query } = require('../config/postgres');

/**
 * Exam Access Control Service using PostgreSQL
 * Handles exam access validation and status management
 */

/**
 * Checks if a student can access an exam
 * 
 * @param {string} examId - The exam to check access for
 * @param {string} studentId - The student requesting access
 * @returns {Object} { canAccess: boolean, reason: string, timeRemaining?: number, exam?: Object }
 */
async function checkExamAccess(examId, studentId) {
  try {
    // 1. Fetch exam from PG
    const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
    const exam = examRes.rows[0];

    if (!exam) {
      return { canAccess: false, reason: 'Exam not found' };
    }

    // 2. Verify student enrollment and batch access from PG
    const enrollRes = await query(`
        SELECT * FROM enrollments 
        WHERE student_id = $1 AND course_id = $2 AND status = 'active'
    `, [studentId.toString(), exam.course_id]);

    const enrollment = enrollRes.rows[0];
    if (!enrollment) {
      return { canAccess: false, reason: 'Not enrolled in course' };
    }

    // 2b. Batch access check
    if (exam.batch_ids && exam.batch_ids.length > 0 && !exam.batch_ids.includes(enrollment.batch_id)) {
      return { canAccess: false, reason: 'This exam is restricted to another batch' };
    }

    // 3. Check exam status
    const restrictedStatuses = ['completed', 'graded', 'published'];
    if (restrictedStatuses.includes(exam.status)) {
      return { canAccess: false, reason: 'Exam has ended' };
    }

    // 4. Check time window
    const now = new Date();
    const startTime = exam.scheduled_start ? new Date(exam.scheduled_start) : new Date(0);
    const endTime = exam.scheduled_end ? new Date(exam.scheduled_end) : new Date('2099-12-31T23:59:59Z');

    if (now < startTime) {
      const minutesUntilStart = Math.floor((startTime - now) / 60000);
      return {
        canAccess: false,
        reason: `Exam starts in ${minutesUntilStart} minutes`,
        startsAt: startTime
      };
    }

    if (now > endTime) {
      if (!exam.allow_late_submission) {
        return { canAccess: false, reason: 'Exam time has expired' };
      }
      const lateDeadline = new Date(exam.late_submission_deadline);
      if (now > lateDeadline) {
        return { canAccess: false, reason: 'Late submission deadline passed' };
      }
    }

    // 5. Check for existing submission in PG
    const subRes = await query(`
        SELECT * FROM exam_submissions_new 
        WHERE exam_id = $1 AND student_id = $2 AND status IN ('submitted', 'graded')
    `, [examId, studentId.toString()]);

    if (subRes.rows.length > 0) {
      return { canAccess: false, reason: 'Already submitted' };
    }

    // 6. Calculate time remaining
    const effectiveEndTime = exam.allow_late_submission && exam.late_submission_deadline
      ? new Date(exam.late_submission_deadline)
      : endTime;

    const timeRemaining = Math.floor((effectiveEndTime - now) / 1000); // seconds

    return {
      canAccess: true,
      reason: 'Access granted',
      timeRemaining: Math.max(0, timeRemaining),
      exam // Returning the Postgres row object
    };
  } catch (error) {
    console.error('Error checking exam access (PG):', error);
    throw error;
  }
}

module.exports = {
  checkExamAccess,
  // Other methods if needed can be added here or kept as stubs
  isExamActive: (exam) => {
    const now = new Date();
    const startTime = exam.scheduled_start ? new Date(exam.scheduled_start) : new Date(0);
    const endTime = exam.scheduled_end ? new Date(exam.scheduled_end) : new Date('2099-12-31T23:59:59Z');
    return now >= startTime && now <= endTime;
  },
  calculateTimeRemaining: (exam) => {
    const now = new Date();
    const endTime = exam.scheduled_end ? new Date(exam.scheduled_end) : new Date('2099-12-31T23:59:59Z');
    const effectiveEndTime = exam.allow_late_submission && exam.late_submission_deadline
      ? new Date(exam.late_submission_deadline)
      : endTime;
    return Math.floor(Math.max(0, effectiveEndTime - now) / 1000);
  },
  hasExamEnded: (exam) => {
    const now = new Date();
    const endTime = exam.scheduled_end ? new Date(exam.scheduled_end) : new Date('2099-12-31T23:59:59Z');
    const effectiveEndTime = exam.allow_late_submission && exam.late_submission_deadline
      ? new Date(exam.late_submission_deadline)
      : endTime;
    return now > effectiveEndTime;
  },
  completeExam: async (examId) => {
    await query("UPDATE exams SET status = 'completed', updated_at = NOW() WHERE id = $1", [examId]);
  }
};
