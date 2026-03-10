const { query } = require('../config/postgres');

/**
 * @desc    Create online questions for an exam (bulk creation)
 * @route   POST /api/exams/:examId/questions
 * @access  Private (University/Admin)
 */
const createOnlineQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { questions } = req.body;

        // Validate request body
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ 
                message: 'Questions array is required and must not be empty' 
            });
        }

        // Verify exam exists in PG
        const examRes = await query('SELECT * FROM exams WHERE id = $1', [examId]);
        const exam = examRes.rows[0];
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check authorization - user must be the exam creator or admin
        const userId = req.user.id || req.user._id;
        if (exam.university_id?.toString() !== userId.toString() && 
            exam.created_by_id?.toString() !== userId.toString() &&
            req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ 
                message: 'Not authorized to add questions to this exam' 
            });
        }

        // Validate exam type supports online questions
        if (exam.exam_type === 'pdf-based') {
            return res.status(400).json({ 
                message: 'Cannot add online questions to PDF-based exam' 
            });
        }

        // Get existing questions from PG to check for order conflicts
        const existingQRes = await query('SELECT "order" FROM questions WHERE exam_id = $1', [examId]);
        const existingOrders = new Set(existingQRes.rows.map(q => q.order));

        // Validate each question
        const validationErrors = [];
        const orderSet = new Set();

        questions.forEach((q, index) => {
            const errors = [];

            if (!q.questionText || q.questionText.trim() === '') {
                errors.push('questionText is required');
            }
            if (!q.questionType || !['mcq', 'descriptive'].includes(q.questionType)) {
                errors.push('questionType must be either "mcq" or "descriptive"');
            }
            if (q.marks === undefined || q.marks === null || q.marks <= 0) {
                errors.push('marks must be a positive number');
            }
            if (q.order === undefined || q.order === null) {
                errors.push('order is required');
            }

            if (q.questionType === 'mcq') {
                if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                    errors.push('MCQ questions must have at least 2 options');
                } else {
                    const correctOptions = q.options.filter(opt => opt.isCorrect);
                    if (correctOptions.length !== 1) {
                        errors.push('MCQ questions must have exactly one correct option');
                    }
                }
            }

            if (orderSet.has(q.order)) {
                errors.push(`duplicate order ${q.order} within the batch`);
            }
            orderSet.add(q.order);

            if (existingOrders.has(q.order)) {
                errors.push(`order ${q.order} already exists in the exam`);
            }

            if (errors.length > 0) {
                validationErrors.push({ questionIndex: index, errors });
            }
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed for one or more questions',
                errors: validationErrors
            });
        }

        // Create questions in PG
        const createdQuestions = [];
        for (const q of questions) {
            const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const insertRes = await query(`
                INSERT INTO questions (
                    id, exam_id, question_type, question_text, question_image, 
                    options, marks, negative_marks, "order", difficulty, tags, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
                RETURNING *
            `, [
                newId, examId, q.questionType, q.questionText, q.questionImage || null,
                q.questionType === 'mcq' ? JSON.stringify(q.options) : null,
                q.marks, q.negativeMarks || 0, q.order, q.difficulty || 'medium',
                JSON.stringify(q.tags || [])
            ]);
            createdQuestions.push({ ...insertRes.rows[0], _id: insertRes.rows[0].id });
        }

        // Update exam's totalMarks in PG
        const markRes = await query('SELECT SUM(marks) as total FROM questions WHERE exam_id = $1', [examId]);
        const totalMarks = markRes.rows[0].total || 0;
        await query('UPDATE exams SET total_marks = $1 WHERE id = $2', [totalMarks, examId]);

        res.status(201).json({
            message: `Successfully created ${createdQuestions.length} question(s)`,
            questions: createdQuestions,
            totalMarks: totalMarks
        });

    } catch (error) {
        console.error('[PG Create Questions Error]:', error);
        res.status(500).json({ 
            message: 'Failed to create questions',
            error: error.message 
        });
    }
};

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:questionId
 * @access  Private (University/Admin)
 */
