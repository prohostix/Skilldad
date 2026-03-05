# Implementation Plan: Exam Management System

## Overview

This implementation plan breaks down the Exam Management System into discrete coding tasks for a MERN stack application. The system supports multiple exam formats (PDF-based, online MCQ, descriptive, mixed), real-time features via WebSocket, role-based access control, auto-grading, and comprehensive result management. Tasks are organized to build incrementally, with early validation through code and testing checkpoints.

## Tasks

- [x] 1. Set up database models and schemas
  - [x] 1.1 Create Exam model with validation
    - Define Mongoose schema with all fields (title, course, university, examType, scheduling, status, etc.)
    - Add validation for time windows (scheduledEndTime > scheduledStartTime)
    - Add validation for duration fits within time window
    - Add indexes for performance (course + scheduledStartTime, university + status, status + scheduledEndTime)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 14.1, 14.2_

  - [ ]* 1.2 Write property test for Exam model time validation
    - **Property 1: Exam Access Control (partial) - Time window validation**
    - **Validates: Requirements 1.2, 4.1, 4.2**

  - [x] 1.3 Create Question model with MCQ and descriptive support
    - Define Mongoose schema with questionType, questionText, options array, marks, negativeMarks, order
    - Add validation: MCQ must have at least 2 options, exactly one correct option
    - Add validation: marks must be positive, negativeMarks non-negative and less than marks
    - Add compound index on (exam, order) for efficient retrieval
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 1.4 Write unit tests for Question model validation
    - Test MCQ validation rules (minimum options, single correct answer)
    - Test marks validation (positive marks, valid negative marks)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.5 Create Submission model with unique constraint
    - Define Mongoose schema with exam, student, timing fields, answers array, status
    - Add unique compound index on (exam, student) to prevent duplicate submissions
    - Add validation for answer structure (MCQ vs descriptive)
    - Add indexes for queries (exam + status, student + createdAt)
    - _Requirements: 6.1, 6.7, 6.8, 16.1, 16.2, 16.3_


  - [ ]* 1.6 Write property test for Submission uniqueness
    - **Property 2: Submission Uniqueness**
    - **Validates: Requirements 16.1, 16.2, 16.3**

  - [x] 1.7 Create Result model with ranking support
    - Define Mongoose schema with exam, student, submission, scores, grade, rank, publication status
    - Add unique compound index on (exam, student)
    - Add indexes for queries (exam + rank, student + isPublished)
    - Add validation for percentage calculation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 1.8 Write unit tests for Result model
    - Test grade calculation based on percentage ranges
    - Test pass/fail determination
    - _Requirements: 10.5, 10.6_

- [x] 2. Implement file upload service
  - [x] 2.1 Set up file storage configuration
    - Configure storage service (AWS S3 or local filesystem)
    - Set up multer middleware for file uploads
    - Create utility functions for file path generation
    - _Requirements: 2.3, 2.4, 17.4, 17.5_

  - [x] 2.2 Implement question paper upload with validation
    - Create uploadQuestionPaper function with PDF validation
    - Validate file type is PDF and size < 10MB
    - Generate secure randomized filename
    - Store file and return URL
    - Handle old file deletion on replacement
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 17.1, 17.2, 17.4_


  - [x] 2.3 Implement answer sheet upload with validation
    - Create uploadAnswerSheet function with PDF/image validation
    - Validate file type (PDF or image formats) and size < 20MB
    - Organize files by exam and student directories
    - Generate secure randomized filename
    - Store file and return URL
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 17.1, 17.2, 17.4, 17.5_

  - [x] 2.4 Implement secure file access with signed URLs
    - Create generateSecureUrl function for time-limited access
    - Use JWT or cloud provider's signed URL mechanism
    - Set appropriate expiration times (1 hour for question papers, 24 hours for answer sheets)
    - _Requirements: 2.6, 2.7, 17.6_

  - [x]* 2.5 Write unit tests for file upload validation
    - Test file type validation (valid and invalid types)
    - Test file size validation (within and exceeding limits)
    - Test error handling for upload failures
    - _Requirements: 2.1, 2.2, 6.4, 6.5, 17.1, 17.2_

