# Design Document: Exam Management System

## Overview

The Exam Management System extends the existing MERN stack application to support comprehensive exam scheduling, conducting, and grading capabilities. The system supports three user roles (admin, university, student) with distinct permissions, multiple exam formats (PDF-based, online MCQ, descriptive, mixed), and time-based access control. The design integrates with existing User, Course, and Enrollment models while adding new Exam, Question, Submission, and Result models. Key features include real-time exam timers, auto-submission, file upload handling for PDFs and answer sheets, role-based result visibility, and notification system for exam schedules and results.

## Architecture

```mermaid
graph TD
    A[React Frontend] --> B[Express REST API]
    B --> C[MongoDB Database]
    B --> D[File Storage Service]
    B --> E[Notification Service]
    B --> F[WebSocket Server]
    
    C --> G[User Model]
    C --> H[Course Model]
    C --> I[Exam Model]
    C --> J[Question Model]
    C --> K[Submission Model]
    C --> L[Result Model]
    
    F --> M[Real-time Timer]
    F --> N[Auto-submission]
    
    D --> O[PDF Storage]
    D --> P[Answer Sheet Storage]
    
    E --> Q[Email Notifications]
    E --> R[In-app Notifications]


## Main Workflow

```mermaid
sequenceDiagram
    participant Admin
    participant University
    participant Student
    participant System
    participant Database
    
    Admin->>System: Schedule Exam
    System->>Database: Create Exam Record
    System->>Student: Send Notification
    
    University->>System: Upload Questions/PDF
    System->>Database: Store Exam Content
    
    Student->>System: Request Exam Access
    System->>System: Check Time Window
    alt Time Valid
        System->>Student: Grant Access
        Student->>System: Submit Answers
        System->>Database: Store Submission
    else Time Invalid
        System->>Student: Access Denied
    end
    
    University->>System: Grade Submissions
    System->>Database: Update Results
    
    University->>System: Publish Results
    System->>Student: Notify Results Available


## Components and Interfaces

### Component 1: Exam Model (Backend)

**Purpose**: Core data model representing an exam with scheduling, configuration, and access control

**Interface**:
```javascript
const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  
  // Relationships
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Exam Type
  examType: { 
    type: String, 
    enum: ['pdf-based', 'online-mcq', 'online-descriptive', 'mixed'],
    required: true 
  },
  isMockExam: { type: Boolean, default: false },
  
  // Scheduling
  scheduledStartTime: { type: Date, required: true },
  scheduledEndTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  
  // PDF-based exam fields
  questionPaperUrl: { type: String },
  
  // Access Control
  allowLateSubmission: { type: Boolean, default: false },
  lateSubmissionDeadline: { type: Date },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'graded', 'published'],
    default: 'scheduled'
  },
  
  // Result Control
  resultsPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  
  // Configuration
  shuffleQuestions: { type: Boolean, default: false },
  showResultsImmediately: { type: Boolean, default: false },
  passingScore: { type: Number, min: 0, max: 100 },
  
  // Metadata
  totalMarks: { type: Number, required: true },
  instructions: { type: String, maxlength: 2000 }
}, { timestamps: true });
```

**Responsibilities**:
- Store exam configuration and scheduling information
- Manage exam lifecycle status transitions
- Control access based on time windows
- Link to course, university, and creator
- Support multiple exam formats



### Component 2: Question Model (Backend)

**Purpose**: Store individual questions for online exams with support for MCQ and descriptive types

**Interface**:
```javascript
const questionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  
  questionType: {
    type: String,
    enum: ['mcq', 'descriptive'],
    required: true
  },
  
  questionText: { type: String, required: true, maxlength: 2000 },
  questionImage: { type: String }, // Optional image URL
  
  // MCQ specific fields
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  
  // Grading
  marks: { type: Number, required: true, min: 0 },
  negativeMarks: { type: Number, default: 0, min: 0 },
  
  // Metadata
  order: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  tags: [{ type: String }]
}, { timestamps: true });
```

**Responsibilities**:
- Store question content and metadata
- Support MCQ with multiple options and correct answer marking
- Support descriptive questions for manual grading
- Maintain question ordering within exam
- Store marks allocation and negative marking rules



### Component 3: Submission Model (Backend)

**Purpose**: Track student exam submissions with answers and timing information

**Interface**:
```javascript
const submissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Timing
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  timeSpent: { type: Number }, // in seconds
  isAutoSubmitted: { type: Boolean, default: false },
  
  // Answers for online exams
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionType: { type: String, enum: ['mcq', 'descriptive'] },
    
    // MCQ answer
    selectedOption: { type: Number }, // index of selected option
    
    // Descriptive answer
    textAnswer: { type: String, maxlength: 10000 },
    
    // Grading
    marksAwarded: { type: Number, default: 0 },
    isCorrect: { type: Boolean }, // for MCQ auto-grading
    feedback: { type: String } // for descriptive questions
  }],
  
  // PDF-based exam answer sheet
  answerSheetUrl: { type: String },
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded'],
    default: 'in-progress'
  },
  
  // Grading
  totalMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date }
}, { timestamps: true });

// Compound index for unique student-exam combination
submissionSchema.index({ exam: 1, student: 1 }, { unique: true });
```

**Responsibilities**:
- Track student exam attempts with timing
- Store answers for both MCQ and descriptive questions
- Handle answer sheet uploads for PDF-based exams
- Support auto-grading for MCQ questions
- Store manual grading results and feedback
- Prevent duplicate submissions per student-exam pair



### Component 4: Result Model (Backend)

**Purpose**: Store finalized exam results with visibility control

**Interface**:
```javascript
const resultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  
  // Scores
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String }, // A+, A, B+, etc.
  
  // Status
  isPassed: { type: Boolean },
  rank: { type: Number }, // rank among all students
  
  // Visibility
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  
  // Feedback
  overallFeedback: { type: String, maxlength: 1000 },
  
  // Metadata
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewedByStudent: { type: Boolean, default: false },
  viewedAt: { type: Date }
}, { timestamps: true });

// Compound index for unique student-exam combination
resultSchema.index({ exam: 1, student: 1 }, { unique: true });
```

**Responsibilities**:
- Store finalized exam results
- Control visibility to students via publication flag
- Calculate grades and rankings
- Track when students view their results
- Link to submission for detailed answer review



### Component 5: Exam Controller (Backend)

**Purpose**: Handle HTTP requests for exam CRUD operations and access control

**Interface**:
```javascript
class ExamController {
  // Admin operations
  async scheduleExam(req, res) {
    // POST /api/exams
    // Body: { title, course, university, scheduledStartTime, duration, examType, ... }
    // Returns: Created exam object
  }
  
  async updateExam(req, res) {
    // PUT /api/exams/:examId
    // Body: Partial exam fields to update
    // Returns: Updated exam object
  }
  
  async deleteExam(req, res) {
    // DELETE /api/exams/:examId
    // Returns: Success message
  }
  
  async getAllExams(req, res) {
    // GET /api/exams?status=scheduled&university=xyz
    // Query params: status, university, course, isMockExam
    // Returns: Array of exams with pagination
  }
  
  // University operations
  async uploadQuestionPaper(req, res) {
    // POST /api/exams/:examId/question-paper
    // Body: FormData with PDF file
    // Returns: { questionPaperUrl }
  }
  
  async createOnlineQuestions(req, res) {
    // POST /api/exams/:examId/questions
    // Body: Array of question objects
    // Returns: Array of created questions
  }
  
  async updateExamStatus(req, res) {
    // PATCH /api/exams/:examId/status
    // Body: { status: 'ongoing' | 'completed' | 'graded' }
    // Returns: Updated exam
  }
  
  async publishResults(req, res) {
    // POST /api/exams/:examId/publish-results
    // Returns: { published: true, count: number }
  }
  
  // Student operations
  async getStudentExams(req, res) {
    // GET /api/exams/student/my-exams
    // Returns: Array of exams for enrolled courses
  }
  
  async checkExamAccess(req, res) {
    // GET /api/exams/:examId/access
    // Returns: { canAccess: boolean, reason: string, timeRemaining: number }
  }
  
  async startExam(req, res) {
    // POST /api/exams/:examId/start
    // Returns: { submission, questions (if online), questionPaperUrl (if PDF) }
  }
}
```

