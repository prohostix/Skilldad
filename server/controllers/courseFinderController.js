const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');
const { scoreCourses } = require('../utils/courseFinderScoring');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// @desc    Get active Course Finder questions + answers, in order
// @route   GET /api/course-finder/questions
const getActiveQuestions = asyncHandler(async (req, res) => {
    const qRes = await query(`
        SELECT id, question, helper_text, category, type, required, display_order, config
        FROM course_finder_questions WHERE active = true ORDER BY display_order ASC
    `);
    const questions = qRes.rows;
    if (questions.length === 0) return res.json([]);

    const qIds = questions.map((q) => q.id);
    const aRes = await query(`
        SELECT id, question_id, label, description, icon, display_order
        FROM course_finder_answers WHERE active = true AND question_id = ANY($1::text[]) ORDER BY display_order ASC
    `, [qIds]);

    const answersByQ = {};
    aRes.rows.forEach((a) => {
        (answersByQ[a.question_id] = answersByQ[a.question_id] || []).push(a);
    });

    res.json(questions.map((q) => ({
        id: q.id,
        question: q.question,
        helperText: q.helper_text,
        category: q.category,
        type: q.type,
        required: q.required,
        order: q.display_order,
        config: q.config || {},
        answers: (answersByQ[q.id] || []).map((a) => ({
            id: a.id, label: a.label, description: a.description, icon: a.icon
        }))
    })));
});

// @desc    Start a new attempt, or resume an in-progress one
// @route   POST /api/course-finder/attempts
const startAttempt = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const isPreview = req.body?.isPreview === true && req.user.role?.toLowerCase() === 'admin';

    if (!isPreview) {
        const existing = await query(`
            SELECT id FROM course_finder_attempts
            WHERE student_id = $1 AND status = 'in_progress' AND is_preview = false
            ORDER BY started_at DESC LIMIT 1
        `, [studentId]);
        if (existing.rows.length > 0) {
            return res.json({ attemptId: existing.rows[0].id, resumed: true });
        }
    }

    const attemptId = genId('cfat');
    await query(`
        INSERT INTO course_finder_attempts (id, student_id, status, is_current, is_preview)
        VALUES ($1, $2, 'in_progress', false, $3)
    `, [attemptId, studentId, isPreview]);

    if (!isPreview) {
        await query(`
            UPDATE users SET course_finder_status = 'IN_PROGRESS'
            WHERE id = $1 AND course_finder_status NOT IN ('COMPLETED')
        `, [studentId]);
    }

    res.status(201).json({ attemptId, resumed: false });
});

// @desc    Get saved responses for an attempt (resume support)
// @route   GET /api/course-finder/attempts/:id/responses
const getAttemptResponses = asyncHandler(async (req, res) => {
    const { id: attemptId } = req.params;
    const attemptRes = await query('SELECT id, student_id, status FROM course_finder_attempts WHERE id = $1', [attemptId]);
    const attempt = attemptRes.rows[0];
    if (!attempt || attempt.student_id !== req.user.id) {
        res.status(404);
        throw new Error('Attempt not found');
    }
    const rRes = await query('SELECT question_id, answer_ids, custom_text FROM course_finder_responses WHERE attempt_id = $1', [attemptId]);
    res.json({
        status: attempt.status,
        responses: rRes.rows.map((r) => ({ questionId: r.question_id, answerIds: r.answer_ids, customText: r.custom_text }))
    });
});

