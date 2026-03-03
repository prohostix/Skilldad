# Implementation Plan: Course Interactive Content

## Overview

This implementation adds interactive learning elements (exercises, practice problems, and quizzes) to the SkillDad course content management system. The feature integrates with the existing module-based structure, supports multiple question types with auto-grading for objective questions and manual grading for subjective responses, and extends progress tracking to capture completion status and scores.

## Tasks

- [x] 1. Set up data models and database schema
  - [x] 1.1 Create InteractiveContent model with validation
    - Define schema for exercises, practice problems, and quizzes
    - Implement validation rules for content types, time limits, and attempt limits
    - Add support for multiple question types (multiple-choice, true-false, short-answer, code-submission, essay)
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.2, 13.5, 13.6_
  
  - [ ]* 1.2 Write property test for InteractiveContent validation
    - **Property 1: Score Bounds** - All scores remain between 0 and 100
    - **Property 9: Answer Count Matches Question Count** - Submissions have correct answer count
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 13.2, 13.5, 13.6**
  
  - [x] 1.3 Create Submission model with grading fields
    - Define schema for student submissions with answers, scores, and status
    - Implement validation for attempt numbers, time tracking, and score ranges
    - Add support for grading metadata (gradedBy, gradedAt, feedback)
    - _Requirements: 5.1, 5.5, 5.6, 8.1, 8.2, 8.3, 8.4, 13.2, 13.5_
  
  - [ ]* 1.4 Write property test for Submission model
    - **Property 2: Points Earned Never Exceeds Maximum** - Total points validation
    - **Property 4: Time Limit Enforcement** - Time spent within limits
    - **Validates: Requirements 5.4, 8.4, 13.5**
  
  - [x] 1.5 Update Module model to include interactiveContent array
    - Add interactiveContent field to existing Module schema
    - Implement ordering and cascading delete logic
    - _Requirements: 20.1, 20.4_
  
  - [x] 1.6 Update Progress model for interactive content tracking
    - Extend Progress schema with completedExercises, completedPractices, completedQuizzes
    - Add ExerciseProgress and QuizProgress sub-schemas
    - Implement validation for progress tracking fields
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.8_

- [x] 2. Implement backend API for content management
  - [x] 2.1 Create InteractiveContentManager controller
    - Implement createContent endpoint with ownership validation
    - Implement updateContent endpoint with permission checks
    - Implement deleteContent endpoint with cascading logic
    - Implement getModuleContent endpoint for retrieving content
    - Implement reorderContent endpoint for sequence management
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 11.2, 11.3, 12.1, 12.2, 12.3_
  
  - [ ]* 2.2 Write unit tests for content management
    - Test content creation for all types (exercise, practice, quiz)
    - Test validation of required fields and question types
    - Test ownership verification and authorization
    - Test update and delete operations
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 12.2, 12.3_
  
  - [ ]* 2.3 Write property test for content management
    - **Property 11: Ownership Validation** - Only owners can modify content
    - **Validates: Requirements 1.3, 2.1, 12.2, 12.3, 12.7**

- [x] 3. Implement auto-grading engine
  - [x] 3.1 Create AutoGrader service
    - Implement gradeMultipleChoice with exact matching
    - Implement gradeTrueFalse with boolean comparison
    - Implement gradeShortAnswer with case-insensitive matching
    - Implement calculateScore for percentage calculation
    - Generate feedback messages based on correctness
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [ ]* 3.2 Write unit tests for auto-grading
    - Test multiple choice exact matching (case-sensitive)
    - Test true/false boolean comparison
    - Test short answer case-insensitive matching with whitespace handling
    - Test score calculation accuracy
    - Test feedback generation for correct and incorrect answers
    - Test edge cases: empty answers, special characters, multiple accepted answers
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ]* 3.3 Write property test for auto-grading
    - **Property 5: Objective Questions Auto-Graded** - All objective questions get immediate grades
    - **Validates: Requirements 6.1, 6.5, 6.6, 6.7**

