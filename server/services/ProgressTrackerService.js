const { query } = require('../config/postgres');

/**
 * ProgressTracker Service
 * 
 * Manages student progress tracking for interactive content
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8
 */
class ProgressTrackerService {
    /**
     * Record completion after a submission is graded
     * Requirements: 9.1, 9.2, 9.3, 9.4
     * 
     * @param {Object} submission - The graded submission object
     * @returns {Promise<Object>} Updated progress record
     */
    async recordCompletion(submission) {
        try {
            const progressRes = await query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [submission.user, submission.course]);
            let progress = progressRes.rows[0];

            if (!progress) {
                const newId = `prog_${Date.now()}`;
                const res = await query(`
                    INSERT INTO progress (id, user_id, course_id, completed_videos, completed_exercises, completed_practices, completed_quizzes, project_submissions, is_completed, created_at, updated_at)
                    VALUES ($1, $2, $3, '[]', '[]', '[]', '[]', '[]', false, NOW(), NOW()) RETURNING *
                `, [newId, submission.user, submission.course]);
                progress = res.rows[0];
            }

            const contentId = submission.content._id || submission.content;

            // Update progress based on content type
            if (submission.contentType === 'exercise') {
                await this._updateExerciseProgress(progress, contentId, submission);
            } else if (submission.contentType === 'practice') {
                await this._updatePracticeProgress(progress, contentId);
            } else if (submission.contentType === 'quiz') {
                await this._updateQuizProgress(progress, contentId, submission);
            }

            await query(`
                UPDATE progress SET 
                completed_exercises = $1, 
                completed_practices = $2, 
                completed_quizzes = $3, 
                updated_at = NOW() 
                WHERE id = $4
            `, [
                JSON.stringify(progress.completed_exercises), 
                JSON.stringify(progress.completed_practices), 
                JSON.stringify(progress.completed_quizzes), 
                progress.id
            ]);

            return progress;
        } catch (error) {
            console.error('Error recording completion:', error);
            throw error;
        }
    }

    /**
     * Update exercise progress (internal helper)
     * Requirement 9.2: Track best scores and completion status
     */
    async _updateExerciseProgress(progress, contentId, submission) {
        progress.completed_exercises = progress.completed_exercises || [];
        const existingIndex = progress.completed_exercises.findIndex(
            ex => ex.content === contentId.toString()
        );

        if (existingIndex >= 0) {
            const existing = progress.completed_exercises[existingIndex];
            existing.attempts += 1;
            existing.bestScore = Math.max(existing.bestScore, submission.score);
            existing.lastAttemptAt = submission.submittedAt;
            existing.isCompleted = existing.bestScore >= 70;
        } else {
            progress.completed_exercises.push({
                content: contentId.toString(),
                attempts: submission.attemptNumber,
                bestScore: submission.score,
                lastAttemptAt: submission.submittedAt,
                isCompleted: submission.score >= 70
            });
        }
    }

    async _updatePracticeProgress(progress, contentId) {
        progress.completed_practices = progress.completed_practices || [];
        if (!progress.completed_practices.some(id => id === contentId.toString())) {
            progress.completed_practices.push(contentId.toString());
        }
    }

    async _updateQuizProgress(progress, contentId, submission) {
        progress.completed_quizzes = progress.completed_quizzes || [];
        const existingIndex = progress.completed_quizzes.findIndex(
            qz => qz.content === contentId.toString()
        );

        if (existingIndex >= 0) {
            const existing = progress.completed_quizzes[existingIndex];
            existing.attempts += 1;
            existing.bestScore = Math.max(existing.bestScore, submission.score);
            existing.isPassing = existing.isPassing || submission.isPassing;
            existing.lastAttemptAt = submission.submittedAt;
        } else {
            progress.completed_quizzes.push({
                content: contentId.toString(),
                attempts: submission.attemptNumber,
                bestScore: submission.score,
                isPassing: submission.isPassing,
                lastAttemptAt: submission.submittedAt
            });
        }
    }

    /**
     * Get user progress for a course
     * Requirements: 9.1, 9.5, 9.6, 9.7
     * 
     * @param {String} userId - User ID
     * @param {String} courseId - Course ID
     * @returns {Promise<Object>} Progress summary with all details
     */
    async getProgress(userId, courseId) {
        try {
            const progressRes = await query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            const progress = progressRes.rows[0];

            if (!progress) {
                // Return empty progress if not found
                return {
                    user: userId,
                    course: courseId,
                    completedVideos: [],
                    completedExercises: [],
                    completedPractices: [],
                    completedQuizzes: [],
                    moduleProgress: [],
                    courseProgress: 0,
                    isCompleted: false
                };
            }

            // Calculate module and course progress
            const moduleProgress = await this.calculateModuleProgress(userId, courseId);
            const courseProgress = await this.calculateCourseProgress(userId, courseId);

            return {
                user: progress.user_id,
                course: progress.course_id,
                completedVideos: progress.completed_videos || [],
                completedExercises: progress.completed_exercises || [],
                completedPractices: progress.completed_practices || [],
                completedQuizzes: progress.completed_quizzes || [],
                projectSubmissions: progress.project_submissions || [],
                moduleProgress,
                courseProgress,
                isCompleted: progress.is_completed,
                createdAt: progress.created_at,
                updatedAt: progress.updated_at
            };
        } catch (error) {
            console.error('Error getting progress:', error);
            throw error;
        }
    }

    /**
     * Calculate module-level progress
     * Requirement 9.5: Calculate completion percentage for a module
     * 
     * @param {String} userId - User ID
     * @param {String} courseId - Course ID
     * @returns {Promise<Array>} Array of module progress objects
     */
    async calculateModuleProgress(userId, courseId) {
        try {
            const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [courseId]);
            const courseRow = courseRes.rows[0];
            if (!courseRow) throw new Error('Course not found');
            
            const modules = typeof courseRow.modules === 'string' ? JSON.parse(courseRow.modules) : (courseRow.modules || []);

            const progressRes = await query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            const progress = progressRes.rows[0];

            if (!progress) {
                return modules.map(module => ({
                    moduleId: module._id || module.id,
                    moduleTitle: module.title,
                    completionPercentage: 0,
                    completedItems: 0,
                    totalItems: (module.videos?.length || 0) + (module.interactiveContent?.length || 0)
                }));
            }

            const moduleProgressArray = modules.map(module => {
                let completedItems = 0;
                let totalItems = 0;

                totalItems += (module.videos?.length || 0);
                if (module.videos) {
                    const completedVideosInModule = module.videos.filter(video =>
                        (progress.completed_videos || []).some(id => id.toString() === (video._id || video.id).toString())
                    ).length;
                    completedItems += completedVideosInModule;
                }

                if (module.interactiveContent && module.interactiveContent.length > 0) {
                    module.interactiveContent.forEach(content => {
                        totalItems += 1;
                        const contentId = (content._id || content.id || content).toString();

                        if (content.type === 'exercise') {
                            const exerciseProgress = (progress.completed_exercises || []).find(ex => ex.content === contentId);
                            if (exerciseProgress && exerciseProgress.isCompleted) completedItems += 1;
                        } else if (content.type === 'practice') {
                            if ((progress.completed_practices || []).some(id => id === contentId)) completedItems += 1;
                        } else if (content.type === 'quiz') {
                            const quizProgress = (progress.completed_quizzes || []).find(qz => qz.content === contentId);
                            if (quizProgress && quizProgress.isPassing) completedItems += 1;
                        }
                    });
                }

                const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return {
                    moduleId: module._id || module.id,
                    moduleTitle: module.title,
                    completionPercentage: Math.round(completionPercentage * 100) / 100,
                    completedItems,
                    totalItems
                };
            });

            return moduleProgressArray;
        } catch (error) {
            console.error('Error calculating module progress:', error);
            throw error;
        }
    }

    /**
     * Calculate overall course progress with weighted averages
     * Requirements: 9.6, 9.7, 9.8
     * 
     * Weights: Videos 40%, Exercises 20%, Practices 15%, Quizzes 25%
     * 
     * @param {String} userId - User ID
     * @param {String} courseId - Course ID
     * @returns {Promise<Number>} Overall course progress percentage (0-100)
     */
    async calculateCourseProgress(userId, courseId) {
        try {
            const courseRes = await query('SELECT modules FROM courses WHERE id = $1', [courseId]);
            const courseRow = courseRes.rows[0];
            if (!courseRow) throw new Error('Course not found');
            
            const modules = typeof courseRow.modules === 'string' ? JSON.parse(courseRow.modules) : (courseRow.modules || []);

            const progressRes = await query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            const progress = progressRes.rows[0];

            if (!progress) return 0;

            let totalVideos = 0;
            let totalExercises = 0;
            let totalPractices = 0;
            let totalQuizzes = 0;

            modules.forEach(module => {
                totalVideos += (module.videos?.length || 0);

                if (module.interactiveContent && module.interactiveContent.length > 0) {
                    module.interactiveContent.forEach(content => {
                        if (content.type === 'exercise') totalExercises += 1;
                        else if (content.type === 'practice') totalPractices += 1;
                        else if (content.type === 'quiz') totalQuizzes += 1;
                    });
                }
            });

            const videoProgress = totalVideos > 0 ? ((progress.completed_videos || []).length / totalVideos) * 100 : 0;
            const completedExercisesCount = (progress.completed_exercises || []).filter(ex => ex.isCompleted).length;
            const exerciseProgress = totalExercises > 0 ? (completedExercisesCount / totalExercises) * 100 : 0;
            const practiceProgress = totalPractices > 0 ? ((progress.completed_practices || []).length / totalPractices) * 100 : 0;
            const passedQuizzesCount = (progress.completed_quizzes || []).filter(qz => qz.isPassing).length;
            const quizProgress = totalQuizzes > 0 ? (passedQuizzesCount / totalQuizzes) * 100 : 0;

            const overallProgress = (videoProgress * 0.4) + (exerciseProgress * 0.2) + (practiceProgress * 0.15) + (quizProgress * 0.25);
            return Math.round(Math.max(0, Math.min(100, overallProgress)) * 100) / 100;
        } catch (error) {
            console.error('Error calculating course progress:', error);
            throw error;
        }
    }
}

module.exports = new ProgressTrackerService();
