# Requirements Document: Exam Management System

## Introduction

The Exam Management System is a comprehensive examination platform that extends the existing MERN stack application to support end-to-end exam lifecycle management. The system enables administrators to schedule exams, universities to create and conduct examinations in multiple formats, and students to take exams with real-time monitoring. The system supports PDF-based exams, online MCQ exams, descriptive exams, and mixed formats, with automated grading capabilities, time-locked access control, and role-based result visibility.

## Glossary

- **System**: The Exam Management System as a whole
- **Admin**: User with administrative privileges who can schedule exams across all universities
- **University**: Educational institution user who creates exam content and grades submissions
- **Student**: Enrolled user who takes exams and views results
- **Exam**: A scheduled assessment with defined time window, format, and content
- **Mock_Exam**: Practice exam that does not affect student grades
- **Submission**: Student's answers and metadata for a specific exam attempt
- **Result**: Finalized exam outcome with scores, grade, and ranking
- **Question_Paper**: PDF document containing exam questions for PDF-based exams
- **Answer_Sheet**: Student's uploaded response document for PDF-based exams
- **MCQ**: Multiple Choice Question with predefined options
- **Descriptive_Question**: Open-ended question requiring text response
- **Auto_Grading**: Automated evaluation of MCQ answers by the system
- **Manual_Grading**: Human evaluation of descriptive answers by university staff
- **Time_Window**: Period between scheduledStartTime and scheduledEndTime when exam is accessible
- **Auto_Submission**: Automatic submission of exam when time expires
- **Real_Time_Timer**: Live countdown display showing remaining exam time
- **WebSocket**: Bidirectional communication channel for real-time updates
- **Publication**: Action of making results visible to students

## Requirements

### Requirement 1: Exam Scheduling and Configuration

**User Story:** As an admin, I want to schedule exams for courses with specific time windows and configurations, so that universities and students can prepare for upcoming assessments.

#### Acceptance Criteria

1. WHEN an admin creates an exam, THE System SHALL require title, course, university, exam type, scheduled start time, scheduled end time, duration, and total marks
2. WHEN an admin sets scheduled times, THE System SHALL validate that scheduled end time is after scheduled start time
3. WHEN an admin sets duration, THE System SHALL validate that duration fits within the time window between start and end times
4. WHEN an admin selects exam type, THE System SHALL accept only 'pdf-based', 'online-mcq', 'online-descriptive', or 'mixed' as valid values
5. WHEN an admin marks an exam as mock exam, THE System SHALL flag it separately from regular exams
6. WHEN an exam is created, THE System SHALL set initial status to 'scheduled'
7. WHEN an exam is created, THE System SHALL send notifications to all students enrolled in the associated course
8. WHEN an admin updates exam details, THE System SHALL validate all constraints before saving changes
9. WHEN an admin deletes an exam, THE System SHALL remove all associated questions, submissions, and results

### Requirement 2: Question Paper Management for PDF-Based Exams

**User Story:** As a university user, I want to upload PDF question papers for exams, so that students can download and answer them offline.

#### Acceptance Criteria

1. WHEN a university uploads a question paper, THE System SHALL validate that the file is a PDF format
2. WHEN a university uploads a question paper, THE System SHALL validate that file size does not exceed 10MB
3. WHEN a valid PDF is uploaded, THE System SHALL store the file in the configured storage service
4. WHEN a PDF is successfully uploaded, THE System SHALL update the exam record with the question paper URL
5. WHEN a university uploads a new question paper for an exam that already has one, THE System SHALL delete the old file before storing the new one
6. WHEN a student accesses a PDF-based exam, THE System SHALL provide a secure download link for the question paper
7. WHEN generating download links, THE System SHALL create time-limited signed URLs that expire after access

### Requirement 3: Online Question Creation and Management

**User Story:** As a university user, I want to create online questions with MCQ and descriptive formats, so that students can take exams directly in the system.

#### Acceptance Criteria

