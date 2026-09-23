const asyncHandler = require('express-async-handler');
const { query } = require('../config/postgres');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// @desc    List all questions (incl. inactive) with nested answers
// @route   GET /api/admin/course-finder/questions
const listQuestions = asyncHandler(async (req, res) => {
    const qRes = await query('SELECT * FROM course_finder_questions ORDER BY display_order ASC, id ASC');
    const questions = qRes.rows;
    const qIds = questions.map((q) => q.id);

    let answersByQ = {};
    if (qIds.length > 0) {
        const aRes = await query('SELECT * FROM course_finder_answers WHERE question_id = ANY($1::text[]) ORDER BY display_order ASC, id ASC', [qIds]);
        aRes.rows.forEach((a) => {
            (answersByQ[a.question_id] = answersByQ[a.question_id] || []).push(a);
        });
    }

    res.json(questions.map((q) => ({
        id: q.id, question: q.question, helperText: q.helper_text, category: q.category,
        type: q.type, required: q.required, order: q.display_order, active: q.active, config: q.config || {},
        answers: (answersByQ[q.id] || []).map((a) => ({
            id: a.id, label: a.label, description: a.description, icon: a.icon,
            order: a.display_order, active: a.active, mapping: a.mapping || {}
        }))
    })));
});

// @desc    Create a question
// @route   POST /api/admin/course-finder/questions
const createQuestion = asyncHandler(async (req, res) => {
    const { question, helperText, category, type, required, config } = req.body;
    if (!question || !category) {
        res.status(400);
        throw new Error('Question and category are required');
    }
    const maxRes = await query('SELECT COALESCE(MAX(display_order), 0) as max FROM course_finder_questions');
    const order = Number(maxRes.rows[0].max) + 1;
    const id = genId('cfq');
    await query(`
        INSERT INTO course_finder_questions (id, question, helper_text, category, type, required, display_order, config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    `, [id, question, helperText || null, category, type === 'multi' ? 'multi' : 'single', required !== false, order, JSON.stringify(config || {})]);
    res.status(201).json({ id });
});

// @desc    Update a question
// @route   PUT /api/admin/course-finder/questions/:id
const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { question, helperText, category, type, required, active, config } = req.body;
    await query(`
        UPDATE course_finder_questions SET
            question = COALESCE($1, question),
            helper_text = COALESCE($2, helper_text),
            category = COALESCE($3, category),
            type = COALESCE($4, type),
            required = COALESCE($5, required),
            active = COALESCE($6, active),
            config = COALESCE($7::jsonb, config),
            updated_at = NOW()
        WHERE id = $8
    `, [
        question ?? null, helperText ?? null, category ?? null, type ?? null,
        required === undefined ? null : required, active === undefined ? null : active,
        config ? JSON.stringify(config) : null, id
    ]);
    res.json({ success: true });
});

// @desc    Delete a question - soft-deletes (deactivates) if it has real student
//          responses on record, since those responses have a hard FK to this
//          question and a real delete would cascade-destroy that student's history.
// @route   DELETE /api/admin/course-finder/questions/:id
const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const usedRes = await query('SELECT 1 FROM course_finder_responses WHERE question_id = $1 LIMIT 1', [id]);
    if (usedRes.rows.length > 0) {
        await query('UPDATE course_finder_questions SET active = false WHERE id = $1', [id]);
        return res.json({ success: true, softDeleted: true });
    }
    await query('DELETE FROM course_finder_questions WHERE id = $1', [id]);
    res.json({ success: true, softDeleted: false });
});

// @desc    Duplicate a question + its answers (created inactive, for review before going live)
// @route   POST /api/admin/course-finder/questions/:id/duplicate
const duplicateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const qRes = await query('SELECT * FROM course_finder_questions WHERE id = $1', [id]);
    const q = qRes.rows[0];
    if (!q) {
        res.status(404);
        throw new Error('Question not found');
    }
    const maxRes = await query('SELECT COALESCE(MAX(display_order), 0) as max FROM course_finder_questions');
    const newId = genId('cfq');
    await query(`
        INSERT INTO course_finder_questions (id, question, helper_text, category, type, required, display_order, active, config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8::jsonb)
    `, [newId, `${q.question} (Copy)`, q.helper_text, q.category, q.type, q.required, Number(maxRes.rows[0].max) + 1, JSON.stringify(q.config || {})]);

    const ansRes = await query('SELECT * FROM course_finder_answers WHERE question_id = $1 ORDER BY display_order ASC', [id]);
    for (const a of ansRes.rows) {
        await query(`
            INSERT INTO course_finder_answers (id, question_id, label, description, icon, display_order, active, mapping)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        `, [genId('cfa'), newId, a.label, a.description, a.icon, a.display_order, a.active, JSON.stringify(a.mapping || {})]);
    }
    res.status(201).json({ id: newId });
});

