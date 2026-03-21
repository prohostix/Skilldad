const { autoGradeMCQSubmission } = require('../services/autoGradingService');
const { query } = require('../config/postgres');

jest.mock('../config/postgres');

describe('Auto-Grading Service', () => {
    const mockSubmissionId = 'sub_123';
    const mockExamId = 'exam_456';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('autoGradeMCQSubmission', () => {
        it('should grade MCQ questions correctly with positive marks', async () => {
            // 1. Mock submission fetch
            query.mockResolvedValueOnce({
                rows: [{
                    id: mockSubmissionId,
                    exam_id: mockExamId,
                    answers: [
                        { question: 'q1', selectedOption: 1 }, // Correct
                        { question: 'q2', selectedOption: 1 }  // Correct
                    ]
                }]
            });

            // 2. Mock exam fetch
            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, total_points: 10 }]
            });

            // 3. Mock questions fetch
            query.mockResolvedValueOnce({
                rows: [
                    { id: 'q1', question_type: 'mcq', marks: 5, negative_marks: 1, options: [{ isCorrect: false }, { isCorrect: true }] },
                    { id: 'q2', question_type: 'mcq', marks: 5, negative_marks: 1, options: [{ isCorrect: false }, { isCorrect: true }] }
                ]
            });

            // 4. Mock update
            query.mockResolvedValueOnce({ rows: [] });

            const result = await autoGradeMCQSubmission(mockSubmissionId);

            expect(result.correctCount).toBe(2);
            expect(result.obtainedMarks).toBe(10);
            expect(result.percentage).toBe(100);
        });

        it('should apply negative marking for incorrect answers', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                    id: mockSubmissionId,
                    exam_id: mockExamId,
                    answers: [{ question: 'q1', selectedOption: 0 }] // Incorrect
                }]
            });

            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, total_points: 10 }]
            });

            query.mockResolvedValueOnce({
                rows: [{ id: 'q1', question_type: 'mcq', marks: 5, negative_marks: 2, options: [{ isCorrect: false }, { isCorrect: true }] }]
            });

            query.mockResolvedValueOnce({ rows: [] });

            const result = await autoGradeMCQSubmission(mockSubmissionId);

            expect(result.correctCount).toBe(0);
            expect(result.obtainedMarks).toBe(0); // 0 - 2 = -2, but clamped to 0
        });

        it('should ensure obtainedMarks is never negative', async () => {
            query.mockResolvedValueOnce({
                rows: [{
                    id: mockSubmissionId,
                    exam_id: mockExamId,
                    answers: [{ question: 'q1', selectedOption: 0 }] // Incorrect
                }]
            });

            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, total_points: 5 }]
            });

            query.mockResolvedValueOnce({
                rows: [{ id: 'q1', question_type: 'mcq', marks: 5, negative_marks: 10, options: [{ isCorrect: false }, { isCorrect: true }] }]
            });

            query.mockResolvedValueOnce({ rows: [] });

            const result = await autoGradeMCQSubmission(mockSubmissionId);

            expect(result.obtainedMarks).toBe(0);
        });

        it('should throw error when submission does not exist', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            await expect(autoGradeMCQSubmission('fake_sub')).rejects.toThrow('Submission not found');
        });
    });
});