1. WHEN a university creates an MCQ question, THE System SHALL require question text, at least 2 options, and marks value
2. WHEN a university creates an MCQ question, THE System SHALL require exactly one option to be marked as correct
3. WHEN a university creates a descriptive question, THE System SHALL require question text and marks value
4. WHEN a university sets negative marks for MCQ, THE System SHALL validate that negative marks are non-negative and less than positive marks
5. WHEN a university assigns question order, THE System SHALL ensure order values are unique within the exam
6. WHEN a university saves questions, THE System SHALL associate them with the specified exam
7. WHEN a university updates a question, THE System SHALL validate all constraints before saving
8. WHEN a university deletes a question, THE System SHALL remove it only if no submissions reference it

### Requirement 4: Time-Based Exam Access Control

**User Story:** As a student, I want to access exams only during their scheduled time windows, so that all students take exams fairly under the same conditions.

#### Acceptance Criteria

1. WHEN a student requests exam access before scheduled start time, THE System SHALL deny access and display time remaining until start
2. WHEN a student requests exam access after scheduled end time and late submission is not allowed, THE System SHALL deny access with appropriate message
3. WHEN a student requests exam access after scheduled end time and late submission is allowed, THE System SHALL check if current time is before late submission deadline
4. WHEN a student requests exam access during valid time window, THE System SHALL verify student enrollment in the exam's course
5. WHEN a student is not enrolled in the course, THE System SHALL deny exam access regardless of time
6. WHEN a student has already submitted the exam, THE System SHALL deny access to retake
7. WHEN all access conditions are met, THE System SHALL grant access and provide exam details with time remaining
8. WHEN calculating time remaining, THE System SHALL use the earlier of scheduled end time or late submission deadline

### Requirement 5: Exam Taking with Real-Time Timer

**User Story:** As a student, I want to take exams with a real-time countdown timer, so that I can manage my time effectively during the exam.

#### Acceptance Criteria

1. WHEN a student starts an exam, THE System SHALL create a submission record with current timestamp as startedAt
2. WHEN a student starts an exam, THE System SHALL establish a WebSocket connection for real-time updates
3. WHEN a student is taking an exam, THE System SHALL broadcast time remaining updates every minute via WebSocket
4. WHEN 5 minutes remain, THE System SHALL send a warning notification to the student
5. WHEN 1 minute remains, THE System SHALL send a final warning notification to the student
6. WHEN a student answers a question, THE System SHALL save the answer immediately to prevent data loss
7. WHEN a student navigates between questions, THE System SHALL preserve all previously entered answers
8. WHEN a student's WebSocket connection drops, THE System SHALL attempt automatic reconnection with exponential backoff
9. WHEN WebSocket is unavailable, THE System SHALL continue saving answers via HTTP API as fallback

### Requirement 6: Answer Submission for Different Exam Types

**User Story:** As a student, I want to submit answers in different formats based on exam type, so that I can complete various types of assessments.

#### Acceptance Criteria

1. WHEN taking an MCQ question, THE System SHALL allow selection of exactly one option
2. WHEN taking a descriptive question, THE System SHALL provide a text area for answer entry with maximum 10,000 characters
3. WHEN taking a PDF-based exam, THE System SHALL allow upload of answer sheet file
4. WHEN a student uploads an answer sheet, THE System SHALL validate file type is PDF or image format
5. WHEN a student uploads an answer sheet, THE System SHALL validate file size does not exceed 20MB
6. WHEN a valid answer sheet is uploaded, THE System SHALL store it and update the submission record with the file URL
7. WHEN a student submits answers, THE System SHALL record submission timestamp and calculate time spent
8. WHEN a student manually submits before time expires, THE System SHALL set isAutoSubmitted to false
9. WHEN submission is successful, THE System SHALL send confirmation notification to the student

### Requirement 7: Automatic Submission on Time Expiry

**User Story:** As a student, I want my exam to be automatically submitted when time expires, so that I don't lose my work if I forget to submit manually.

#### Acceptance Criteria

1. WHEN exam time expires, THE System SHALL identify all submissions with status 'in-progress' for that exam
2. WHEN exam time expires, THE System SHALL automatically submit each in-progress submission
3. WHEN auto-submitting, THE System SHALL set submittedAt to current timestamp
4. WHEN auto-submitting, THE System SHALL calculate timeSpent as difference between submittedAt and startedAt
5. WHEN auto-submitting, THE System SHALL set isAutoSubmitted flag to true
6. WHEN auto-submitting, THE System SHALL change submission status from 'in-progress' to 'submitted'
7. WHEN auto-submission occurs, THE System SHALL send notification to affected student via WebSocket
8. WHEN all auto-submissions complete, THE System SHALL update exam status to 'completed'