**Responsibilities**:
- Handle exam CRUD operations with role-based authorization
- Validate exam scheduling and time windows
- Manage file uploads for question papers
- Control exam access based on time and enrollment
- Coordinate exam status transitions
- Trigger notifications on exam events



### Component 6: Submission Controller (Backend)

**Purpose**: Handle student submissions, grading, and result generation

**Interface**:
```javascript
class SubmissionController {
  // Student operations
  async submitAnswer(req, res) {
    // POST /api/submissions/:submissionId/answer
    // Body: { questionId, selectedOption?, textAnswer? }
    // Returns: Updated submission
  }
  
  async uploadAnswerSheet(req, res) {
    // POST /api/submissions/:submissionId/answer-sheet
    // Body: FormData with answer sheet file
    // Returns: { answerSheetUrl }
  }
  
  async submitExam(req, res) {
    // POST /api/submissions/:submissionId/submit
    // Body: { isAutoSubmit: boolean }
    // Returns: { submission, autoGradedMarks }
  }
  
  async getMySubmission(req, res) {
    // GET /api/submissions/exam/:examId/my-submission
    // Returns: Submission with answers
  }
  
  // University operations
  async getSubmissionsForExam(req, res) {
    // GET /api/submissions/exam/:examId
    // Query: ?status=submitted&sortBy=submittedAt
    // Returns: Array of submissions with student info
  }
  
  async gradeSubmission(req, res) {
    // POST /api/submissions/:submissionId/grade
    // Body: { answers: [{ questionId, marksAwarded, feedback }], overallFeedback }
    // Returns: Graded submission with result
  }
  
  async autoGradeExam(req, res) {
    // POST /api/exams/:examId/auto-grade
    // Returns: { gradedCount, results }
  }
  
  // Result operations
  async getExamResults(req, res) {
    // GET /api/results/exam/:examId
    // Returns: Array of results with statistics
  }
  
  async getStudentResult(req, res) {
    // GET /api/results/exam/:examId/student/:studentId
    // Returns: Result with detailed submission
  }
}
```

**Responsibilities**:
- Handle answer submission during exam
- Support file uploads for answer sheets
- Implement auto-grading logic for MCQ questions
- Provide grading interface for university users
- Generate results from graded submissions
- Calculate statistics and rankings



### Component 7: WebSocket Service (Backend)

**Purpose**: Provide real-time exam timer and auto-submission functionality

**Interface**:
```javascript
class ExamWebSocketService {
  constructor(io) {
    this.io = io;
    this.activeExams = new Map(); // examId -> Set of socket connections
  }
  
  joinExam(socket, examId, studentId) {
    // Student joins exam room for real-time updates
    // Validates access and adds to active exams tracking
  }
  
  leaveExam(socket, examId, studentId) {
    // Student leaves exam room
    // Cleans up tracking
  }
  
  broadcastTimeRemaining(examId, timeRemaining) {
    // Sends time remaining to all students in exam
    // Payload: { examId, timeRemaining, timestamp }
  }
  
  triggerAutoSubmit(examId, studentId) {
    // Forces submission when time expires
    // Emits auto-submit event to specific student
  }
  
  notifyExamStatusChange(examId, newStatus) {
    // Notifies all connected students of status change
    // Payload: { examId, status, message }
  }
  
  startExamTimer(examId, duration) {
    // Starts countdown timer for exam
    // Broadcasts updates every minute
    // Triggers auto-submit at expiry
  }
}
```

**Responsibilities**:
- Manage WebSocket connections for active exams
- Broadcast real-time timer updates to students
- Trigger auto-submission when time expires
- Notify students of exam status changes
- Handle connection cleanup and error recovery



### Component 8: File Upload Service (Backend)

**Purpose**: Handle file uploads for question papers and answer sheets with validation

**Interface**:
```javascript
class FileUploadService {
  async uploadQuestionPaper(file, examId) {
    // Validates PDF file (type, size < 10MB)
    // Uploads to storage (AWS S3, local, etc.)
    // Returns: { url, filename, size }
  }
  
  async uploadAnswerSheet(file, submissionId, studentId) {
    // Validates file (PDF/image, size < 20MB)
    // Uploads to storage with organized path
    // Returns: { url, filename, size }
  }
  
  async deleteFile(url) {
    // Removes file from storage
    // Returns: { success: boolean }
  }
  
  validatePDF(file) {
    // Checks file type is PDF
    // Validates file size
    // Returns: { valid: boolean, error?: string }
  }
  
  generateSecureUrl(path, expiresIn) {
    // Generates time-limited signed URL for file access
    // Returns: { url, expiresAt }
  }
}
```

**Responsibilities**:
- Validate file types and sizes
- Upload files to configured storage service
- Generate secure URLs for file access
- Handle file deletion and cleanup
- Organize files with proper naming conventions



### Component 9: Notification Service (Backend)

**Purpose**: Send notifications for exam events via email and in-app channels

**Interface**:
```javascript
class NotificationService {
  async notifyExamScheduled(exam, students) {
    // Sends notification when exam is scheduled
    // Channels: Email + In-app
    // Template: Exam details, date, time, course
  }
  
  async notifyExamStarting(exam, students, minutesBefore) {
    // Reminder notification before exam starts
    // Channels: Email + In-app
    // Template: Exam starting in X minutes
  }
  
  async notifyResultPublished(exam, student, result) {
    // Notification when results are published
    // Channels: Email + In-app
    // Template: Result summary with link to view details
  }
  
  async notifyExamCancelled(exam, students, reason) {
    // Notification when exam is cancelled
    // Channels: Email + In-app
    // Template: Cancellation notice with reason
  }
  
  async notifySubmissionReceived(submission, student) {
    // Confirmation after successful submission
    // Channels: Email + In-app
    // Template: Submission confirmation with timestamp
  }
  
  async sendBulkNotification(userIds, message, type) {
    // Generic bulk notification sender
    // Returns: { sent: number, failed: number }
  }
}
```

**Responsibilities**:
- Send email notifications for exam events
- Create in-app notifications
- Handle notification templates
- Support bulk notifications
- Track notification delivery status



### Component 10: ExamScheduler Component (Frontend - Admin)

**Purpose**: React component for admin to schedule and manage exams

**Interface**:
```javascript
const ExamScheduler = () => {
  // State management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    university: '',
    examType: 'online-mcq',
    scheduledStartTime: '',
    duration: 60,
    totalMarks: 100,
    isMockExam: false
  });
  
  // API calls
  const handleScheduleExam = async (data) => {
    // POST /api/exams
    // Validates form data
    // Shows success/error notification
  };
  
  const fetchCourses = async () => {
    // GET /api/courses
    // Populates course dropdown
  };
  
  const fetchUniversities = async () => {
    // GET /api/users?role=university
    // Populates university dropdown
  };
  
  // Render form with fields:
  // - Title, Description
  // - Course selection (dropdown)
  // - University selection (dropdown)
  // - Exam type (radio buttons)
  // - Date/Time picker
  // - Duration (number input)
  // - Total marks
  // - Mock exam checkbox
  // - Submit button
};
```

**Responsibilities**:
- Provide form for exam scheduling
- Validate input data
- Handle course and university selection
- Submit exam creation request
- Display success/error feedback



### Component 11: ExamCreator Component (Frontend - University)

**Purpose**: React component for university to create exam content (questions or upload PDF)

**Interface**:
```javascript
const ExamCreator = ({ examId, examType }) => {
  // State
  const [questions, setQuestions] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });
  
  // For PDF-based exams
  const handlePDFUpload = async (file) => {
    // POST /api/exams/:examId/question-paper
    // Uploads PDF file
    // Shows upload progress
  };
  
  // For online exams
  const addQuestion = () => {
    // Adds current question to questions array
    // Resets form for next question
  };
  
  const saveQuestions = async () => {
    // POST /api/exams/:examId/questions
    // Bulk creates all questions
    // Shows success notification
  };
  
  const handleOptionChange = (index, value) => {
    // Updates option text at index
  };
  
  const setCorrectOption = (index) => {
    // Marks option as correct answer
  };
  
  // Render based on examType:
  // - PDF: File upload with drag-drop
  // - Online: Question builder form
  //   - Question text (textarea)
  //   - Type selector (MCQ/Descriptive)
  //   - Options (for MCQ)
  //   - Marks input
  //   - Add question button
  //   - Questions list with edit/delete
  //   - Save all button
};
```