// @desc    Save (upsert) one question's response
// @route   PUT /api/course-finder/attempts/:id/responses
const submitResponse = asyncHandler(async (req, res) => {
    const { id: attemptId } = req.params;
    const { questionId, answerIds, customText } = req.body;

    const attemptRes = await query('SELECT id, student_id, status FROM course_finder_attempts WHERE id = $1', [attemptId]);
    const attempt = attemptRes.rows[0];
    if (!attempt || attempt.student_id !== req.user.id) {
        res.status(404);
        throw new Error('Attempt not found');
    }
    if (attempt.status === 'completed') {
        res.status(400);
        throw new Error('This attempt is already completed');
    }

    const qRes = await query('SELECT id, question, category FROM course_finder_questions WHERE id = $1', [questionId]);
    const question = qRes.rows[0];
    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    let labels = [];
    if (Array.isArray(answerIds) && answerIds.length > 0) {
        const ansRes = await query('SELECT id, label FROM course_finder_answers WHERE id = ANY($1::text[])', [answerIds]);
        labels = ansRes.rows.map((a) => a.label);
    }

    const responseId = genId('cfr');
    await query(`
        INSERT INTO course_finder_responses (id, attempt_id, question_id, question_snapshot, category_snapshot, answer_ids, answer_labels_snapshot, custom_text, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, NOW())
        ON CONFLICT (attempt_id, question_id) DO UPDATE SET
            answer_ids = EXCLUDED.answer_ids,
            answer_labels_snapshot = EXCLUDED.answer_labels_snapshot,
            custom_text = EXCLUDED.custom_text,
            updated_at = NOW()
    `, [responseId, attemptId, questionId, question.question, question.category, JSON.stringify(answerIds || []), JSON.stringify(labels), customText || null]);

    res.json({ success: true });
});

// @desc    Complete an attempt: validate required answers, score courses, save recommendations
// @route   POST /api/course-finder/attempts/:id/complete
const completeAttempt = asyncHandler(async (req, res) => {
    const { id: attemptId } = req.params;
    const attemptRes = await query('SELECT * FROM course_finder_attempts WHERE id = $1', [attemptId]);
    const attempt = attemptRes.rows[0];
    if (!attempt || attempt.student_id !== req.user.id) {
        res.status(404);
        throw new Error('Attempt not found');
    }

    const requiredQs = await query('SELECT id FROM course_finder_questions WHERE active = true AND required = true');
    const responded = await query('SELECT question_id FROM course_finder_responses WHERE attempt_id = $1', [attemptId]);
    const respondedIds = new Set(responded.rows.map((r) => r.question_id));
    const missing = requiredQs.rows.filter((q) => !respondedIds.has(q.id));
    if (missing.length > 0) {
        res.status(400);
        throw new Error('Please choose an option to continue.');
    }

    const responsesRes = await query(`
        SELECT question_id, category_snapshot, answer_ids, answer_labels_snapshot, custom_text
        FROM course_finder_responses WHERE attempt_id = $1
    `, [attemptId]);

    const allAnswerIds = [...new Set(responsesRes.rows.flatMap((r) => r.answer_ids || []))];
    const mappingByAnswerId = {};
    if (allAnswerIds.length > 0) {
        const mapRes = await query('SELECT id, mapping FROM course_finder_answers WHERE id = ANY($1::text[])', [allAnswerIds]);
        mapRes.rows.forEach((a) => { mappingByAnswerId[a.id] = a.mapping || {}; });
    }

    const coursesRes = await query('SELECT * FROM courses WHERE is_published = true');
    const { recommendations, interestAreas } = scoreCourses(responsesRes.rows, mappingByAnswerId, coursesRes.rows);

    await query('DELETE FROM course_finder_recommendations WHERE attempt_id = $1', [attemptId]);
    for (let i = 0; i < recommendations.length; i++) {
        const r = recommendations[i];
        await query(`
            INSERT INTO course_finder_recommendations (id, attempt_id, course_id, career_role, score, rank, reasons)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
        `, [genId('cfrec'), attemptId, r.courseId, r.careerRole, r.score, i + 1, JSON.stringify(r.reasons)]);
    }

    await query(`UPDATE course_finder_attempts SET status = 'completed', completed_at = NOW(), is_current = true WHERE id = $1`, [attemptId]);

    if (!attempt.is_preview) {
        await query(`
            UPDATE course_finder_attempts SET is_current = false
            WHERE student_id = $1 AND id != $2 AND status = 'completed'
        `, [attempt.student_id, attemptId]);
        await query(`UPDATE users SET course_finder_status = 'COMPLETED' WHERE id = $1`, [attempt.student_id]);
    }

    res.json({ success: true, attemptId, hasRecommendations: recommendations.length > 0, interestAreas });
});