### Requirement 8: Automatic Grading for MCQ Questions

**User Story:** As a university user, I want MCQ questions to be graded automatically, so that I can save time and provide immediate feedback for objective assessments.

#### Acceptance Criteria

1. WHEN a submission contains MCQ answers, THE System SHALL compare selected option with correct option for each question
2. WHEN a selected option is correct, THE System SHALL award full marks for that question
3. WHEN a selected option is incorrect, THE System SHALL deduct negative marks if configured
4. WHEN calculating obtained marks, THE System SHALL sum all awarded marks minus all negative marks
5. WHEN obtained marks calculation results in negative value, THE System SHALL set obtained marks to zero
6. WHEN all questions in exam are MCQ type, THE System SHALL automatically change submission status to 'graded' after auto-grading
7. WHEN exam contains mixed question types, THE System SHALL grade MCQ questions but keep status as 'submitted' pending manual grading
8. WHEN auto-grading completes, THE System SHALL calculate percentage as (obtainedMarks / totalMarks) × 100

### Requirement 9: Manual Grading for Descriptive Questions

**User Story:** As a university user, I want to manually grade descriptive answers and provide feedback, so that I can evaluate subjective responses fairly.

#### Acceptance Criteria

1. WHEN a university views submissions for grading, THE System SHALL display all submitted submissions with student information
2. WHEN a university selects a submission, THE System SHALL display all questions with student answers
3. WHEN grading a descriptive answer, THE System SHALL allow university to enter marks awarded between 0 and maximum marks for that question
4. WHEN grading a descriptive answer, THE System SHALL allow university to enter optional feedback text
5. WHEN university submits grading, THE System SHALL validate that all questions have marks awarded
6. WHEN grading is complete, THE System SHALL calculate total obtained marks as sum of all marksAwarded
7. WHEN grading is complete, THE System SHALL calculate percentage as (obtainedMarks / totalMarks) × 100
8. WHEN grading is complete, THE System SHALL change submission status to 'graded'
9. WHEN grading is complete, THE System SHALL record gradedBy user ID and gradedAt timestamp
10. WHEN grading is complete, THE System SHALL create or update result record for the student

### Requirement 10: Result Generation and Ranking

**User Story:** As a university user, I want to generate results with rankings for all students, so that I can provide comparative performance feedback.

#### Acceptance Criteria

1. WHEN generating results, THE System SHALL process all submissions with status 'graded' for the exam
2. WHEN calculating rankings, THE System SHALL sort students by obtainedMarks in descending order
3. WHEN students have equal marks, THE System SHALL assign them the same rank
4. WHEN assigning subsequent ranks after tied students, THE System SHALL account for the number of tied students
5. WHEN calculating grade, THE System SHALL apply percentage-based grade ranges (A+: 90-100, A: 80-89, B+: 70-79, B: 60-69, C: 50-59, D: 40-49, F: 0-39)
6. WHEN determining pass/fail status, THE System SHALL compare percentage with exam's passing score threshold
7. WHEN creating result record, THE System SHALL include totalMarks, obtainedMarks, percentage, grade, isPassed, and rank
8. WHEN creating result record, THE System SHALL set isPublished to false by default
9. WHEN result is created, THE System SHALL link it to the corresponding submission

### Requirement 11: Result Publication and Visibility Control

**User Story:** As a university user, I want to control when results become visible to students, so that I can review and verify all grades before publication.

#### Acceptance Criteria

1. WHEN a university publishes results, THE System SHALL verify all submissions for the exam have status 'graded'
2. WHEN not all submissions are graded, THE System SHALL prevent publication and display count of ungraded submissions
3. WHEN publishing results, THE System SHALL set isPublished flag to true for all results of that exam
4. WHEN publishing results, THE System SHALL set publishedAt timestamp to current time
5. WHEN publishing results, THE System SHALL update exam status to 'published'
6. WHEN publishing results, THE System SHALL send notification to each student with a result
7. WHEN a student requests their result before publication, THE System SHALL deny access with message indicating results not yet published
8. WHEN a student requests their result after publication, THE System SHALL display complete result details
9. WHEN an admin or university requests any result, THE System SHALL display it regardless of publication status