// @desc    Move a question up/down (swaps display_order with its neighbor)
// @route   PUT /api/admin/course-finder/questions/:id/move
const moveQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body;
    const listRes = await query('SELECT id, display_order FROM course_finder_questions ORDER BY display_order ASC, id ASC');
    const list = listRes.rows;
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) {
        res.status(404);
        throw new Error('Question not found');
    }
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return res.json({ success: true });
    const a = list[idx], b = list[swapIdx];
    await query('UPDATE course_finder_questions SET display_order = $1 WHERE id = $2', [b.display_order, a.id]);
    await query('UPDATE course_finder_questions SET display_order = $1 WHERE id = $2', [a.display_order, b.id]);
    res.json({ success: true });
});

// @desc    Add an answer to a question
// @route   POST /api/admin/course-finder/questions/:questionId/answers
const createAnswer = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { label, description, icon, mapping } = req.body;
    if (!label) {
        res.status(400);
        throw new Error('Answer label is required');
    }
    const maxRes = await query('SELECT COALESCE(MAX(display_order), 0) as max FROM course_finder_answers WHERE question_id = $1', [questionId]);
    const order = Number(maxRes.rows[0].max) + 1;
    const id = genId('cfa');
    await query(`
        INSERT INTO course_finder_answers (id, question_id, label, description, icon, display_order, mapping)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `, [id, questionId, label, description || null, icon || null, order, JSON.stringify(mapping || {})]);
    res.status(201).json({ id });
});

// @desc    Update an answer (label/description/icon/active/mapping)
// @route   PUT /api/admin/course-finder/answers/:id
const updateAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { label, description, icon, active, mapping } = req.body;
    await query(`
        UPDATE course_finder_answers SET
            label = COALESCE($1, label),
            description = COALESCE($2, description),
            icon = COALESCE($3, icon),
            active = COALESCE($4, active),
            mapping = COALESCE($5::jsonb, mapping),
            updated_at = NOW()
        WHERE id = $6
    `, [label ?? null, description ?? null, icon ?? null, active === undefined ? null : active, mapping ? JSON.stringify(mapping) : null, id]);
    res.json({ success: true });
});