- [x] 3. Implement exam access control logic
  - [x] 3.1 Create checkExamAccess function
    - Implement time window validation (before start, during, after end)
    - Check student enrollment in course
    - Check for existing submissions (prevent duplicates)
    - Handle late submission logic
    - Calculate time remaining
    - Return access decision with reason and time info
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 16.1, 16.2_


  - [ ]* 3.2 Write property test for exam access control
    - **Property 1: Exam Access Control (complete)**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

  - [x] 3.3 Create exam status management functions
    - Implement status transition validation (scheduled → ongoing → completed → graded → published)
    - Create updateExamStatus function with state machine validation
    - Record timestamps for status changes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

  - [ ]* 3.4 Write property test for status transitions
    - **Property 8: Status Transition Validity**
    - **Validates: Requirements 14.6_

- [x] 4. Implement exam scheduling and management (Admin)
  - [x] 4.1 Create scheduleExam controller function
    - Implement POST /api/exams endpoint
    - Validate all required fields (title, course, university, times, duration, type, marks)
    - Validate time window and duration constraints
    - Create exam record with status 'scheduled'
    - Trigger notification to enrolled students
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 15.1, 15.2_

  - [x] 4.2 Create updateExam controller function
    - Implement PUT /api/exams/:examId endpoint
    - Validate all constraints before updating
    - Handle partial updates
    - Return updated exam object
    - _Requirements: 1.8_


  - [x] 4.3 Create deleteExam controller function
    - Implement DELETE /api/exams/:examId endpoint
    - Delete associated questions, submissions, and results
    - Delete associated files (question papers, answer sheets)
    - Return success message
    - _Requirements: 1.9, 17.8_

  - [x] 4.4 Create getAllExams controller function
    - Implement GET /api/exams endpoint with filtering
    - Support query parameters (status, university, course, isMockExam)
    - Implement pagination (page, limit)
    - Return exams array with metadata
    - _Requirements: 18.1_

  - [ ]* 4.5 Write integration tests for exam CRUD operations
    - Test exam creation with valid and invalid data
    - Test exam update and deletion
    - Test filtering and pagination
    - _Requirements: 1.1, 1.2, 1.3, 1.8, 1.9_