### Requirement 12: Detailed Result Viewing

**User Story:** As a student, I want to view my detailed exam results with question-wise breakdown, so that I can understand my performance and learn from mistakes.

#### Acceptance Criteria

1. WHEN a student views their result, THE System SHALL display obtained marks, total marks, percentage, grade, and pass/fail status
2. WHEN a student views their result, THE System SHALL display their rank among all students who took the exam
3. WHEN a student views their result, THE System SHALL display overall feedback if provided by grader
4. WHEN a student requests detailed breakdown, THE System SHALL display each question with their answer
5. WHEN displaying MCQ questions in breakdown, THE System SHALL show selected option, correct option, and marks awarded
6. WHEN displaying descriptive questions in breakdown, THE System SHALL show submitted text answer, marks awarded, and feedback
7. WHEN a student views their result for the first time, THE System SHALL set viewedByStudent flag to true and record viewedAt timestamp
8. WHEN a university views a student's result, THE System SHALL display the same detailed information including submission details

### Requirement 13: Mock Exam Support

**User Story:** As an admin, I want to create mock exams for practice, so that students can familiarize themselves with the exam format without affecting their grades.

#### Acceptance Criteria

1. WHEN an admin creates an exam, THE System SHALL provide option to mark it as mock exam
2. WHEN an exam is marked as mock, THE System SHALL set isMockExam flag to true
3. WHEN displaying exam lists, THE System SHALL clearly indicate which exams are mock exams
4. WHEN a student takes a mock exam, THE System SHALL follow the same process as regular exams including time limits and auto-submission
5. WHEN grading mock exams, THE System SHALL apply the same grading logic as regular exams
6. WHEN displaying results, THE System SHALL indicate if the result is from a mock exam
7. WHEN calculating student performance metrics, THE System SHALL optionally exclude mock exam results from grade calculations

### Requirement 14: Exam Status Management

**User Story:** As a university user, I want to track and update exam status through its lifecycle, so that I can manage the exam process effectively.

#### Acceptance Criteria

1. WHEN an exam is created, THE System SHALL set status to 'scheduled'
2. WHEN exam start time arrives, THE System SHALL allow status transition to 'ongoing'
3. WHEN exam end time passes, THE System SHALL allow status transition to 'completed'
4. WHEN all submissions are graded, THE System SHALL allow status transition to 'graded'
5. WHEN results are published, THE System SHALL transition status to 'published'
6. WHEN updating status, THE System SHALL validate that transition follows valid state machine (scheduled → ongoing → completed → graded → published)
7. WHEN status is 'completed' or later, THE System SHALL prevent new students from starting the exam
8. WHEN status changes, THE System SHALL record timestamp of the change

### Requirement 15: Notification System for Exam Events

**User Story:** As a student, I want to receive notifications about exam schedules and results, so that I don't miss important exam-related events.

#### Acceptance Criteria

1. WHEN an exam is scheduled, THE System SHALL send notification to all students enrolled in the course
2. WHEN sending exam scheduled notification, THE System SHALL include exam title, date, time, duration, and course name
3. WHEN exam start time is 30 minutes away, THE System SHALL send reminder notification to enrolled students
4. WHEN exam is cancelled, THE System SHALL send cancellation notification with reason to all enrolled students
5. WHEN a student submits an exam, THE System SHALL send confirmation notification with submission timestamp
6. WHEN results are published, THE System SHALL send notification to each student with a result
7. WHEN sending result notification, THE System SHALL include exam title, obtained marks, and link to view detailed results
8. WHEN sending notifications, THE System SHALL use both email and in-app notification channels

### Requirement 16: Submission Uniqueness and Integrity

**User Story:** As a system administrator, I want to ensure each student can submit an exam only once, so that exam integrity is maintained.

#### Acceptance Criteria

