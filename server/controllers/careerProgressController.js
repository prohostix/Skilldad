const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

// @desc    Get the logged-in student's real career-progress signals: their
//          self-declared career goal, self-reported interview-prep status,
//          activity streak, and whether they've uploaded a resume document.
//          Everything else the Career Journey tracker needs (enrollments,
//          project submissions, job applications) is already fetched
//          elsewhere on the dashboard and combined client-side.
// @route   GET /api/users/me/career-progress
// @access  Private (Student)
const getCareerProgress = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const userRes = await query(
        `SELECT career_goal, interview_prep_completed, current_streak, longest_streak
         FROM users WHERE id = $1`,
        [studentId]
    );
    const user = userRes.rows[0] || {};

    const resumeRes = await query(
        `SELECT 1 FROM documents
         WHERE (student_id = $1 OR uploaded_by_id = $1)
           AND (
               LOWER(type) = 'resume'
               OR LOWER(type) LIKE '%resume%'
               OR LOWER(type) LIKE '%cv%'
               OR LOWER(title) LIKE '%resume%'
               OR LOWER(title) LIKE '%curriculum vitae%'
               OR LOWER(title) LIKE '%cv%'
               OR LOWER(file_name) LIKE '%resume%'
               OR LOWER(file_name) LIKE '%cv%'
           )
           AND (status IS NULL OR LOWER(status) NOT IN ('rejected'))
         LIMIT 1`,
        [studentId]
    );

    res.json({
        careerGoal: user.career_goal || null,
        interviewPrepCompleted: !!user.interview_prep_completed,
        currentStreak: user.current_streak || 0,
        longestStreak: user.longest_streak || 0,
        hasResumeUploaded: resumeRes.rows.length > 0,
    });
});

// @desc    Set the logged-in student's career goal (real, user-declared data -
//          this is the "Career Assessment" step in the Career Journey tracker).
// @route   PUT /api/users/me/career-goal
// @access  Private (Student)
const updateCareerGoal = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { careerGoal } = req.body;

    if (!careerGoal || !careerGoal.trim()) {
        res.status(400);
        throw new Error('Please provide a career goal');
    }

    await query('UPDATE users SET career_goal = $1 WHERE id = $2', [careerGoal.trim(), studentId]);
    res.json({ success: true, careerGoal: careerGoal.trim() });
});

// @desc    Toggle the logged-in student's self-reported interview-preparation status.
// @route   PUT /api/users/me/interview-prep
// @access  Private (Student)
const updateInterviewPrep = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const completed = !!req.body.completed;

    await query('UPDATE users SET interview_prep_completed = $1 WHERE id = $2', [completed, studentId]);
    res.json({ success: true, interviewPrepCompleted: completed });
});

module.exports = { getCareerProgress, updateCareerGoal, updateInterviewPrep };