- [x] 5. Implement question management (University)
  - [x] 5.1 Create uploadQuestionPaper controller function
    - Implement POST /api/exams/:examId/question-paper endpoint
    - Use multer middleware for file upload
    - Call file upload service for validation and storage
    - Update exam record with questionPaperUrl
    - Delete old question paper if exists
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.2 Create createOnlineQuestions controller function
    - Implement POST /api/exams/:examId/questions endpoint
    - Validate question data (type, options, marks, order)
    - Support bulk creation of questions array
    - Ensure order uniqueness within exam
    - Return created questions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_


  - [x] 5.3 Create updateQuestion controller function
    - Implement PUT /api/questions/:questionId endpoint
    - Validate all constraints before updating
    - Return updated question
    - _Requirements: 3.7_

  - [x] 5.4 Create deleteQuestion controller function
    - Implement DELETE /api/questions/:questionId endpoint
    - Check if question is referenced by submissions
    - Prevent deletion if submissions exist
    - Return success or error message
    - _Requirements: 3.8_

  - [ ]* 5.5 Write unit tests for question validation
    - Test MCQ validation (options, correct answer)
    - Test marks validation
    - Test order uniqueness
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement student exam access and starting
  - [x] 7.1 Create getStudentExams controller function
    - Implement GET /api/exams/student/my-exams endpoint
    - Fetch exams for courses student is enrolled in
    - Include exam status and timing information
    - Return exams array
    - _Requirements: 4.4_

  - [x] 7.2 Create checkExamAccess controller function
    - Implement GET /api/exams/:examId/access endpoint
    - Call checkExamAccess logic function
    - Return access decision with time remaining
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_


  - [x] 7.3 Create startExam controller function
    - Implement POST /api/exams/:examId/start endpoint
    - Verify exam access using checkExamAccess
    - Check for existing in-progress submission (resume if exists)
    - Create new submission with startedAt timestamp and status 'in-progress'
    - For online exams: fetch and return questions (shuffle if configured)
    - For PDF exams: return questionPaperUrl with secure download link
    - Return submission and exam details
    - _Requirements: 5.1, 16.5_

  - [ ]* 7.4 Write integration tests for exam access
    - Test access before start time (denied)
    - Test access during valid window (granted)
    - Test access after end time (denied)
    - Test access with existing submission (denied)
    - Test access without enrollment (denied)
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 8. Implement WebSocket service for real-time timer
  - [x] 8.1 Set up Socket.IO server integration
    - Initialize Socket.IO with Express server
    - Configure CORS for WebSocket connections
    - Set up authentication middleware for socket connections
    - Create exam room management (join/leave)
    - _Requirements: 5.2, 5.3_

  - [x] 8.2 Implement exam timer broadcast logic
    - Create startExamTimer function that broadcasts every minute
    - Calculate and emit time remaining to exam room
    - Send warning notifications at 5 minutes and 1 minute
    - Store active timer intervals for cleanup
    - _Requirements: 5.3, 5.4, 5.5, 18.5, 18.6_


  - [x] 8.3 Implement auto-submission on timeout
    - Create handleExamTimeout function
    - Find all in-progress submissions for expired exam
    - Auto-submit each submission (set submittedAt, timeSpent, isAutoSubmitted)
    - Emit auto-submit event to each affected student
    - Update exam status to 'completed'
    - Clean up timer interval
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 19.7_

  - [ ]* 8.4 Write property test for time-based auto-submission
    - **Property 6: Time-Based Auto-Submission**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

  - [x] 8.5 Implement WebSocket reconnection handling
    - Handle socket disconnect events
    - Implement automatic reconnection with exponential backoff
    - Restore exam room membership on reconnection
    - Sync timer state after reconnection
    - _Requirements: 5.8, 19.3, 19.4_

- [x] 9. Implement answer submission during exam
  - [x] 9.1 Create submitAnswer controller function
    - Implement POST /api/submissions/:submissionId/answer endpoint
    - Validate submission belongs to requesting student
    - Validate submission status is 'in-progress'
    - For MCQ: validate selectedOption is valid index
    - For descriptive: validate textAnswer length (max 10,000 chars)
    - Update or add answer in submission.answers array
    - Save immediately (auto-save)
    - Return updated submission
    - _Requirements: 5.6, 6.1, 6.2, 16.6, 16.7, 19.1_


  - [x] 9.2 Create uploadAnswerSheet controller function
    - Implement POST /api/submissions/:submissionId/answer-sheet endpoint
    - Validate submission belongs to requesting student
    - Use multer middleware for file upload
    - Call file upload service for validation and storage
    - Update submission with answerSheetUrl
    - Return file URL
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 19.5_

  - [x] 9.3 Create submitExam controller function
    - Implement POST /api/submissions/:submissionId/submit endpoint
    - Validate submission belongs to requesting student
    - Validate submission status is 'in-progress'
    - Set submittedAt to current timestamp
    - Calculate timeSpent (submittedAt - startedAt)
    - Set isAutoSubmitted based on parameter
    - Change status to 'submitted'
    - Trigger auto-grading if exam is online-mcq type
    - Send confirmation notification to student
    - Return updated submission
    - _Requirements: 6.7, 6.8, 6.9, 15.5, 15.7_

  - [ ]* 9.4 Write unit tests for answer submission
    - Test MCQ answer validation
    - Test descriptive answer validation
    - Test auto-save functionality
    - Test submission ownership validation
    - _Requirements: 6.1, 6.2, 16.6, 16.7_

