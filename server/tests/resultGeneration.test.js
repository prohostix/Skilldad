const { generateExamResults } = require('../services/resultService');
const { query } = require('../config/postgres');

jest.mock('../config/postgres');

describe('Result Generation and Ranking', () => {
    const mockExamId = 'exam_123';
    const mockStudent1 = 'student_1';
    const mockStudent2 = 'student_2';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateExamResults', () => {
        it('should generate results for graded submissions', async () => {
            // 1. Mock exam fetch
            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, passing_score: 40 }]
            });

            // 2. Mock submissions fetch (sorted by marks desc)
            query.mockResolvedValueOnce({
                rows: [
                    { id: 'sub_1', student_id: mockStudent1, total_marks: 100, obtained_marks: 90, percentage: 90 },
                    { id: 'sub_2', student_id: mockStudent2, total_marks: 100, obtained_marks: 80, percentage: 80 }
                ]
            });

            // 3. Mock upserts (once for each submission)
            query.mockResolvedValue({ rows: [] });

            const results = await generateExamResults(mockExamId);

            expect(results).toHaveLength(2);
            expect(results[0].rank).toBe(1);
            expect(results[1].rank).toBe(2);
            expect(results[0].grade).toBe('A+');
            expect(results[1].grade).toBe('A');
        });

        it('should handle ties correctly', async () => {
            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, passing_score: 40 }]
            });

            query.mockResolvedValueOnce({
                rows: [
                    { id: 'sub_1', student_id: 's1', total_marks: 100, obtained_marks: 90, percentage: 90 },
                    { id: 'sub_2', student_id: 's2', total_marks: 100, obtained_marks: 90, percentage: 90 },
                    { id: 'sub_3', student_id: 's3', total_marks: 100, obtained_marks: 80, percentage: 80 }
                ]
            });

            query.mockResolvedValue({ rows: [] });

            const results = await generateExamResults(mockExamId);

            expect(results[0].rank).toBe(1);
            expect(results[1].rank).toBe(1);
            expect(results[2].rank).toBe(3); // Rank jumps to 3 due to tie at 1
        });

        it('should return empty array when no graded submissions exist', async () => {
            query.mockResolvedValueOnce({
                rows: [{ id: mockExamId, passing_score: 40 }]
            });

            query.mockResolvedValueOnce({ rows: [] });

            const results = await generateExamResults(mockExamId);
            expect(results).toHaveLength(0);
        });

        it('should throw error when exam does not exist', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            await expect(generateExamResults('fake_id')).rejects.toThrow('Exam not found');
        });
    });
});