- [x] 4. Implement submission handler
  - [x] 4.1 Create SubmissionHandler controller
    - Implement submitAnswer endpoint with validation
    - Validate enrollment status and attempt limits
    - Validate time limits for timed content
    - Route objective questions to auto-grader
    - Queue subjective questions for manual review
    - Track submission attempts and timestamps
    - Calculate time spent from start to submission
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 12.4, 12.5_
  
  - [x] 4.2 Implement getSubmission and getUserSubmissions endpoints
    - Create endpoint to retrieve individual submission details
    - Create endpoint to retrieve all submissions for a user in a course
    - Implement proper authorization checks
    - _Requirements: 12.4, 12.5_
  
  - [x] 4.3 Implement retrySubmission endpoint
    - Validate remaining attempts before allowing retry
    - Reset timer for timed content
    - Increment attempt number correctly
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 4.4 Write unit tests for submission handler
    - Test submission validation (answer count, enrollment, attempts)
    - Test time limit enforcement
    - Test attempt limit enforcement
    - Test routing to auto-grader vs manual queue
    - Test retry logic and attempt counting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 11.1, 11.2, 11.3_
  
  - [ ]* 4.5 Write property test for submission handler
    - **Property 3: Attempt Limit Enforcement** - Submissions respect attempt limits
    - **Property 10: Enrollment Requirement** - Only enrolled students can submit
    - **Validates: Requirements 5.3, 5.2, 12.5**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement manual grading queue
  - [x] 6.1 Create ManualGradingQueue controller
    - Implement getPendingSubmissions endpoint filtered by course
    - Implement gradeSubmission endpoint with validation
    - Validate points are within valid range [0, question.points]
    - Implement addFeedback endpoint for instructor comments
    - Implement getSubmissionStats for grading analytics
    - Update submission status when all questions graded
    - Recalculate total score after grading
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 8.6, 12.6_
  
  - [ ]* 6.2 Write unit tests for manual grading
    - Test pending submission retrieval and filtering
    - Test grade assignment with valid and invalid points
    - Test feedback storage and retrieval
    - Test status updates when grading completes
    - Test score recalculation after manual grading
    - Test authorization checks for grading
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 12.6_
  
  - [ ]* 6.3 Write property test for manual grading
    - **Property 6: Subjective Questions Require Manual Grading** - Subjective answers queued properly
    - **Property 12: Grading Completeness** - All answers graded before status changes
    - **Validates: Requirements 7.1, 7.5, 7.6**

- [x] 7. Implement progress tracking
  - [x] 7.1 Create ProgressTracker service
    - Implement recordCompletion to update progress after submissions
    - Implement getProgress to retrieve user progress for a course
    - Implement calculateModuleProgress for module-level completion
    - Implement calculateCourseProgress with weighted averages
    - Track best scores across multiple attempts
    - Update completion flags based on scores and passing criteria
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 7.2 Write unit tests for progress tracking
    - Test progress updates after submissions
    - Test best score tracking across attempts
    - Test module progress calculation
    - Test course progress calculation with weighted averages (40% videos, 20% exercises, 15% practices, 25% quizzes)
    - Test completion flag updates
    - Test edge cases: no content, all completed, partial completion
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 7.3 Write property test for progress tracking
    - **Property 8: Progress Monotonicity** - Progress never decreases
    - **Validates: Requirements 9.1, 9.8**

- [x] 8. Implement quiz passing logic
  - [x] 8.1 Add quiz passing score validation
    - Implement isPassing flag calculation based on passingScore
    - Update submission status when quiz is graded
    - Track passing status in progress records
    - _Requirements: 8.5, 1.6_
  
  - [ ]* 8.2 Write property test for quiz passing
    - **Property 7: Quiz Passing Status Consistency** - isPassing matches score vs passingScore
    - **Validates: Requirements 8.5**