- [x] 10. Implement auto-grading for MCQ questions
  - [x] 10.1 Create autoGradeMCQSubmission function
    - Iterate through submission answers
    - For each MCQ answer: compare selectedOption with correct option
    - Award full marks if correct, apply negative marks if incorrect
    - Calculate total obtainedMarks (ensure non-negative)
    - Calculate percentage
    - Update submission with marks and percentage
    - If all questions are MCQ, set status to 'graded'
    - Return grading summary
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_


  - [ ]* 10.2 Write property test for auto-grading correctness
    - **Property 3: Auto-Grading Correctness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

  - [x] 10.3 Create autoGradeExam controller function
    - Implement POST /api/exams/:examId/auto-grade endpoint
    - Fetch all submitted submissions for exam
    - Call autoGradeMCQSubmission for each
    - Return count of graded submissions and summary
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement manual grading for descriptive questions
  - [x] 12.1 Create getSubmissionsForExam controller function
    - Implement GET /api/submissions/exam/:examId endpoint
    - Fetch submissions with status 'submitted' or 'graded'
    - Populate student information
    - Support filtering by status
    - Support sorting by submittedAt
    - Implement pagination
    - Return submissions array
    - _Requirements: 9.1, 18.1, 18.3_

  - [x] 12.2 Create gradeSubmission controller function
    - Implement POST /api/submissions/:submissionId/grade endpoint
    - Validate all questions have marksAwarded
    - Update each answer with marksAwarded and feedback
    - Calculate total obtainedMarks
    - Calculate percentage
    - Set status to 'graded'
    - Record gradedBy and gradedAt
    - Call generateResult to create/update result
    - Return graded submission and result
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_


  - [ ]* 12.3 Write property test for grading completeness
    - **Property 7: Grading Completeness**
    - **Validates: Requirements 9.5, 9.6**

- [x] 13. Implement result generation and ranking
  - [x] 13.1 Create generateExamResults function
    - Fetch all graded submissions for exam, sorted by obtainedMarks descending
    - Calculate rankings with tie handling (same marks = same rank)
    - Calculate grade based on percentage ranges (A+, A, B+, B, C, D, F)
    - Determine pass/fail based on exam.passingScore
    - Create or update Result document for each submission
    - Set isPublished to false by default
    - Return array of results
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 13.2 Write property test for ranking consistency
    - **Property 5: Ranking Consistency**
    - **Validates: Requirements 10.2, 10.3, 10.4**

  - [x] 13.3 Create publishResults controller function
    - Implement POST /api/exams/:examId/publish-results endpoint
    - Verify all submissions are graded
    - If not all graded, return error with count of ungraded
    - Set isPublished to true for all results
    - Set publishedAt timestamp
    - Update exam status to 'published'
    - Send notification to each student with result
    - Return count of published results
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 15.6, 15.7_

  - [x] 13.4 Create getExamResults controller function
    - Implement GET /api/results/exam/:examId endpoint
    - Fetch all results for exam
    - Calculate statistics (average, min, max scores)
    - Use aggregation pipeline for efficiency
    - Return results with statistics
    - _Requirements: 10.1, 18.4_


- [x] 14. Implement result viewing
  - [x] 14.1 Create getStudentResult controller function
    - Implement GET /api/results/exam/:examId/student/:studentId endpoint
    - Check if result is published (deny access if not, unless admin/university)
    - Fetch result with submission details
    - Populate question details for answer breakdown
    - If student viewing for first time, set viewedByStudent and viewedAt
    - Return result with detailed breakdown
    - _Requirements: 11.7, 11.8, 11.9, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [ ]* 14.2 Write property test for result visibility
    - **Property 4: Result Visibility**
    - **Validates: Requirements 11.7, 11.8, 11.9**

  - [x] 14.3 Create getMySubmission controller function
    - Implement GET /api/submissions/exam/:examId/my-submission endpoint
    - Fetch submission for requesting student
    - Populate question details
    - Return submission with answers
    - _Requirements: 5.7_