**Responsibilities**:
- Handle PDF upload for PDF-based exams
- Provide question builder for online exams
- Support MCQ and descriptive question types
- Validate question data before submission
- Display question preview and editing



### Component 12: ExamTaker Component (Frontend - Student)

**Purpose**: React component for students to take exams with timer and auto-submission

**Interface**:
```javascript
const ExamTaker = ({ examId }) => {
  // State
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // WebSocket connection
  useEffect(() => {
    const socket = io();
    socket.emit('join-exam', { examId, studentId });
    
    socket.on('time-remaining', (data) => {
      setTimeRemaining(data.timeRemaining);
    });
    
    socket.on('auto-submit', () => {
      handleAutoSubmit();
    });
    
    return () => socket.disconnect();
  }, [examId]);
  
  // Start exam
  const startExam = async () => {
    // POST /api/exams/:examId/start
    // Fetches questions and creates submission
  };
  
  // Answer handling
  const handleAnswerChange = async (questionId, answer) => {
    // Updates local state
    // POST /api/submissions/:submissionId/answer
    // Auto-saves answer
  };
  
  // Submission
  const handleSubmit = async () => {
    // POST /api/submissions/:submissionId/submit
    // Confirms before submitting
    // Redirects to confirmation page
  };
  
  const handleAutoSubmit = async () => {
    // Triggered by WebSocket when time expires
    // POST /api/submissions/:submissionId/submit
    // Shows auto-submit notification
  };
  
  // PDF download (for PDF-based exams)
  const downloadQuestionPaper = () => {
    // Downloads PDF from exam.questionPaperUrl
  };
  
  // Answer sheet upload (for PDF-based exams)
  const uploadAnswerSheet = async (file) => {
    // POST /api/submissions/:submissionId/answer-sheet
    // Shows upload progress
  };
  
  // Render:
  // - Timer display (countdown)
  // - Progress indicator
  // - Question navigation
  // - Answer input (MCQ radio, descriptive textarea, or file upload)
  // - Submit button
  // - Warning before leaving page
};
```

**Responsibilities**:
- Display exam questions with timer
- Handle real-time timer updates via WebSocket
- Auto-save answers as student progresses
- Support different question types (MCQ, descriptive)
- Handle PDF download and answer sheet upload
- Implement auto-submission on timeout
- Prevent accidental page navigation during exam



### Component 13: GradingInterface Component (Frontend - University)

**Purpose**: React component for university to grade submissions and provide feedback

**Interface**:
```javascript
const GradingInterface = ({ examId }) => {
  // State
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({});
  
  // Fetch submissions
  const fetchSubmissions = async () => {
    // GET /api/submissions/exam/:examId
    // Filters by status=submitted
  };
  
  // Auto-grade MCQ
  const autoGradeExam = async () => {
    // POST /api/exams/:examId/auto-grade
    // Grades all MCQ questions automatically
    // Updates submission list
  };
  
  // Manual grading
  const handleGradeAnswer = (questionId, marks, feedback) => {
    // Updates local grading data
    setGradingData(prev => ({
      ...prev,
      [questionId]: { marks, feedback }
    }));
  };
  
  const submitGrading = async (submissionId) => {
    // POST /api/submissions/:submissionId/grade
    // Submits all grading data
    // Generates result
  };
  
  // View answer sheet (for PDF-based)
  const viewAnswerSheet = (url) => {
    // Opens answer sheet in new tab
  };
  
  // Render:
  // - Submissions list with student names
  // - Auto-grade button (for MCQ exams)
  // - Selected submission details
  // - Questions with student answers
  // - Marks input for each question
  // - Feedback textarea
  // - Answer sheet viewer (for PDF)
  // - Submit grading button
  // - Overall feedback input
};
```

**Responsibilities**:
- Display list of submissions for grading
- Support auto-grading for MCQ questions
- Provide interface for manual grading
- Show student answers alongside questions
- Allow feedback input per question
- Handle answer sheet viewing for PDF exams
- Submit grading and generate results



### Component 14: ResultsViewer Component (Frontend - Student/University)

**Purpose**: React component to display exam results with detailed breakdown

**Interface**:
```javascript
const ResultsViewer = ({ examId, studentId, role }) => {
  // State
  const [result, setResult] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  
  // Fetch result
  const fetchResult = async () => {
    if (role === 'student') {
      // GET /api/results/exam/:examId/my-result
    } else {
      // GET /api/results/exam/:examId/student/:studentId
    }
  };
  
  // Mark as viewed (for students)
  const markAsViewed = async () => {
    // PATCH /api/results/:resultId/viewed
  };
  
  // Toggle answer visibility
  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };
  
  // Render:
  // - Result summary card
  //   - Obtained marks / Total marks
  //   - Percentage
  //   - Grade
  //   - Pass/Fail status
  //   - Rank (if available)
  // - Overall feedback
  // - Toggle to show detailed answers
  // - Question-wise breakdown (if toggled)
  //   - Question text
  //   - Student answer
  //   - Correct answer (for MCQ)
  //   - Marks awarded
  //   - Feedback
  // - Download result button
};
```

**Responsibilities**:
- Display result summary with scores and grade
- Show overall feedback from grader
- Provide detailed question-wise breakdown
- Display correct answers for learning
- Track when student views result
- Support result download/print



## Data Models

### Exam Model

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  university: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  examType: 'pdf-based' | 'online-mcq' | 'online-descriptive' | 'mixed',
  isMockExam: Boolean,
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  duration: Number,
  questionPaperUrl: String,
  allowLateSubmission: Boolean,
  lateSubmissionDeadline: Date,
  status: 'scheduled' | 'ongoing' | 'completed' | 'graded' | 'published',
  resultsPublished: Boolean,
  publishedAt: Date,
  shuffleQuestions: Boolean,
  showResultsImmediately: Boolean,
  passingScore: Number,
  totalMarks: Number,
  instructions: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules**:
- `scheduledEndTime` must be after `scheduledStartTime`
- `duration` must be positive and less than time window
- `examType` must be one of the allowed values
- `questionPaperUrl` required if `examType` is 'pdf-based'
- `passingScore` must be between 0 and 100
- `university` must reference a user with role 'university'



### Question Model

