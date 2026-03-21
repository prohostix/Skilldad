const ProgressTrackerService = require('../services/ProgressTrackerService');
const { query } = require('../config/postgres');

// Mock the postgres config
jest.mock('../config/postgres');

// Mock data
const mockUserId = 'user_123';
const mockCourseId = 'course_456';
const mockContentId = 'content_789';
const mockModuleId = 'module_000';

describe('ProgressTrackerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('recordCompletion', () => {
        it('should create new progress record for exercise submission', async () => {
            const mockSubmission = {
                user: mockUserId,
                course: mockCourseId,
                content: { _id: mockContentId },
                contentType: 'exercise',
                score: 85,
                attemptNumber: 1,
                submittedAt: new Date()
            };

            // Simulate "progress not found"
            query.mockResolvedValueOnce({ rows: [] });
            
            // Simulate "insert progress"
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 'prog_1', 
                    user_id: mockUserId, 
                    course_id: mockCourseId,
                    completed_exercises: [],
                    completed_practices: [],
                    completed_quizzes: []
                }] 
            });

            // Simulate "update progress"
            query.mockResolvedValueOnce({ rows: [] });

            const progress = await ProgressTrackerService.recordCompletion(mockSubmission);

            expect(progress).toBeDefined();
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM progress WHERE user_id = $1'),
                [mockUserId, mockCourseId]
            );
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO progress'),
                expect.any(Array)
            );
            expect(progress.completed_exercises).toHaveLength(1);
            expect(progress.completed_exercises[0].bestScore).toBe(85);
            expect(progress.completed_exercises[0].isCompleted).toBe(true);
        });

        it('should update existing exercise progress with better score', async () => {
            const mockSubmission = {
                user: mockUserId,
                course: mockCourseId,
                content: { _id: mockContentId },
                contentType: 'exercise',
                score: 90,
                attemptNumber: 2,
                submittedAt: new Date()
            };

            // Simulate "progress found"
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 'prog_1', 
                    user_id: mockUserId, 
                    course_id: mockCourseId,
                    completed_exercises: [{
                        content: mockContentId,
                        attempts: 1,
                        bestScore: 60,
                        isCompleted: false
                    }],
                    completed_practices: [],
                    completed_quizzes: []
                }] 
            });

            // Simulate "update progress"
            query.mockResolvedValueOnce({ rows: [] });

            const progress = await ProgressTrackerService.recordCompletion(mockSubmission);

            expect(progress.completed_exercises[0].bestScore).toBe(90);
            expect(progress.completed_exercises[0].attempts).toBe(2);
            expect(progress.completed_exercises[0].isCompleted).toBe(true);
        });

        it('should record practice completion', async () => {
            const mockSubmission = {
                user: mockUserId,
                course: mockCourseId,
                content: mockContentId,
                contentType: 'practice'
            };

            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 'prog_1', 
                    completed_practices: []
                }] 
            });
            query.mockResolvedValueOnce({ rows: [] });

            const progress = await ProgressTrackerService.recordCompletion(mockSubmission);

            expect(progress.completed_practices).toContain(mockContentId);
        });

        it('should record quiz progress with passing status', async () => {
            const mockSubmission = {
                user: mockUserId,
                course: mockCourseId,
                content: mockContentId,
                contentType: 'quiz',
                score: 80,
                isPassing: true,
                attemptNumber: 1,
                submittedAt: new Date()
            };

            query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 'prog_1', 
                    completed_quizzes: []
                }] 
            });
            query.mockResolvedValueOnce({ rows: [] });

            const progress = await ProgressTrackerService.recordCompletion(mockSubmission);

            expect(progress.completed_quizzes).toHaveLength(1);
            expect(progress.completed_quizzes[0].isPassing).toBe(true);
        });
    });

    describe('calculateCourseProgress', () => {
        it('should return 0 for course with no progress', async () => {
            query.mockResolvedValueOnce({ 
                rows: [{ modules: [] }] 
            });
            query.mockResolvedValueOnce({ rows: [] });

            const courseProgress = await ProgressTrackerService.calculateCourseProgress(mockUserId, mockCourseId);

            expect(courseProgress).toBe(0);
        });

        it('should calculate weighted progress correctly', async () => {
            // Mock course modules
            const mockModules = [{
                _id: mockModuleId,
                videos: [{ _id: 'vid_1' }],
                interactiveContent: [{
                    _id: mockContentId,
                    type: 'exercise'
                }]
            }];

            query.mockResolvedValueOnce({ 
                rows: [{ modules: JSON.stringify(mockModules) }] 
            });

            // Mock progress
            query.mockResolvedValueOnce({ 
                rows: [{ 
                    completed_videos: ['vid_1'],
                    completed_exercises: [{
                        content: mockContentId,
                        isCompleted: true
                    }],
                    completed_practices: [],
                    completed_quizzes: []
                }] 
            });

            const courseProgress = await ProgressTrackerService.calculateCourseProgress(mockUserId, mockCourseId);

            // 1/1 video * 0.4 = 40
            // 1/1 exercise * 0.2 = 20
            // Total = 60
            expect(courseProgress).toBe(60);
        });
    });

    describe('getProgress', () => {
        it('should return default progress for user with no records', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            const progress = await ProgressTrackerService.getProgress(mockUserId, mockCourseId);

            expect(progress.courseProgress).toBe(0);
            expect(progress.completedVideos).toEqual([]);
        });
    });
});