- [x] 15. Implement notification service
  - [x] 15.1 Create notification service module
    - Create NotificationService class with email and in-app methods
    - Integrate with existing email service (nodemailer)
    - Create notification templates for each event type
    - _Requirements: 15.1, 15.2, 15.8_

  - [x] 15.2 Implement exam scheduled notification
    - Create notifyExamScheduled function
    - Fetch enrolled students for course
    - Send email and in-app notification with exam details
    - Include title, date, time, duration, course name
    - _Requirements: 1.7, 15.1, 15.2_


  - [x] 15.3 Implement exam reminder notification
    - Create scheduled job using node-cron
    - Check for exams starting in 30 minutes
    - Send reminder notification to enrolled students
    - _Requirements: 15.3_

  - [x] 15.4 Implement result published notification
    - Create notifyResultPublished function
    - Send notification with result summary and link
    - Include exam title, obtained marks
    - _Requirements: 11.6, 15.6, 15.7_

  - [x] 15.5 Implement submission confirmation notification
    - Create notifySubmissionReceived function
    - Send confirmation with submission timestamp
    - _Requirements: 6.9, 15.5, 15.7_

  - [x] 15.6 Implement exam cancelled notification
    - Create notifyExamCancelled function
    - Send cancellation notice with reason
    - _Requirements: 15.4_

- [x] 16. Implement authorization middleware and route protection
  - [x] 16.1 Create role-based authorization middleware
    - Create authorize(...roles) middleware function
    - Check user role against allowed roles
    - Return 403 if unauthorized
    - _Requirements: All requirements with role-based access_

  - [x] 16.2 Apply authorization to all exam routes
    - Admin routes: scheduleExam, updateExam, deleteExam, getAllExams
    - University routes: uploadQuestionPaper, createQuestions, gradeSubmission, publishResults
    - Student routes: getStudentExams, startExam, submitAnswer, submitExam
    - Shared routes: checkExamAccess, getResults (with visibility rules)
    - _Requirements: All requirements with role-based access_


  - [x] 16.3 Implement resource ownership verification
    - Add ownership checks in controllers (students access own submissions, universities manage own exams)
    - Verify submission.student matches requesting user
    - Verify exam.university matches requesting user (for university operations)
    - _Requirements: 16.6, 16.7_

- [x] 17. Implement audit logging
  - [x] 17.1 Create audit log model and service
    - Define AuditLog schema with timestamp, userId, action, resource, details, IP, userAgent
    - Create logAuditEvent function
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8_

  - [x] 17.2 Add audit logging to critical operations
    - Log exam CRUD operations
    - Log question paper uploads
    - Log exam access attempts
    - Log submission events
    - Log grading actions
    - Log result publication
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

- [x] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement frontend - Admin exam scheduling
  - [x] 19.1 Create ExamScheduler component
    - Build form with fields: title, description, course, university, examType, dates, duration, marks
    - Add date/time pickers for scheduling
    - Add validation for time windows
    - Fetch courses and universities for dropdowns
    - Handle form submission to POST /api/exams
    - Display success/error notifications
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


  - [x] 19.2 Create ExamList component for admin
    - Display list of all exams with filtering (status, university, course)
    - Add pagination controls
    - Show exam details (title, date, status, type)
    - Add actions: edit, delete, view details
    - _Requirements: 1.8, 1.9, 18.1_