- [x] 9. Implement solution display logic
  - [x] 9.1 Add solution visibility controls
    - Implement showSolutionAfter logic (immediate, submission, never)
    - Return solutions in API response based on visibility settings
    - Include explanations with solutions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 9.2 Write unit tests for solution display
    - Test immediate solution display
    - Test solution display after submission
    - Test solution hiding (never)
    - Test explanation inclusion
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 10. Implement authentication and authorization middleware
  - [x] 10.1 Add role-based access control
    - Verify JWT tokens on all protected routes
    - Check university role for content creation/modification
    - Check student role and enrollment for submissions
    - Check instructor ownership for grading operations
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ]* 10.2 Write unit tests for authorization
    - Test university content creation authorization
    - Test student submission authorization
    - Test instructor grading authorization
    - Test rejection of unauthorized access attempts
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [-] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement input validation and sanitization
  - [ ] 12.1 Add comprehensive input validation
    - Validate all required fields are present
    - Validate field types and formats match schema
    - Validate ObjectIds are properly formatted
    - Validate numeric values are within acceptable ranges
    - Validate array lengths meet requirements
    - Return 400 Bad Request with specific error messages on validation failure
    - _Requirements: 13.1, 13.2, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 12.2 Add XSS prevention and sanitization
    - Sanitize all user-generated content (questions, answers, feedback)
    - Implement content length limits to prevent DoS
    - _Requirements: 13.3, 13.7_
  
  - [ ]* 12.3 Write unit tests for validation
    - Test required field validation
    - Test type and format validation
    - Test range validation for numeric fields
    - Test array length validation
    - Test error message generation
    - _Requirements: 13.1, 13.2, 13.5, 13.6, 13.7_