const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updates = req.body;

        // Find the question and its exam in PG
        const qRes = await query(`
            SELECT q.*, e.university_id, e.created_by_id 
            FROM questions q
            JOIN exams e ON q.exam_id = e.id
            WHERE q.id = $1
        `, [questionId]);
        
        const question = qRes.rows[0];
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check authorization
        const userId = req.user.id || req.user._id;
        if (question.university_id?.toString() !== userId.toString() && 
            question.created_by_id?.toString() !== userId.toString() &&
            req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ 
                message: 'Not authorized to update this question' 
            });
        }
        // Prepare fields for update
        const fieldMap = {
            questionText: 'question_text',
            questionType: 'question_type',
            questionImage: 'question_image',
            options: 'options',
            marks: 'marks',
            negativeMarks: 'negative_marks',
            order: 'order',
            difficulty: 'difficulty',
            tags: 'tags'
        };

        const updateFields = [];
        const values = [];
        let count = 1;

        Object.keys(updates).forEach(key => {
            if (fieldMap[key]) {
                updateFields.push(`${fieldMap[key]} = $${count}`);
                let val = updates[key];
                if (key === 'options' || key === 'tags') val = JSON.stringify(val);
                values.push(val);
                count++;
            }
        });

        if (updateFields.length > 0) {
            values.push(questionId);
            await query(`
                UPDATE questions SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = $${count}
            `, values);
        }

        // Update exam's totalMarks if marks changed
        if (updates.marks !== undefined) {
            const markRes = await query('SELECT SUM(marks) as total FROM questions WHERE exam_id = $1', [question.exam_id]);
            const totalMarks = markRes.rows[0].total || 0;
            await query('UPDATE exams SET total_marks = $1 WHERE id = $2', [totalMarks, question.exam_id]);
        }

        res.json({ message: 'Question updated successfully' });

    } catch (error) {
        console.error('[PG Update Question Error]:', error);
        res.status(500).json({ 
            message: 'Failed to update question',
            error: error.message 
        });
    }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:questionId
 * @access  Private (University/Admin)
 */
const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        // Find the question and its exam in PG
        const qRes = await query(`
            SELECT q.*, e.university_id, e.created_by_id 
            FROM questions q
            JOIN exams e ON q.exam_id = e.id
            WHERE q.id = $1
        `, [questionId]);
        
        const question = qRes.rows[0];
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check authorization
        const userId = req.user.id || req.user._id;
        if (question.university_id?.toString() !== userId.toString() && 
            question.created_by_id?.toString() !== userId.toString() &&
            req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ 
                message: 'Not authorized to delete this question' 
            });
        }

        // Check if question is referenced by any submissions in JSONB array
        const subRes = await query(`
            SELECT COUNT(*) FROM exam_submissions_new 
            WHERE exam_id = $1 AND answers @> $2::jsonb
        `, [question.exam_id, JSON.stringify([{ questionId }])]);

        if (parseInt(subRes.rows[0].count) > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete question that is referenced by existing submissions'
            });
        }

        // Delete the question
        await query('DELETE FROM questions WHERE id = $1', [questionId]);

        // Update exam's totalMarks
        const markRes = await query('SELECT SUM(marks) as total FROM questions WHERE exam_id = $1', [question.exam_id]);
        const totalMarks = markRes.rows[0].total || 0;
        await query('UPDATE exams SET total_marks = $1 WHERE id = $2', [totalMarks, question.exam_id]);

        res.json({
            message: 'Question deleted successfully',
            deletedQuestionId: questionId,
            newTotalMarks: totalMarks
        });

    } catch (error) {
        console.error('[PG Delete Question Error]:', error);
        res.status(500).json({ 
            message: 'Failed to delete question',
            error: error.message 
        });
    }
};

/**
 * @desc    Get all questions for an exam
 * @route   GET /api/exams/:examId/questions
 * @access  Private
 */
const getExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;

        const questionsRes = await query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY "order" ASC', [examId]);
        const questions = questionsRes.rows.map(q => ({ 
            ...q, 
            _id: q.id, 
            questionText: q.question_text,
            questionType: q.question_type,
            marks: parseFloat(q.marks) || 0,
            negativeMarks: parseFloat(q.negative_marks) || 0
        }));

        res.json({
            examId: examId,
            totalQuestions: questions.length,
            totalMarks: questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0),
            questions: questions
        });

    } catch (error) {
        console.error('[PG Get Exam Questions Error]:', error);
        res.status(500).json({ 
            message: 'Failed to fetch questions',
            error: error.message 
        });
    }
};

module.exports = {
    createOnlineQuestions,
    updateQuestion,
    deleteQuestion,
    getExamQuestions
};