- [x] 20. Implement frontend - University exam content creation
  - [x] 20.1 Create ExamCreator component
    - Conditionally render based on examType (PDF vs online)
    - For PDF: file upload with drag-drop support
    - For online: question builder interface
    - Show upload progress for files
    - Display success/error messages
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [x] 20.2 Create QuestionBuilder sub-component
    - Form for question text, type (MCQ/descriptive), marks
    - For MCQ: dynamic options array with correct answer selection
    - For descriptive: just question text and marks
    - Add question to list
    - Display questions list with edit/delete actions
    - Bulk save all questions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 20.3 Create GradingInterface component
    - Display list of submissions for exam
    - Filter by status (submitted, graded)
    - Add auto-grade button for MCQ exams
    - Show selected submission details
    - Display questions with student answers
    - Input fields for marks and feedback per question
    - Overall feedback textarea
    - Submit grading button
    - View answer sheet for PDF exams
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_


  - [x] 20.4 Create ResultsManagement component
    - Display exam results with statistics
    - Show list of students with scores and ranks
    - Add publish results button
    - Validate all submissions graded before publishing
    - Show confirmation dialog before publishing
    - _Requirements: 10.1, 10.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 21. Implement frontend - Student exam taking
  - [x] 21.1 Create ExamList component for students
    - Display exams for enrolled courses
    - Show exam status (upcoming, ongoing, completed)
    - Display time until exam starts or time remaining
    - Add "Start Exam" button with access validation
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 21.2 Create ExamTaker component
    - Check exam access before rendering
    - Establish WebSocket connection on mount
    - Display timer with countdown
    - Handle time-remaining updates from WebSocket
    - Show warning notifications at 5 min and 1 min
    - Conditionally render based on examType
    - For PDF: download button and answer sheet upload
    - For online: question navigation and answer inputs
    - Prevent page navigation with confirmation dialog
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_

  - [x] 21.3 Create QuestionDisplay sub-component
    - Display question text and optional image
    - For MCQ: radio buttons for options
    - For descriptive: textarea with character counter
    - Auto-save answer on change
    - Show save status indicator
    - _Requirements: 6.1, 6.2, 5.6, 19.1_


  - [x] 21.4 Implement WebSocket client integration
    - Connect to Socket.IO server
    - Emit join-exam event with examId and studentId
    - Listen for time-remaining events and update state
    - Listen for time-warning events and show alerts
    - Listen for auto-submit events and handle gracefully
    - Implement reconnection logic with exponential backoff
    - Show connection status indicator
    - Fallback to HTTP API if WebSocket unavailable
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.8, 5.9, 19.3, 19.4_

  - [x] 21.5 Implement exam submission flow
    - Add submit button with confirmation dialog
    - Call POST /api/submissions/:submissionId/submit
    - Handle auto-submission from WebSocket
    - Show submission confirmation message
    - Redirect to confirmation page
    - Disconnect WebSocket on submission
    - _Requirements: 6.7, 6.8, 6.9, 7.7_

- [x] 22. Implement frontend - Student results viewing
  - [x] 22.1 Create ResultsViewer component
    - Fetch result for exam
    - Check if published (show message if not)
    - Display result summary card (marks, percentage, grade, pass/fail, rank)
    - Show overall feedback
    - Add toggle to show detailed answers
    - Display question-wise breakdown with answers and feedback
    - For MCQ: show selected vs correct option
    - Mark result as viewed on first view
    - Add download/print button
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 23. Implement error handling and recovery
  - [x] 23.1 Add error handling to all API endpoints
    - Wrap async functions with try-catch
    - Return appropriate HTTP status codes
    - Provide descriptive error messages
    - Log errors for debugging
    - _Requirements: 19.6, 19.8_


  - [x] 23.2 Implement frontend error boundaries
    - Create ErrorBoundary component for React
    - Wrap main components with error boundaries
    - Display user-friendly error messages
    - Provide retry mechanisms
    - _Requirements: 19.5_

  - [x] 23.3 Add validation error handling
    - Handle 400 Bad Request errors
    - Display field-specific validation errors
    - Highlight invalid form fields
    - _Requirements: 17.1, 17.2, 17.3_

  - [x] 23.4 Implement file upload error handling
    - Handle upload failures with retry option
    - Show upload progress
    - Display specific error messages (file too large, invalid type)
    - Preserve other form data on upload failure
    - _Requirements: 19.5_