// @desc    Delete an answer - safe to hard-delete: student responses only store a
//          text/JSON snapshot of the answer, never a hard FK to this row.
// @route   DELETE /api/admin/course-finder/answers/:id
const deleteAnswer = asyncHandler(async (req, res) => {
    await query('DELETE FROM course_finder_answers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// @desc    Move an answer up/down within its question
// @route   PUT /api/admin/course-finder/answers/:id/move
const moveAnswer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { direction } = req.body;
    const curRes = await query('SELECT question_id FROM course_finder_answers WHERE id = $1', [id]);
    if (!curRes.rows[0]) {
        res.status(404);
        throw new Error('Answer not found');
    }
    const listRes = await query('SELECT id, display_order FROM course_finder_answers WHERE question_id = $1 ORDER BY display_order ASC, id ASC', [curRes.rows[0].question_id]);
    const list = listRes.rows;
    const idx = list.findIndex((a) => a.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return res.json({ success: true });
    const a = list[idx], b = list[swapIdx];
    await query('UPDATE course_finder_answers SET display_order = $1 WHERE id = $2', [b.display_order, a.id]);
    await query('UPDATE course_finder_answers SET display_order = $1 WHERE id = $2', [a.display_order, b.id]);
    res.json({ success: true });
});

// @desc    Suggest previously-used career categories/roles/skills so admin chip
//          pickers (answer mapping + course editor) stay consistent instead of drifting free-text
// @route   GET /api/admin/course-finder/tag-suggestions
const getTagSuggestions = asyncHandler(async (req, res) => {
    const catRes = await query(`SELECT DISTINCT career_category FROM courses WHERE career_category IS NOT NULL AND career_category != ''`);
    const roleCourseRes = await query(`SELECT DISTINCT jsonb_array_elements_text(career_roles) as role FROM courses WHERE jsonb_typeof(career_roles) = 'array'`);
    const skillCourseRes = await query(`SELECT DISTINCT jsonb_array_elements_text(skills_developed) as skill FROM courses WHERE jsonb_typeof(skills_developed) = 'array'`);
    const roleMapRes = await query(`SELECT DISTINCT jsonb_array_elements_text(mapping->'careerRoles') as role FROM course_finder_answers WHERE jsonb_typeof(mapping->'careerRoles') = 'array'`);
    const skillMapRes = await query(`SELECT DISTINCT jsonb_array_elements_text(mapping->'skills') as skill FROM course_finder_answers WHERE jsonb_typeof(mapping->'skills') = 'array'`);
    const categoryMapRes = await query(`SELECT DISTINCT mapping->>'careerCategory' as cat FROM course_finder_answers WHERE mapping ? 'careerCategory'`);

    const roles = new Set([...roleCourseRes.rows.map((r) => r.role), ...roleMapRes.rows.map((r) => r.role)].filter(Boolean));
    const skills = new Set([...skillCourseRes.rows.map((r) => r.skill), ...skillMapRes.rows.map((r) => r.skill)].filter(Boolean));
    const categories = new Set([...catRes.rows.map((r) => r.career_category), ...categoryMapRes.rows.map((r) => r.cat)].filter(Boolean));

    res.json({ careerRoles: [...roles].sort(), skills: [...skills].sort(), careerCategories: [...categories].sort() });
});

// @desc    Real, DB-backed Course Finder analytics - no synthetic/demo numbers
// @route   GET /api/admin/course-finder/analytics
const getAnalytics = asyncHandler(async (req, res) => {
    const startedRes = await query('SELECT COUNT(*) FROM course_finder_attempts WHERE is_preview = false');
    const completedRes = await query(`SELECT COUNT(*) FROM course_finder_attempts WHERE is_preview = false AND status = 'completed'`);
    const avgTimeRes = await query(`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_seconds
        FROM course_finder_attempts WHERE is_preview = false AND status = 'completed'
    `);

    const started = Number(startedRes.rows[0].count);
    const completed = Number(completedRes.rows[0].count);
    const avgSeconds = avgTimeRes.rows[0].avg_seconds ? Math.round(Number(avgTimeRes.rows[0].avg_seconds)) : null;

    const topByCategory = async (categoryName, limit = 5) => {
        const r = await query(`
            SELECT label, COUNT(*) as cnt FROM (
                SELECT jsonb_array_elements_text(resp.answer_labels_snapshot) as label
                FROM course_finder_responses resp
                JOIN course_finder_attempts att ON resp.attempt_id = att.id
                WHERE att.is_preview = false AND lower(resp.category_snapshot) = lower($1)
            ) t
            GROUP BY label ORDER BY cnt DESC LIMIT $2
        `, [categoryName, limit]);
        return r.rows.map((row) => ({ label: row.label, count: Number(row.cnt) }));
    };

    const [topGoals, topInterests, topJobRoles, topSkills] = await Promise.all([
        topByCategory('Goal'), topByCategory('Career Interest'), topByCategory('Dream Job'), topByCategory('Skills')
    ]);

    const topCoursesRes = await query(`
        SELECT c.title, COUNT(*) as cnt
        FROM course_finder_recommendations r
        JOIN course_finder_attempts att ON r.attempt_id = att.id
        LEFT JOIN courses c ON r.course_id = c.id
        WHERE att.is_preview = false AND r.rank = 1 AND c.title IS NOT NULL
        GROUP BY c.title ORDER BY cnt DESC LIMIT 5
    `);

    const conversionRes = await query(`
        SELECT COUNT(DISTINCT r.attempt_id) as converted
        FROM course_finder_recommendations r
        JOIN course_finder_attempts att ON r.attempt_id = att.id
        JOIN enrollments e ON e.course_id = r.course_id AND e.student_id = att.student_id AND e.created_at >= att.completed_at
        WHERE att.is_preview = false AND att.status = 'completed'
    `);

    res.json({
        started,
        completed,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
        avgCompletionSeconds: avgSeconds,
        topGoals, topInterests, topJobRoles, topSkills,
        topRecommendedCourses: topCoursesRes.rows.map((r) => ({ title: r.title, count: Number(r.cnt) })),
        conversions: Number(conversionRes.rows[0]?.converted || 0)
    });
});

module.exports = {
    listQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    moveAnswer,
    getTagSuggestions,
    getAnalytics
};