- [ ] 13. Implement error handling
  - [ ] 13.1 Add error handlers for all scenarios
    - Handle attempt limit exceeded errors
    - Handle time limit exceeded errors
    - Handle unenrolled student access errors
    - Handle invalid answer format errors
    - Handle unauthorized content modification errors
    - Handle grading non-existent submission errors
    - Handle invalid points assignment errors
    - Handle database connection failures
    - Return appropriate HTTP status codes and error messages
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [ ]* 13.2 Write unit tests for error handling
    - Test all error scenarios from requirements
    - Test error message clarity and specificity
    - Test proper HTTP status codes
    - Test no data changes on errors
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 14. Implement notification system
  - [ ] 14.1 Add grade notification functionality
    - Send email notification when manual grading completes
    - Include submission details and grade in notification
    - Use existing sendEmail utility
    - Log notification failures without blocking grading
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [ ]* 14.2 Write unit tests for notifications
    - Test notification sending on grading completion
    - Test notification content includes correct information
    - Test graceful handling of notification failures
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 15. Implement analytics and reporting
  - [ ] 15.1 Create analytics endpoints
    - Implement endpoint for submission statistics by course
    - Calculate average scores per question
    - Calculate completion rates for each content item
    - Provide grading queue statistics
    - Filter analytics by course and time period
    - Enforce authorization (instructor's courses only)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [ ]* 15.2 Write unit tests for analytics
    - Test statistics calculation accuracy
    - Test filtering by course and time period
    - Test authorization enforcement
    - _Requirements: 19.1, 19.2, 19.3, 19.5, 19.6_

- [ ] 16. Implement frontend content builder for universities
  - [ ] 16.1 Create InteractiveContentBuilder component
    - Build form interface for creating exercises, practices, and quizzes
    - Add question management (add, remove, reorder)
    - Implement rich text editing for question text
    - Add input controls for each question type
    - Implement client-side validation before submission
    - Add preview functionality
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 16.2 Create question type specific forms
    - Build multiple choice question form with options management
    - Build true/false question form
    - Build short answer question form with accepted answers
    - Build code submission question form with language selector
    - Build essay question form with word limit and rubric
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 16.3 Add content management UI
    - Create interface for viewing existing content in modules
    - Add edit and delete functionality with confirmation
    - Implement drag-and-drop reordering
    - _Requirements: 2.2, 2.3, 20.3_

- [ ] 17. Implement frontend content player for students
  - [ ] 17.1 Create InteractiveContentPlayer component
    - Display content title, description, and instructions
    - Show time limit and remaining attempts
    - Render questions with appropriate input controls
    - Implement timer for timed content
    - Track start time for time spent calculation
    - _Requirements: 4.2, 4.3, 5.5, 11.4_
  
  - [ ] 17.2 Implement question rendering
    - Render multiple choice with radio buttons or checkboxes
    - Render true/false with radio buttons
    - Render short answer with text input
    - Render code submission with code editor
    - Render essay with textarea
    - _Requirements: 4.5_
  
  - [ ] 17.3 Add submission and feedback UI
    - Implement submit button with validation
    - Display immediate feedback for auto-graded questions
    - Show pending status for subjective questions
    - Display solutions based on showSolutionAfter setting
    - Show score and passing status for quizzes
    - _Requirements: 5.7, 6.1, 6.8, 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 17.4 Add retry functionality
    - Display retry button when attempts remain
    - Show attempt count and remaining attempts
    - Reset form and timer on retry
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

- [ ] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement frontend grading interface for instructors
  - [ ] 19.1 Create ManualGradingQueue component
    - Display list of pending submissions filtered by course
    - Show submission details (student, content, answers)
    - Implement grading form with points input and feedback textarea
    - Validate points are within valid range
    - Submit grades and update UI
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 19.2 Add grading statistics dashboard
    - Display pending submission count
    - Show average grading turnaround time
    - Display completion rates
    - _Requirements: 7.4, 19.4_

- [ ] 20. Implement frontend progress dashboard
  - [ ] 20.1 Create ProgressDashboard component
    - Display overall course progress percentage
    - Show breakdown by content type (videos, exercises, practices, quizzes)
    - Display completed vs total items
    - Show best scores for exercises and quizzes
    - Highlight passing/failing status for quizzes
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [ ] 20.2 Add submission history view
    - Display list of all submissions for a course
    - Show scores, attempt numbers, and timestamps
    - Allow viewing detailed submission results
    - _Requirements: 9.2, 9.3, 9.4_

- [ ] 21. Implement frontend analytics dashboard for instructors
  - [ ] 21.1 Create AnalyticsDashboard component
    - Display submission statistics for course
    - Show average scores per question
    - Display completion rates for each content item
    - Show grading queue statistics
    - Add date range filter
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 22. Integrate interactive content with module display
  - [ ] 22.1 Update module view to show interactive content
    - Display videos and interactive content in order
    - Add icons to distinguish content types
    - Show completion status for each item
    - Enable navigation to content player
    - _Requirements: 4.1, 20.1, 20.2_
  
  - [ ] 22.2 Update course structure display
    - Show interactive content count in module summaries
    - Display progress indicators for interactive content
    - _Requirements: 20.1, 20.2_

- [ ] 23. Add API routes and wire everything together
  - [ ] 23.1 Create API routes for interactive content
    - POST /api/courses/:courseId/modules/:moduleId/content - Create content
    - PUT /api/courses/:courseId/modules/:moduleId/content/:contentId - Update content
    - DELETE /api/courses/:courseId/modules/:moduleId/content/:contentId - Delete content
    - GET /api/courses/:courseId/modules/:moduleId/content - Get module content
    - PUT /api/courses/:courseId/modules/:moduleId/content/reorder - Reorder content
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 4.1_
  
  - [ ] 23.2 Create API routes for submissions
    - POST /api/submissions - Submit answers
    - GET /api/submissions/:submissionId - Get submission details
    - GET /api/submissions/user/:userId/course/:courseId - Get user submissions
    - POST /api/submissions/:submissionId/retry - Retry submission
    - _Requirements: 5.1, 5.7_
  
  - [ ] 23.3 Create API routes for manual grading
    - GET /api/grading/pending/:courseId - Get pending submissions
    - POST /api/grading/:submissionId/grade - Grade submission
    - POST /api/grading/:submissionId/feedback - Add feedback
    - GET /api/grading/stats/:courseId - Get grading statistics
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 23.4 Create API routes for progress and analytics
    - GET /api/progress/:userId/:courseId - Get user progress
    - GET /api/analytics/:courseId - Get course analytics
    - _Requirements: 9.5, 19.1_
  
  - [ ] 23.5 Wire frontend components to API
    - Connect content builder to content management API
    - Connect content player to submission API
    - Connect grading interface to grading API
    - Connect progress dashboard to progress API
    - Connect analytics dashboard to analytics API
    - Add error handling and loading states
    - _Requirements: All frontend requirements_

- [ ] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses JavaScript/Node.js for backend and React for frontend
- Code execution security (sandboxing) is deferred to a future phase due to complexity
- Focus on core functionality first: content creation, submission, auto-grading, manual grading, and progress tracking