- [x] 24. Implement performance optimizations
  - [x] 24.1 Add database indexes
    - Create indexes as specified in design (exam, question, submission, result collections)
    - Verify index usage with explain queries
    - _Requirements: 18.2_

  - [x] 24.2 Implement selective population
    - Use select() to limit populated fields
    - Only populate necessary references
    - _Requirements: 18.3_

  - [x] 24.3 Add caching layer (optional)
    - Set up Redis for caching
    - Cache exam details with 5-minute TTL
    - Cache question lists until exam starts
    - Invalidate cache on updates
    - _Requirements: 18.7_


  - [x] 24.4 Optimize WebSocket scaling
    - Configure Socket.IO with Redis adapter for horizontal scaling
    - Implement connection pooling
    - Clean up disconnected sockets
    - _Requirements: 18.5, 18.8_

- [x] 25. Implement security measures
  - [x] 25.1 Add input validation and sanitization
    - Use Joi or express-validator for all inputs
    - Sanitize HTML content in questions and feedback
    - Validate date ranges for logical consistency
    - _Requirements: 17.1, 17.2, 17.3_

  - [x] 25.2 Implement rate limiting
    - Add rate limiting middleware to all routes
    - Specific limits for file uploads (10/hour)
    - Specific limits for exam start (3/exam/student)
    - General API limit (100/15min)
    - _Requirements: 17.7_

  - [x] 25.3 Enhance file upload security
    - Validate MIME types on server
    - Implement malware scanning (optional)
    - Use randomized filenames
    - Generate signed URLs with expiration
    - _Requirements: 17.1, 17.4, 17.5, 17.6_

  - [x] 25.4 Add exam integrity measures
    - Implement question shuffling if configured
    - Randomize MCQ option order
    - Log all exam access attempts
    - Track answer change timestamps
    - _Requirements: Exam integrity from design_


- [x] 26. Implement mock exam support
  - [x] 26.1 Add mock exam handling in controllers
    - Support isMockExam flag in exam creation
    - Display mock exam indicator in UI
    - Follow same process as regular exams
    - Optionally exclude from grade calculations
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [x] 27. Final integration and testing
  - [x] 27.1 Create end-to-end test scenarios
    - Test complete exam flow: schedule → create content → take → grade → publish → view
    - Test WebSocket integration with multiple students
    - Test file upload and retrieval
    - Test notification delivery
    - _Requirements: All requirements_

  - [ ]* 27.2 Write integration tests for critical paths
    - Test exam access control with various scenarios
    - Test auto-submission on timeout
    - Test auto-grading accuracy
    - Test result generation and ranking
    - Test concurrent submissions (uniqueness)
    - _Requirements: 4.1-4.8, 7.1-7.8, 8.1-8.8, 10.1-10.9, 16.1-16.3_

  - [x] 27.3 Perform load testing
    - Test multiple concurrent exam takers
    - Test WebSocket scalability
    - Test file upload under load
    - Identify and fix bottlenecks
    - _Requirements: 18.1-18.8_

- [x] 28. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 29. Documentation and deployment preparation
  - [x] 29.1 Create API documentation
    - Document all endpoints with request/response examples
    - Include authentication requirements
    - Document WebSocket events
    - _Requirements: All API endpoints_

  - [x] 29.2 Create deployment guide
    - Document environment variables needed
    - Document file storage configuration
    - Document WebSocket scaling setup
    - Document database indexes to create
    - _Requirements: Deployment considerations_

  - [x] 29.3 Create user guides
    - Admin guide for scheduling exams
    - University guide for creating content and grading
    - Student guide for taking exams and viewing results
    - _Requirements: User workflows_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation uses JavaScript/Node.js for backend (Express, Mongoose, Socket.IO) and React for frontend
- File storage can be AWS S3 or local filesystem initially
- WebSocket scaling with Redis adapter is optional for MVP but recommended for production
- Caching layer is optional but improves performance significantly
- All security measures should be implemented before production deployment