const shapeResultCourse = (row) => (row.course_id ? {
    id: row.course_id,
    title: row.title,
    thumbnail: row.thumbnail,
    category: row.category,
    hasPlacementSupport: row.program_type === 'wbl_abroad' || row.program_type === 'wbl_domestic',
    skillsDeveloped: row.skills_developed || [],
    durationWeeks: row.duration_weeks,
    moduleCount: Array.isArray(row.modules) ? row.modules.length : 0,
    modulePreview: Array.isArray(row.modules) ? row.modules.slice(0, 5).map((m) => m.title) : []
} : null);

const getResultForAttempt = async (attemptId) => {
    const attemptRes = await query('SELECT id, completed_at FROM course_finder_attempts WHERE id = $1', [attemptId]);
    const attempt = attemptRes.rows[0];
    if (!attempt) return null;

    const recRes = await query(`
        SELECT r.rank, r.score, r.career_role, r.reasons,
               c.id as course_id, c.title, c.thumbnail, c.category, c.program_type, c.skills_developed, c.modules, c.duration_weeks
        FROM course_finder_recommendations r
        LEFT JOIN courses c ON r.course_id = c.id
        WHERE r.attempt_id = $1 ORDER BY r.rank ASC
    `, [attemptId]);

    return {
        attemptId: attempt.id,
        completedAt: attempt.completed_at,
        recommendations: recRes.rows.map((r) => ({
            rank: r.rank, score: r.score, careerRole: r.career_role, reasons: r.reasons || [],
            course: shapeResultCourse(r)
        }))
    };
};

// @desc    Get the student's current (latest) completed result
// @route   GET /api/course-finder/my-result
const getMyLatestResult = asyncHandler(async (req, res) => {
    const attemptRes = await query(`
        SELECT id FROM course_finder_attempts
        WHERE student_id = $1 AND status = 'completed' AND is_current = true AND is_preview = false
        ORDER BY completed_at DESC LIMIT 1
    `, [req.user.id]);
    if (attemptRes.rows.length === 0) return res.json(null);
    res.json(await getResultForAttempt(attemptRes.rows[0].id));
});

// @desc    Get result for a specific attempt (used right after finishing the quiz, incl. preview)
// @route   GET /api/course-finder/attempts/:id/result
const getAttemptResult = asyncHandler(async (req, res) => {
    const { id: attemptId } = req.params;
    const attemptRes = await query('SELECT id, student_id FROM course_finder_attempts WHERE id = $1', [attemptId]);
    const attempt = attemptRes.rows[0];
    if (!attempt || (attempt.student_id !== req.user.id)) {
        res.status(404);
        throw new Error('Attempt not found');
    }
    const result = await getResultForAttempt(attemptId);
    if (!result) {
        res.status(404);
        throw new Error('Result not found');
    }
    res.json(result);
});

// @desc    Dismiss the first-login invitation (never overrides a completed/in-progress state)
// @route   PUT /api/course-finder/dismiss
const dismissInvitation = asyncHandler(async (req, res) => {
    await query(`UPDATE users SET course_finder_status = 'DISMISSED' WHERE id = $1 AND course_finder_status = 'NOT_STARTED'`, [req.user.id]);
    res.json({ success: true });
});

// @desc    Get the student's Course Finder status (drives the dashboard invitation/card)
// @route   GET /api/course-finder/status
const getMyStatus = asyncHandler(async (req, res) => {
    const r = await query('SELECT course_finder_status FROM users WHERE id = $1', [req.user.id]);
    res.json({ status: r.rows[0]?.course_finder_status || 'NOT_STARTED' });
});

module.exports = {
    getActiveQuestions,
    startAttempt,
    getAttemptResponses,
    submitResponse,
    completeAttempt,
    getMyLatestResult,
    getAttemptResult,
    dismissInvitation,
    getMyStatus
};