```javascript
{
  _id: ObjectId,
  exam: ObjectId (ref: Exam),
  questionType: 'mcq' | 'descriptive',
  questionText: String,
  questionImage: String,
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  marks: Number,
  negativeMarks: Number,
  order: Number,
  difficulty: 'easy' | 'medium' | 'hard',
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules**:
- For MCQ: `options` array must have at least 2 items
- For MCQ: Exactly one option must have `isCorrect: true`
- `marks` must be positive
- `negativeMarks` must be non-negative and less than `marks`
- `order` must be unique within the exam
- `questionText` cannot be empty



### Submission Model

```javascript
{
  _id: ObjectId,
  exam: ObjectId (ref: Exam),
  student: ObjectId (ref: User),
  startedAt: Date,
  submittedAt: Date,
  timeSpent: Number,
  isAutoSubmitted: Boolean,
  answers: [{
    question: ObjectId (ref: Question),
    questionType: 'mcq' | 'descriptive',
    selectedOption: Number,
    textAnswer: String,
    marksAwarded: Number,
    isCorrect: Boolean,
    feedback: String
  }],
  answerSheetUrl: String,
  status: 'in-progress' | 'submitted' | 'graded',
  totalMarks: Number,
  obtainedMarks: Number,
  percentage: Number,
  gradedBy: ObjectId (ref: User),
  gradedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules**:
- Unique compound index on `(exam, student)`
- `submittedAt` must be after `startedAt`
- `timeSpent` calculated as difference between `submittedAt` and `startedAt`
- For MCQ answers: `selectedOption` must be valid index
- For descriptive answers: `textAnswer` required
- `percentage` calculated as `(obtainedMarks / totalMarks) * 100`
- `status` transitions: in-progress → submitted → graded



### Result Model

```javascript
{
  _id: ObjectId,
  exam: ObjectId (ref: Exam),
  student: ObjectId (ref: User),
  submission: ObjectId (ref: Submission),
  totalMarks: Number,
  obtainedMarks: Number,
  percentage: Number,
  grade: String,
  isPassed: Boolean,
  rank: Number,
  isPublished: Boolean,
  publishedAt: Date,
  overallFeedback: String,
  generatedBy: ObjectId (ref: User),
  viewedByStudent: Boolean,
  viewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules**:
- Unique compound index on `(exam, student)`
- `isPassed` determined by comparing `percentage` with `exam.passingScore`
- `grade` calculated based on percentage ranges (configurable)
- `rank` calculated by sorting all results by `obtainedMarks` descending
- Students can only view if `isPublished: true`
- `publishedAt` set when `isPublished` changes to true



## Algorithmic Pseudocode

### Main Exam Access Control Algorithm

```javascript
/**
 * Determines if a student can access an exam
 * 
 * @preconditions:
 * - student is authenticated and has valid session
 * - examId references an existing exam
 * - student is enrolled in the exam's course
 * 
 * @postconditions:
 * - Returns access decision with reason
 * - If granted, includes time remaining and exam details
 * - No side effects on database state
 * 
 * @param {ObjectId} examId - The exam to check access for
 * @param {ObjectId} studentId - The student requesting access
 * @returns {Object} { canAccess: boolean, reason: string, timeRemaining?: number, exam?: Object }
 */
async function checkExamAccess(examId, studentId) {
  // Step 1: Fetch exam with course enrollment check
  const exam = await Exam.findById(examId).populate('course');
  if (!exam) {
    return { canAccess: false, reason: 'Exam not found' };
  }
  
  // Step 2: Verify student enrollment in course
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: exam.course._id
  });
  
  if (!enrollment) {
    return { canAccess: false, reason: 'Not enrolled in course' };
  }
  
  // Step 3: Check exam status
  if (exam.status === 'completed' || exam.status === 'graded') {
    return { canAccess: false, reason: 'Exam has ended' };
  }
  
  // Step 4: Check time window
  const now = new Date();
  const startTime = new Date(exam.scheduledStartTime);
  const endTime = new Date(exam.scheduledEndTime);
  
  if (now < startTime) {
    const minutesUntilStart = Math.floor((startTime - now) / 60000);
    return { 
      canAccess: false, 
      reason: `Exam starts in ${minutesUntilStart} minutes`,
      startsAt: startTime
    };
  }
  
  if (now > endTime && !exam.allowLateSubmission) {
    return { canAccess: false, reason: 'Exam time has expired' };
  }
  
  if (now > endTime && exam.allowLateSubmission) {
    const lateDeadline = new Date(exam.lateSubmissionDeadline);
    if (now > lateDeadline) {
      return { canAccess: false, reason: 'Late submission deadline passed' };
    }
  }
  
  // Step 5: Check for existing submission
  const existingSubmission = await Submission.findOne({
    exam: examId,
    student: studentId,
    status: { $in: ['submitted', 'graded'] }
  });
  
  if (existingSubmission) {
    return { canAccess: false, reason: 'Already submitted' };
  }
  
  // Step 6: Calculate time remaining
  const effectiveEndTime = exam.allowLateSubmission 
    ? new Date(exam.lateSubmissionDeadline)
    : endTime;
  const timeRemaining = Math.floor((effectiveEndTime - now) / 1000); // in seconds
  
  // Access granted
  return {
    canAccess: true,
    reason: 'Access granted',
    timeRemaining,
    exam
  };
}
```

**Loop Invariants**: N/A (no loops in main logic)



### Auto-Grading Algorithm for MCQ Questions

```javascript
/**
 * Automatically grades MCQ questions in a submission
 * 
 * @preconditions:
 * - submission exists and has status 'submitted'
 * - submission.answers array contains MCQ answers
 * - Each answer references a valid question
 * - Questions have correct answers marked
 * 
 * @postconditions:
 * - All MCQ answers have marksAwarded and isCorrect set
 * - submission.obtainedMarks updated with total
 * - submission.percentage calculated
 * - submission.status changed to 'graded' if all questions are MCQ
 * - Returns grading summary
 * 
 * @param {ObjectId} submissionId - The submission to grade
 * @returns {Object} { gradedCount: number, totalMarks: number, obtainedMarks: number }
 */
async function autoGradeMCQSubmission(submissionId) {
  // Step 1: Fetch submission with answers
  const submission = await Submission.findById(submissionId)
    .populate('exam')
    .populate('answers.question');
  
  if (!submission || submission.status !== 'submitted') {
    throw new Error('Invalid submission for grading');
  }
  
  let obtainedMarks = 0;
  let gradedCount = 0;
  const totalMarks = submission.exam.totalMarks;
  
  // Step 2: Iterate through answers and grade MCQ questions
  // Loop invariant: obtainedMarks is sum of all graded answers so far
  for (let i = 0; i < submission.answers.length; i++) {
    const answer = submission.answers[i];
    const question = answer.question;
    
    // Skip non-MCQ questions
    if (question.questionType !== 'mcq') {
      continue;
    }
    
    // Step 3: Check if selected option is correct
    const selectedOption = question.options[answer.selectedOption];
    const isCorrect = selectedOption && selectedOption.isCorrect;
    
    // Step 4: Award marks or apply negative marking
    if (isCorrect) {
      answer.marksAwarded = question.marks;
      obtainedMarks += question.marks;
    } else {
      answer.marksAwarded = -question.negativeMarks;
      obtainedMarks -= question.negativeMarks;
    }
    
    answer.isCorrect = isCorrect;
    gradedCount++;
    
    // Maintain invariant: obtainedMarks = sum of all marksAwarded
  }
  
  // Step 5: Update submission with graded results
  submission.obtainedMarks = Math.max(0, obtainedMarks); // Ensure non-negative
  submission.percentage = (submission.obtainedMarks / totalMarks) * 100;
  
  // Check if all questions are MCQ (fully auto-gradable)
  const allMCQ = submission.answers.every(a => a.question.questionType === 'mcq');
  if (allMCQ) {
    submission.status = 'graded';
    submission.gradedAt = new Date();
  }
  
  await submission.save();
  
  return {
    gradedCount,
    totalMarks,
    obtainedMarks: submission.obtainedMarks,
    percentage: submission.percentage,
    fullyGraded: allMCQ
  };
}
```

**Loop Invariants**:
- `obtainedMarks` equals the sum of `marksAwarded` for all processed answers
- `gradedCount` equals the number of MCQ questions processed
- All processed answers have `isCorrect` and `marksAwarded` set



### Result Generation and Ranking Algorithm

```javascript
/**
 * Generates results for all graded submissions and calculates rankings
 * 
 * @preconditions:
 * - exam exists and has graded submissions
 * - All submissions have obtainedMarks calculated
 * - exam.passingScore is defined
 * 
 * @postconditions:
 * - Result created for each graded submission
 * - Rankings assigned based on obtainedMarks (descending)
 * - Grades assigned based on percentage ranges
 * - isPassed determined by comparing with passingScore
 * - Returns array of generated results
 * 
 * @param {ObjectId} examId - The exam to generate results for
 * @returns {Array<Result>} Array of generated result objects
 */
async function generateExamResults(examId) {
  // Step 1: Fetch exam and all graded submissions
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }
  
  const submissions = await Submission.find({
    exam: examId,
    status: 'graded'
  }).populate('student').sort({ obtainedMarks: -1 });
  
  if (submissions.length === 0) {
    return [];
  }
  
  const results = [];
  
  // Step 2: Calculate rankings
  // Loop invariant: All processed submissions have been assigned correct rank
  let currentRank = 1;
  let previousMarks = null;
  let studentsWithSameMarks = 0;
  
  for (let i = 0; i < submissions.length; i++) {
    const submission = submissions[i];
    
    // Handle tied ranks
    if (previousMarks !== null && submission.obtainedMarks === previousMarks) {
      studentsWithSameMarks++;
    } else {
      currentRank += studentsWithSameMarks;
      studentsWithSameMarks = 1;
    }
    
    // Step 3: Calculate grade based on percentage
    const grade = calculateGrade(submission.percentage);
    
    // Step 4: Determine pass/fail
    const isPassed = submission.percentage >= exam.passingScore;
    
    // Step 5: Create or update result
    const result = await Result.findOneAndUpdate(
      { exam: examId, student: submission.student._id },
      {
        submission: submission._id,
        totalMarks: exam.totalMarks,
        obtainedMarks: submission.obtainedMarks,
        percentage: submission.percentage,
        grade,
        isPassed,
        rank: currentRank,
        generatedBy: submission.gradedBy,
        isPublished: false
      },
      { upsert: true, new: true }
    );
    
    results.push(result);
    previousMarks = submission.obtainedMarks;
    
    // Maintain invariant: rank correctly assigned based on marks
  }
  
  return results;
}