1. WHEN a student starts an exam, THE System SHALL check for existing submission for that student-exam combination
2. WHEN an existing submission with status 'submitted' or 'graded' exists, THE System SHALL prevent creating a new submission
3. WHEN storing submissions, THE System SHALL enforce unique compound index on (exam, student) fields
4. WHEN a duplicate submission is attempted, THE System SHALL return error message indicating exam already submitted
5. WHEN a submission is in 'in-progress' status and student reconnects, THE System SHALL resume the existing submission
6. WHEN validating answer submissions, THE System SHALL verify the submission belongs to the requesting student
7. WHEN validating answer submissions, THE System SHALL verify the submission status is 'in-progress'

### Requirement 17: File Upload Security and Validation

**User Story:** As a system administrator, I want to validate and secure all file uploads, so that the system is protected from malicious files and storage abuse.

#### Acceptance Criteria

1. WHEN a file is uploaded, THE System SHALL validate file type matches expected format (PDF for question papers, PDF/image for answer sheets)
2. WHEN a file is uploaded, THE System SHALL validate file size is within allowed limits (10MB for question papers, 20MB for answer sheets)
3. WHEN file validation fails, THE System SHALL reject upload and return descriptive error message
4. WHEN storing files, THE System SHALL generate randomized filenames to prevent path traversal attacks
5. WHEN storing files, THE System SHALL organize them in structured directories by exam and student
6. WHEN generating file access URLs, THE System SHALL create time-limited signed URLs that expire after specified duration
7. WHEN a file is replaced, THE System SHALL delete the old file from storage before storing the new one
8. WHEN an exam is deleted, THE System SHALL delete all associated files (question papers and answer sheets)

### Requirement 18: Performance and Scalability

**User Story:** As a system administrator, I want the system to handle multiple concurrent exams efficiently, so that performance remains acceptable under load.

#### Acceptance Criteria

1. WHEN querying exam lists, THE System SHALL implement pagination with configurable page size
2. WHEN loading exam details, THE System SHALL use database indexes on frequently queried fields (course, status, scheduledStartTime)
3. WHEN loading submissions, THE System SHALL selectively populate only required reference fields
4. WHEN calculating exam statistics, THE System SHALL use database aggregation pipelines instead of loading all records
5. WHEN multiple students connect to same exam, THE System SHALL use WebSocket rooms for efficient broadcasting
6. WHEN broadcasting timer updates, THE System SHALL send updates at 1-minute intervals instead of continuous updates
7. WHEN caching is enabled, THE System SHALL cache exam details with 5-minute TTL and invalidate on updates
8. WHEN horizontal scaling is required, THE System SHALL support WebSocket scaling using Redis adapter

### Requirement 19: Error Recovery and Data Integrity

**User Story:** As a student, I want my exam progress to be saved continuously, so that I don't lose my work if connection issues occur.

#### Acceptance Criteria

1. WHEN a student answers a question, THE System SHALL save the answer immediately without waiting for manual save
2. WHEN WebSocket connection is lost, THE System SHALL display warning message to student
3. WHEN WebSocket connection is lost, THE System SHALL continue saving answers via HTTP API
4. WHEN WebSocket connection is restored, THE System SHALL automatically reconnect and resume timer updates
5. WHEN a file upload fails, THE System SHALL allow retry without losing other form data
6. WHEN a database operation fails, THE System SHALL rollback any partial changes to maintain consistency
7. WHEN auto-submission fails due to system error, THE System SHALL retry with exponential backoff
8. WHEN critical errors occur during exam, THE System SHALL log detailed error information for debugging

### Requirement 20: Audit Logging and Monitoring

**User Story:** As a system administrator, I want to track all critical exam-related actions, so that I can audit system usage and investigate issues.

#### Acceptance Criteria

1. WHEN an exam is created, modified, or deleted, THE System SHALL log the action with user ID, timestamp, and details
2. WHEN a question paper is uploaded, THE System SHALL log the upload with file metadata
3. WHEN a student accesses an exam, THE System SHALL log the access attempt with result (granted/denied) and reason
4. WHEN a student starts an exam, THE System SHALL log the start event with timestamp
5. WHEN a submission occurs, THE System SHALL log submission type (manual/auto) and timestamp
6. WHEN grading is performed, THE System SHALL log grader ID, submission ID, and timestamp
7. WHEN results are published, THE System SHALL log publisher ID, exam ID, and count of published results
8. WHEN logging events, THE System SHALL include IP address and user agent for security analysis