/**
 * Calculates letter grade based on percentage
 * 
 * @preconditions:
 * - percentage is a number between 0 and 100
 * 
 * @postconditions:
 * - Returns valid grade string
 * 
 * @param {Number} percentage - Score percentage
 * @returns {String} Letter grade (A+, A, B+, B, C, D, F)
 */
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
```

**Loop Invariants**:
- All submissions processed so far have correct rank assigned
- `currentRank` reflects the rank for the current group of tied students
- `studentsWithSameMarks` counts students with identical marks in current group
- Rankings are in descending order of `obtainedMarks`



### Real-Time Timer and Auto-Submission Algorithm

```javascript
/**
 * Manages real-time exam timer with WebSocket broadcasts and auto-submission
 * 
 * @preconditions:
 * - WebSocket server is running and accepting connections
 * - exam exists and has valid scheduledEndTime
 * - Students are connected to exam room via WebSocket
 * 
 * @postconditions:
 * - Timer updates broadcast every minute
 * - Auto-submission triggered when time expires
 * - All in-progress submissions are submitted
 * - Students receive real-time notifications
 * 
 * @param {ObjectId} examId - The exam to manage timer for
 * @param {SocketIO} io - WebSocket server instance
 */
async function startExamTimer(examId, io) {
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new Error('Exam not found');
  }
  
  const endTime = new Date(exam.scheduledEndTime);
  
  // Step 1: Set up interval for timer broadcasts
  // Loop invariant: Timer broadcasts sent every minute until exam ends
  const timerInterval = setInterval(async () => {
    const now = new Date();
    const timeRemaining = Math.floor((endTime - now) / 1000); // seconds
    
    if (timeRemaining <= 0) {
      // Step 2: Time expired - trigger auto-submission
      clearInterval(timerInterval);
      await handleExamTimeout(examId, io);
      return;
    }
    
    // Step 3: Broadcast time remaining to all students in exam room
    io.to(`exam-${examId}`).emit('time-remaining', {
      examId,
      timeRemaining,
      timestamp: now
    });
    
    // Step 4: Send warnings at specific intervals
    if (timeRemaining === 300) { // 5 minutes
      io.to(`exam-${examId}`).emit('time-warning', {
        message: '5 minutes remaining',
        timeRemaining: 300
      });
    } else if (timeRemaining === 60) { // 1 minute
      io.to(`exam-${examId}`).emit('time-warning', {
        message: '1 minute remaining',
        timeRemaining: 60
      });
    }
    
    // Maintain invariant: broadcasts continue until timeRemaining <= 0
  }, 60000); // Every minute
  
  // Store interval ID for cleanup
  activeTimers.set(examId.toString(), timerInterval);
}

/**
 * Handles exam timeout by auto-submitting all in-progress submissions
 * 
 * @preconditions:
 * - exam time has expired
 * - Some submissions may still be in-progress
 * 
 * @postconditions:
 * - All in-progress submissions are submitted
 * - isAutoSubmitted flag set to true
 * - Students notified of auto-submission
 * - Exam status updated to 'completed'
 * 
 * @param {ObjectId} examId - The exam that timed out
 * @param {SocketIO} io - WebSocket server instance
 */
async function handleExamTimeout(examId, io) {
  // Step 1: Find all in-progress submissions
  const inProgressSubmissions = await Submission.find({
    exam: examId,
    status: 'in-progress'
  });
  
  // Step 2: Auto-submit each in-progress submission
  // Loop invariant: All processed submissions have status 'submitted'
  for (let i = 0; i < inProgressSubmissions.length; i++) {
    const submission = inProgressSubmissions[i];
    
    submission.submittedAt = new Date();
    submission.timeSpent = Math.floor(
      (submission.submittedAt - submission.startedAt) / 1000
    );
    submission.isAutoSubmitted = true;
    submission.status = 'submitted';
    
    await submission.save();
    
    // Step 3: Notify specific student of auto-submission
    io.to(`student-${submission.student}`).emit('auto-submit', {
      examId,
      submissionId: submission._id,
      message: 'Exam time expired. Your answers have been submitted automatically.'
    });
    
    // Maintain invariant: all processed submissions are submitted
  }
  
  // Step 4: Update exam status
  await Exam.findByIdAndUpdate(examId, {
    status: 'completed'
  });
  
  // Step 5: Broadcast exam completion to all students
  io.to(`exam-${examId}`).emit('exam-completed', {
    examId,
    message: 'Exam has ended',
    autoSubmittedCount: inProgressSubmissions.length
  });
  
  // Step 6: Clean up timer
  const timerInterval = activeTimers.get(examId.toString());
  if (timerInterval) {
    clearInterval(timerInterval);
    activeTimers.delete(examId.toString());
  }
}
```

**Loop Invariants**:
- Timer interval: Broadcasts continue every minute until `timeRemaining <= 0`
- Auto-submission loop: All processed submissions have `status: 'submitted'` and `isAutoSubmitted: true`
- All students with in-progress submissions receive auto-submit notification



## Key Functions with Formal Specifications

### Function 1: scheduleExam()

```javascript
async function scheduleExam(examData, adminId) {
  // Creates a new exam with validation
}
```

**Preconditions:**
- `adminId` references a user with role 'admin'
- `examData.course` references an existing course
- `examData.university` references a user with role 'university'
- `examData.scheduledStartTime` is a future date
- `examData.scheduledEndTime` is after `scheduledStartTime`
- `examData.duration` is positive and fits within time window

**Postconditions:**
- New exam document created in database
- Exam status set to 'scheduled'
- Notifications sent to enrolled students
- Returns created exam object
- No modifications to existing exams

**Loop Invariants:** N/A



### Function 2: submitExam()

```javascript
async function submitExam(submissionId, studentId, isAutoSubmit = false) {
  // Finalizes exam submission
}
```

**Preconditions:**
- `submissionId` references an existing submission
- `submission.student` equals `studentId`
- `submission.status` is 'in-progress'
- If not auto-submit, current time is within exam window or late submission allowed

**Postconditions:**
- `submission.status` changed to 'submitted'
- `submission.submittedAt` set to current timestamp
- `submission.timeSpent` calculated
- `submission.isAutoSubmitted` set to `isAutoSubmit` value
- MCQ questions auto-graded if exam is online-mcq type
- Confirmation notification sent to student
- Returns updated submission object

**Loop Invariants:** N/A



### Function 3: gradeSubmission()

```javascript
async function gradeSubmission(submissionId, gradingData, graderId) {
  // Manually grades a submission with feedback
}
```

**Preconditions:**
- `submissionId` references an existing submission
- `submission.status` is 'submitted'
- `graderId` references a user with role 'university' or 'admin'
- `gradingData.answers` contains marks for all questions
- All marks are within valid range (0 to question.marks)

**Postconditions:**
- All answers have `marksAwarded` and `feedback` updated
- `submission.obtainedMarks` calculated as sum of all `marksAwarded`
- `submission.percentage` calculated
- `submission.status` changed to 'graded'
- `submission.gradedBy` set to `graderId`
- `submission.gradedAt` set to current timestamp
- Result document created or updated
- Returns graded submission and result

**Loop Invariants:**
- For grading loop: `obtainedMarks` equals sum of `marksAwarded` for all processed answers



### Function 4: publishResults()

```javascript
async function publishResults(examId, publisherId) {
  // Publishes exam results to students
}
```

**Preconditions:**
- `examId` references an existing exam
- `publisherId` references a user with role 'university' or 'admin'
- All submissions for exam have status 'graded'
- Results have been generated for all submissions

**Postconditions:**
- All results for exam have `isPublished` set to true
- All results have `publishedAt` set to current timestamp
- Exam has `resultsPublished` set to true
- Exam has `publishedAt` set to current timestamp
- Exam status changed to 'published'
- Notification sent to all students with results
- Returns count of published results

**Loop Invariants:**
- For notification loop: All processed students have received notification



### Function 5: uploadQuestionPaper()

```javascript
async function uploadQuestionPaper(file, examId, uploaderId) {
  // Uploads PDF question paper for exam
}
```

**Preconditions:**
- `examId` references an existing exam
- `exam.examType` is 'pdf-based' or 'mixed'
- `uploaderId` references a user with role 'university' or 'admin'
- `file` is a valid PDF file
- `file.size` is less than 10MB

**Postconditions:**
- File uploaded to storage service
- `exam.questionPaperUrl` updated with file URL
- Returns file URL and metadata
- Old question paper deleted if exists

**Loop Invariants:** N/A



## Example Usage

### Example 1: Admin Schedules an Exam

```javascript
// Admin creates a new exam
const examData = {
  title: "Midterm Examination - Data Structures",
  description: "Covers topics: Arrays, Linked Lists, Trees, Graphs",
  course: "507f1f77bcf86cd799439011",
  university: "507f1f77bcf86cd799439012",
  examType: "online-mcq",
  scheduledStartTime: new Date("2024-02-15T10:00:00Z"),
  scheduledEndTime: new Date("2024-02-15T12:00:00Z"),
  duration: 120,
  totalMarks: 100,
  passingScore: 40,
  isMockExam: false,
  instructions: "Answer all questions. No negative marking."
};

const exam = await scheduleExam(examData, adminId);
console.log(`Exam scheduled: ${exam.title}`);
// Notifications automatically sent to enrolled students
```



### Example 2: University Creates Online Questions

```javascript
// University adds MCQ questions to exam
const questions = [
  {
    questionText: "What is the time complexity of binary search?",
    questionType: "mcq",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true },
      { text: "O(n^2)", isCorrect: false },
      { text: "O(1)", isCorrect: false }
    ],
    marks: 2,
    negativeMarks: 0.5,
    order: 1,
    difficulty: "easy"
  },
  {
    questionText: "Explain the difference between stack and queue.",
    questionType: "descriptive",
    marks: 5,
    order: 2,
    difficulty: "medium"
  }
];

const createdQuestions = await createOnlineQuestions(examId, questions, universityId);
console.log(`${createdQuestions.length} questions added to exam`);
```



### Example 3: Student Takes Exam with Real-Time Timer

```javascript
// Student checks access
const access = await checkExamAccess(examId, studentId);
if (!access.canAccess) {
  console.log(`Cannot access: ${access.reason}`);
  return;
}

// Student starts exam
const { submission, questions } = await startExam(examId, studentId);

// Connect to WebSocket for real-time timer
const socket = io();
socket.emit('join-exam', { examId, studentId });

socket.on('time-remaining', (data) => {
  console.log(`Time remaining: ${Math.floor(data.timeRemaining / 60)} minutes`);
});

socket.on('time-warning', (data) => {
  alert(data.message);
});

socket.on('auto-submit', async (data) => {
  console.log('Time expired! Auto-submitting...');
  // Submission handled automatically by server
});

// Student answers questions
await submitAnswer(submission._id, questions[0]._id, { selectedOption: 1 });
await submitAnswer(submission._id, questions[1]._id, { 
  textAnswer: "Stack follows LIFO principle while queue follows FIFO..." 
});

// Student manually submits before time expires
await submitExam(submission._id, studentId);
console.log('Exam submitted successfully');
```



### Example 4: University Grades Submissions

```javascript
// Auto-grade MCQ questions
const autoGradeResult = await autoGradeExam(examId);
console.log(`Auto-graded ${autoGradeResult.gradedCount} MCQ questions`);

// Manually grade descriptive questions
const submissions = await getSubmissionsForExam(examId);

for (const submission of submissions) {
  const gradingData = {
    answers: submission.answers.map(answer => {
      if (answer.questionType === 'descriptive') {
        return {
          questionId: answer.question._id,
          marksAwarded: 4, // Out of 5
          feedback: "Good explanation, but could include more examples"
        };
      }
      return answer; // MCQ already graded
    }),
    overallFeedback: "Well done overall. Focus on providing more detailed examples."
  };
  
  await gradeSubmission(submission._id, gradingData, universityId);
}

// Generate results with rankings
const results = await generateExamResults(examId);
console.log(`Generated ${results.length} results`);

// Publish results to students
await publishResults(examId, universityId);
console.log('Results published to students');
```



### Example 5: Student Views Published Results

```javascript
// Student checks for published results
const result = await getStudentResult(examId, studentId);

if (!result.isPublished) {
  console.log('Results not yet published');
  return;
}

console.log(`
  Exam: ${result.exam.title}
  Score: ${result.obtainedMarks}/${result.totalMarks}
  Percentage: ${result.percentage}%
  Grade: ${result.grade}
  Status: ${result.isPassed ? 'PASSED' : 'FAILED'}
  Rank: ${result.rank}
  
  Overall Feedback: ${result.overallFeedback}
`);

// View detailed answers
const submission = await getMySubmission(examId, studentId);
submission.answers.forEach((answer, index) => {
  console.log(`
    Question ${index + 1}: ${answer.question.questionText}
    Your Answer: ${answer.selectedOption || answer.textAnswer}
    Marks: ${answer.marksAwarded}/${answer.question.marks}
    Feedback: ${answer.feedback || 'N/A'}
  `);
});

// Mark result as viewed
await markResultAsViewed(result._id, studentId);
```



## Correctness Properties

### Property 1: Exam Access Control
```javascript
// Universal quantification: For all students and exams
∀ student, exam: 
  canAccessExam(student, exam) ⟹ 
    (isEnrolled(student, exam.course) ∧ 
     currentTime ≥ exam.scheduledStartTime ∧
     (currentTime ≤ exam.scheduledEndTime ∨ exam.allowLateSubmission) ∧
     ¬hasSubmitted(student, exam))
```

### Property 2: Submission Uniqueness
```javascript
// Each student can have at most one submission per exam
∀ exam, student:
  count(Submission.find({ exam, student })) ≤ 1
```

### Property 3: Auto-Grading Correctness
```javascript
// MCQ auto-grading produces correct marks
∀ submission with MCQ answers:
  submission.obtainedMarks = 
    Σ(answer.marksAwarded for each answer where answer.isCorrect) -
    Σ(question.negativeMarks for each answer where !answer.isCorrect)
```

### Property 4: Result Visibility
```javascript
// Students can only view published results
∀ student, result:
  student.canView(result) ⟹ 
    (result.isPublished ∧ result.student = student) ∨
    (student.role ∈ ['admin', 'university'])
```

### Property 5: Ranking Consistency
```javascript
// Rankings are consistent with scores
∀ result1, result2 in same exam:
  result1.obtainedMarks > result2.obtainedMarks ⟹ 
    result1.rank < result2.rank
    
  result1.obtainedMarks = result2.obtainedMarks ⟹ 
    result1.rank = result2.rank
```

### Property 6: Time-Based Auto-Submission
```javascript
// All in-progress submissions are auto-submitted when exam ends
∀ exam where currentTime > exam.scheduledEndTime:
  ∀ submission where submission.exam = exam:
    submission.status ≠ 'in-progress'
```

### Property 7: Grading Completeness
```javascript
// Graded submissions have marks for all questions
∀ submission where submission.status = 'graded':
  ∀ question in submission.exam.questions:
    ∃ answer in submission.answers where 
      answer.question = question ∧ 
      answer.marksAwarded is defined
```

### Property 8: Status Transition Validity
```javascript
// Exam status follows valid state machine
∀ exam:
  validTransitions = {
    'scheduled' → ['ongoing', 'cancelled'],
    'ongoing' → ['completed'],
    'completed' → ['graded'],
    'graded' → ['published']
  }
  
  exam.statusHistory[i+1] ∈ validTransitions[exam.statusHistory[i]]
```



## Error Handling

### Error Scenario 1: Student Attempts to Access Exam Before Start Time

**Condition**: Student tries to access exam when `currentTime < exam.scheduledStartTime`

**Response**: 
- Return 403 Forbidden status
- Error message: "Exam has not started yet. Starts at [scheduledStartTime]"
- Include time remaining until exam starts

**Recovery**: 
- Student waits until scheduled start time
- System sends notification when exam becomes available

### Error Scenario 2: Exam Time Expires During Submission

**Condition**: Student is taking exam when `currentTime > exam.scheduledEndTime`

**Response**:
- WebSocket emits 'auto-submit' event to student
- Server automatically submits current answers
- Set `isAutoSubmitted: true` on submission
- Display notification: "Time expired. Your answers have been submitted automatically."

**Recovery**:
- Submission is saved with all answered questions
- Student redirected to confirmation page
- No data loss occurs

### Error Scenario 3: File Upload Fails (Question Paper or Answer Sheet)

**Condition**: File upload to storage service fails due to network error or service unavailability

**Response**:
- Catch upload error and log details
- Return 500 Internal Server Error
- Error message: "File upload failed. Please try again."
- Rollback any partial database changes

**Recovery**:
- User retries upload
- System validates file before retry
- If persistent failure, admin notified for manual intervention

### Error Scenario 4: Duplicate Submission Attempt

**Condition**: Student tries to start exam when they already have a submitted submission

**Response**:
- Check for existing submission before creating new one
- Return 409 Conflict status
- Error message: "You have already submitted this exam"
- Provide link to view submission status

**Recovery**:
- Student redirected to results page if published
- Student shown submission confirmation if results not published

### Error Scenario 5: Grading Data Validation Failure

**Condition**: University submits grading with marks exceeding question's maximum marks

**Response**:
- Validate all marks before saving
- Return 400 Bad Request
- Error message: "Invalid marks for question [X]: [awarded] exceeds maximum [max]"
- Highlight specific validation errors

**Recovery**:
- University corrects invalid marks
- Resubmits grading data
- System validates again before saving

### Error Scenario 6: WebSocket Connection Lost During Exam

**Condition**: Student's WebSocket connection drops during active exam

**Response**:
- Client detects disconnection
- Attempt automatic reconnection with exponential backoff
- Show warning banner: "Connection lost. Reconnecting..."
- Continue saving answers via HTTP API as fallback

**Recovery**:
- Reconnect to WebSocket when network restored
- Rejoin exam room
- Sync timer from server
- Remove warning banner when connected

### Error Scenario 7: Result Publication with Ungraded Submissions

**Condition**: Admin/University attempts to publish results when some submissions are not graded

**Response**:
- Check all submissions have status 'graded' before publishing
- Return 400 Bad Request
- Error message: "Cannot publish results. [X] submissions are not yet graded."
- List ungraded submissions

**Recovery**:
- University completes grading for remaining submissions
- Retries result publication
- System verifies all graded before publishing



## Testing Strategy

### Unit Testing Approach

**Test Coverage Goals**: 80% code coverage for all backend services

**Key Test Cases**:

1. **Exam Model Tests**
   - Validate exam creation with all required fields
   - Test time window validation (end time after start time)
   - Test status transitions (scheduled → ongoing → completed → graded → published)
   - Test exam type validation

2. **Question Model Tests**
   - Validate MCQ questions have at least 2 options
   - Ensure exactly one correct answer for MCQ
   - Test marks and negative marks validation
   - Test question ordering uniqueness

3. **Submission Model Tests**
   - Test unique compound index (exam + student)
   - Validate answer structure for MCQ vs descriptive
   - Test time spent calculation
   - Test percentage calculation

4. **Access Control Tests**
   - Test `checkExamAccess()` with various time scenarios
   - Test enrollment verification
   - Test duplicate submission prevention
   - Test late submission logic

5. **Auto-Grading Tests**
   - Test MCQ grading with correct answers
   - Test negative marking application
   - Test mixed exam grading (MCQ + descriptive)
   - Test marks calculation accuracy

6. **Result Generation Tests**
   - Test ranking calculation with tied scores
   - Test grade assignment based on percentage
   - Test pass/fail determination
   - Test result uniqueness per student-exam



### Property-Based Testing Approach

**Property Test Library**: fast-check (for JavaScript/Node.js)

**Property Tests**:

1. **Exam Access Control Property**
```javascript
// Property: Access granted only when all conditions met
fc.assert(
  fc.property(
    fc.record({
      currentTime: fc.date(),
      startTime: fc.date(),
      endTime: fc.date(),
      isEnrolled: fc.boolean(),
      hasSubmitted: fc.boolean()
    }),
    (data) => {
      const canAccess = checkExamAccess(data);
      const shouldAccess = 
        data.isEnrolled &&
        data.currentTime >= data.startTime &&
        data.currentTime <= data.endTime &&
        !data.hasSubmitted;
      
      return canAccess === shouldAccess;
    }
  )
);
```

2. **Auto-Grading Correctness Property**
```javascript
// Property: Total marks equals sum of individual marks
fc.assert(
  fc.property(
    fc.array(fc.record({
      marks: fc.integer({ min: 1, max: 10 }),
      isCorrect: fc.boolean(),
      negativeMarks: fc.integer({ min: 0, max: 2 })
    })),
    (answers) => {
      const result = autoGradeAnswers(answers);
      const expected = answers.reduce((sum, ans) => 
        sum + (ans.isCorrect ? ans.marks : -ans.negativeMarks), 0
      );
      
      return result.obtainedMarks === Math.max(0, expected);
    }
  )
);
```

3. **Ranking Consistency Property**
```javascript
// Property: Higher marks always result in better or equal rank
fc.assert(
  fc.property(
    fc.array(fc.record({
      studentId: fc.string(),
      obtainedMarks: fc.integer({ min: 0, max: 100 })
    }), { minLength: 2 }),
    (submissions) => {
      const results = calculateRankings(submissions);
      
      for (let i = 0; i < results.length - 1; i++) {
        for (let j = i + 1; j < results.length; j++) {
          if (results[i].obtainedMarks > results[j].obtainedMarks) {
            if (results[i].rank >= results[j].rank) return false;
          }
          if (results[i].obtainedMarks === results[j].obtainedMarks) {
            if (results[i].rank !== results[j].rank) return false;
          }
        }
      }
      
      return true;
    }
  )
);
```

4. **Time Calculation Property**
```javascript
// Property: Time spent equals difference between submit and start times
fc.assert(
  fc.property(
    fc.record({
      startedAt: fc.date(),
      submittedAt: fc.date()
    }).filter(d => d.submittedAt >= d.startedAt),
    (data) => {
      const timeSpent = calculateTimeSpent(data.startedAt, data.submittedAt);
      const expected = Math.floor((data.submittedAt - data.startedAt) / 1000);
      
      return timeSpent === expected;
    }
  )
);
```



### Integration Testing Approach

**Integration Test Scenarios**:

1. **End-to-End Exam Flow**
   - Admin schedules exam
   - University creates questions
   - Student receives notification
   - Student takes exam with timer
   - Auto-submission on timeout
   - University grades submission
   - Results published
   - Student views results

2. **WebSocket Integration**
   - Multiple students connect to same exam
   - Timer broadcasts received by all
   - Auto-submit triggered for all at timeout
   - Connection recovery after disconnect

3. **File Upload Integration**
   - Question paper upload to storage
   - Answer sheet upload during exam
   - File retrieval with secure URLs
   - File deletion on exam deletion

4. **Notification Integration**
   - Email notifications sent on exam schedule
   - In-app notifications created
   - Reminder notifications before exam
   - Result publication notifications

5. **Database Transaction Tests**
   - Concurrent submission attempts (test uniqueness)
   - Concurrent grading operations
   - Result generation with multiple submissions
   - Rollback on validation failures



## Performance Considerations

### Database Indexing Strategy

**Required Indexes**:
```javascript
// Exam collection
Exam.index({ course: 1, scheduledStartTime: 1 });
Exam.index({ university: 1, status: 1 });
Exam.index({ status: 1, scheduledEndTime: 1 });

// Question collection
Question.index({ exam: 1, order: 1 });

// Submission collection
Submission.index({ exam: 1, student: 1 }, { unique: true });
Submission.index({ exam: 1, status: 1 });
Submission.index({ student: 1, createdAt: -1 });

// Result collection
Result.index({ exam: 1, student: 1 }, { unique: true });
Result.index({ exam: 1, rank: 1 });
Result.index({ student: 1, isPublished: 1 });
```

**Rationale**: These indexes optimize common queries for exam listing, submission retrieval, and result ranking.

### Caching Strategy

**Cache Targets**:
- Exam details (TTL: 5 minutes, invalidate on update)
- Question lists for exams (TTL: until exam starts)
- Course enrollment lists (TTL: 10 minutes)
- Published results (TTL: 1 hour)

**Implementation**: Use Redis for caching with automatic invalidation on updates.

### Query Optimization

**Pagination**: All list endpoints support pagination with default limit of 20 items
```javascript
GET /api/exams?page=1&limit=20
```

**Selective Population**: Only populate necessary references
```javascript
// Instead of populating entire course
Submission.find().populate('exam', 'title duration totalMarks');
```

**Aggregation for Statistics**: Use MongoDB aggregation for result statistics
```javascript
// Calculate average, min, max scores efficiently
Submission.aggregate([
  { $match: { exam: examId, status: 'graded' } },
  { $group: {
    _id: '$exam',
    avgScore: { $avg: '$obtainedMarks' },
    maxScore: { $max: '$obtainedMarks' },
    minScore: { $min: '$obtainedMarks' }
  }}
]);
```

### WebSocket Scalability

**Connection Management**:
- Use Socket.IO with Redis adapter for horizontal scaling
- Limit connections per exam room
- Implement connection pooling
- Clean up disconnected sockets promptly

**Broadcast Optimization**:
- Batch timer updates (every minute instead of every second)
- Use room-based broadcasting to avoid unnecessary messages
- Compress large payloads

### File Upload Optimization

**Chunked Uploads**: Support resumable uploads for large files
**CDN Integration**: Serve static files (PDFs) through CDN
**Compression**: Compress answer sheet images before upload
**Lazy Loading**: Load question images on-demand in frontend



## Security Considerations

### Authentication and Authorization

**Role-Based Access Control (RBAC)**:
```javascript
// Middleware for route protection
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Route examples
router.post('/exams', authorize('admin'), scheduleExam);
router.post('/exams/:id/questions', authorize('university', 'admin'), createQuestions);
router.get('/exams/:id/start', authorize('student'), startExam);
```

**Resource Ownership Verification**:
- Students can only access their own submissions
- Universities can only manage exams for their courses
- Verify ownership before any update/delete operation

### Data Validation and Sanitization

**Input Validation**:
- Validate all user inputs using Joi or express-validator
- Sanitize HTML content in question text and feedback
- Validate file types and sizes before upload
- Check date ranges for logical consistency

**Example Validation Schema**:
```javascript
const examSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  scheduledStartTime: Joi.date().min('now').required(),
  scheduledEndTime: Joi.date().greater(Joi.ref('scheduledStartTime')).required(),
  duration: Joi.number().positive().max(480).required(),
  examType: Joi.string().valid('pdf-based', 'online-mcq', 'online-descriptive', 'mixed').required()
});
```

### Secure File Handling

**File Upload Security**:
- Validate file MIME types on server (don't trust client)
- Scan uploaded files for malware
- Store files with randomized names to prevent path traversal
- Use signed URLs with expiration for file access
- Implement rate limiting on upload endpoints

**File Access Control**:
```javascript
// Generate time-limited signed URL
const generateSecureUrl = (filePath, expiresIn = 3600) => {
  const token = jwt.sign({ filePath }, SECRET_KEY, { expiresIn });
  return `/api/files/download?token=${token}`;
};
```

### Exam Integrity

**Prevent Cheating**:
- Randomize question order if `shuffleQuestions: true`
- Randomize MCQ option order
- Track submission timestamps to detect suspicious patterns
- Log all exam access attempts
- Implement browser lockdown mode (optional)

**Answer Tampering Prevention**:
- Validate answer submissions against question IDs
- Check submission is still in 'in-progress' status
- Verify student owns the submission
- Log all answer changes with timestamps

### Rate Limiting

**API Rate Limits**:
```javascript
// General API: 100 requests per 15 minutes
// File upload: 10 uploads per hour
// Exam start: 3 attempts per exam per student
// Answer submission: 1000 per exam per student (for auto-save)

const rateLimit = require('express-rate-limit');

const examStartLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => `${req.user.id}-${req.params.examId}`
});
```

### Data Encryption

**Encryption at Rest**:
- Enable MongoDB encryption at rest
- Encrypt sensitive file storage

**Encryption in Transit**:
- Enforce HTTPS for all API endpoints
- Use WSS (WebSocket Secure) for real-time connections
- Implement HSTS headers

### Audit Logging

**Log Critical Events**:
- Exam creation, modification, deletion
- Question paper uploads
- Exam access attempts (successful and failed)
- Submission events (start, answer, submit)
- Grading actions
- Result publication
- Administrative actions

**Log Format**:
```javascript
{
  timestamp: Date,
  userId: ObjectId,
  action: String,
  resource: String,
  resourceId: ObjectId,
  ipAddress: String,
  userAgent: String,
  result: 'success' | 'failure',
  details: Object
}
```



## Dependencies

### Backend Dependencies

**Core Framework**:
- `express` (^4.18.0) - Web application framework
- `mongoose` (^7.0.0) - MongoDB ODM
- `socket.io` (^4.6.0) - WebSocket server for real-time features

**Authentication & Security**:
- `jsonwebtoken` (^9.0.0) - JWT token generation and verification
- `bcryptjs` (^2.4.3) - Password hashing (already in use)
- `express-rate-limit` (^6.7.0) - Rate limiting middleware
- `helmet` (^7.0.0) - Security headers
- `joi` (^17.9.0) - Input validation

**File Handling**:
- `multer` (^1.4.5) - Multipart form data handling for file uploads
- `aws-sdk` (^2.1300.0) - AWS S3 integration (if using S3 for storage)
- `pdf-parse` (^1.1.1) - PDF validation and parsing

**Notifications**:
- `nodemailer` (^6.9.0) - Email sending (likely already in use)
- `node-cron` (^3.0.2) - Scheduled tasks for exam reminders

**Utilities**:
- `date-fns` (^2.30.0) - Date manipulation and formatting
- `lodash` (^4.17.21) - Utility functions

### Frontend Dependencies

**Core Framework**:
- `react` (^18.2.0) - UI library (already in use)
- `react-router-dom` (^6.10.0) - Routing (already in use)

**State Management**:
- `@reduxjs/toolkit` (^1.9.5) - State management (if using Redux)
- `react-query` (^3.39.0) - Server state management (alternative)

**Real-Time**:
- `socket.io-client` (^4.6.0) - WebSocket client

**UI Components**:
- `@mui/material` (^5.13.0) - Material-UI components (if not already using)
- `react-datepicker` (^4.11.0) - Date/time picker for scheduling
- `react-dropzone` (^14.2.0) - Drag-and-drop file upload

**Form Handling**:
- `react-hook-form` (^7.43.0) - Form state management
- `yup` (^1.1.1) - Client-side validation

**Rich Text**:
- `react-quill` (^2.0.0) - Rich text editor for descriptive questions
- `react-markdown` (^8.0.7) - Markdown rendering

**Utilities**:
- `axios` (^1.4.0) - HTTP client (likely already in use)
- `date-fns` (^2.30.0) - Date formatting
- `react-countdown` (^2.3.5) - Countdown timer component

### Development Dependencies

**Testing**:
- `jest` (^29.5.0) - Testing framework
- `supertest` (^6.3.3) - HTTP assertion library
- `@testing-library/react` (^14.0.0) - React component testing
- `fast-check` (^3.8.0) - Property-based testing

**Code Quality**:
- `eslint` (^8.40.0) - Linting
- `prettier` (^2.8.8) - Code formatting

### External Services

**File Storage**:
- AWS S3 or compatible service (Backblaze B2, DigitalOcean Spaces)
- Alternative: Local file system with proper backup

**Email Service**:
- SendGrid, AWS SES, or existing email provider

**Caching** (Optional but Recommended):
- Redis (^7.0) - For caching and WebSocket scaling

**Monitoring** (Recommended):
- Sentry - Error tracking
- New Relic or DataDog - Performance monitoring

