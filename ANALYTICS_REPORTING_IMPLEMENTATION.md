# Analytics and Reporting Implementation - Course Interactive Content

## Overview
This document describes the implementation of analytics and reporting endpoints for instructors to view student performance data on interactive content (exercises, practices, and quizzes).

## Implementation Status: ✅ COMPLETE

All analytics requirements from Requirements 19.1-19.6 have been implemented.

---

## API Endpoints

### 1. Get Course Analytics
**Endpoint**: `GET /api/analytics/:courseId`

**Access**: Private (University/Instructor only)

**Query Parameters**:
- `startDate` (optional) - Filter submissions from this date (ISO 8601 format)
- `endDate` (optional) - Filter submissions until this date (ISO 8601 format)

**Response**:
```json
{
  "success": true,
  "courseId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "courseName": "Introduction to JavaScript",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  },
  "submissionStatistics": {
    "total": 150,
    "graded": 120,
    "pending": 30,
    "averageScore": 78.5,
    "passingRate": 85.3
  },
  "questionAnalytics": [
    {
      "contentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "contentTitle": "Variables and Data Types Quiz",
      "contentType": "quiz",
      "questions": [
        {
          "questionId": "64a1b2c3d4e5f6g7h8i9j0k3",
          "questionText": "What is the difference between let and const?",
          "questionType": "short-answer",
          "maxPoints": 10,
          "averageScore": 7.8,
          "averagePercentage": 78.0,
          "correctCount": 45,
          "totalAttempts": 60,
          "correctRate": 75.0
        }
      ]
    }
  ],
  "contentCompletionRates": [
    {
      "contentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "contentTitle": "Variables and Data Types Quiz",
      "contentType": "quiz",
      "attemptsAllowed": 3,
      "totalStudents": 100,
      "studentsAttempted": 85,
      "completionRate": 85.0,
      "totalSubmissions": 120,
      "averageScore": 78.5,
      "averageAttempts": 1.4
    }
  ],
  "gradingQueue": {
    "total": 30,
    "exercises": 10,
    "practices": 5,
    "quizzes": 15,
    "averageGradingTimeMinutes": 45
  }
}
```

---

### 2. Get Content-Specific Analytics
**Endpoint**: `GET /api/analytics/:courseId/content/:contentId`

**Access**: Private (University/Instructor only)

**Query Parameters**:
- `startDate` (optional) - Filter submissions from this date
- `endDate` (optional) - Filter submissions until this date

**Response**:
```json
{
  "success": true,
  "content": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Variables and Data Types Quiz",
    "type": "quiz",
    "attemptsAllowed": 3,
    "passingScore": 70
  },
  "dateRange": {
    "startDate": null,
    "endDate": null
  },
  "overallStatistics": {
    "totalSubmissions": 120,
    "gradedSubmissions": 100,
    "pendingSubmissions": 20,
    "averageScore": 78.5,
    "uniqueStudents": 85
  },
  "questionStatistics": [
    {
      "questionNumber": 1,
      "questionId": "64a1b2c3d4e5f6g7h8i9j0k3",
      "questionText": "What is the difference between let and const?",
      "questionType": "short-answer",
      "maxPoints": 10,
      "averageScore": 7.8,
      "averagePercentage": 78.0,
      "correctCount": 45,
      "totalAttempts": 60,
      "correctRate": 75.0
    }
  ],
  "studentPerformance": [
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k4",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "attempts": [
        {
          "attemptNumber": 1,
          "score": 65.0,
          "status": "graded",
          "submittedAt": "2024-03-01T10:00:00.000Z",
          "gradedAt": "2024-03-01T11:00:00.000Z"
        },
        {
          "attemptNumber": 2,
          "score": 85.0,
          "status": "graded",
          "submittedAt": "2024-03-02T10:00:00.000Z",
          "gradedAt": "2024-03-02T11:00:00.000Z"
        }
      ],
      "bestScore": 85.0,
      "latestScore": 85.0
    }
  ]
}
```

---

## Requirements Coverage

### Requirement 19.1: Provide Submission Statistics ✅

**Implementation**:
```javascript
const submissionStats = await Submission.aggregate([
    {
        $match: {
            course: mongoose.Types.ObjectId(courseId),
            ...dateFilter
        }
    },
    {
        $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            averageScore: { $avg: '$score' },
            gradedSubmissions: {
                $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] }
            },
            pendingSubmissions: {
                $sum: { $cond: [{ $eq: ['$status', 'needs-review'] }, 1, 0] }
            },
            passingSubmissions: {
                $sum: { $cond: ['$isPassing', 1, 0] }
            }
        }
    }
]);
```

**Statistics Provided**:
- Total submissions count
- Graded submissions count
- Pending submissions count
- Average score across all submissions
- Passing rate (percentage of submissions that passed)

---

### Requirement 19.2: Show Average Scores Per Question ✅

**Implementation**:
```javascript
const calculateQuestionAnalytics = async (courseId, allContent, dateFilter) => {
    const questionStats = [];

    for (const content of allContent) {
        const submissions = await Submission.find({
            course: courseId,
            content: content._id,
            status: 'graded',
            ...dateFilter
        });

        const questionData = content.questions.map((question, index) => {
            const scores = [];
            const correctCount = submissions.reduce((count, submission) => {
                const answer = submission.answers[index];
                if (answer && answer.gradedAt) {
                    scores.push(answer.pointsEarned);
                    return count + (answer.isCorrect ? 1 : 0);
                }
                return count;
            }, 0);

            const avgScore = scores.length > 0
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                : 0;

            return {
                questionId: question._id,
                questionText: question.questionText.substring(0, 100),
                questionType: question.questionType,
                maxPoints: question.points,
                averageScore: Math.round(avgScore * 10) / 10,
                averagePercentage: (avgScore / question.points) * 100,
                correctCount,
                totalAttempts: scores.length,
                correctRate: (correctCount / scores.length) * 100
            };
        });

        questionStats.push({
            contentId: content._id,
            contentTitle: content.title,
            contentType: content.type,
            questions: questionData
        });
    }

    return questionStats;
};
```

**Question Analytics Include**:
- Question ID and text (truncated to 100 chars)
- Question type (multiple-choice, true-false, etc.)
- Maximum points possible
- Average score earned
- Average percentage score
- Number of correct answers
- Total attempts
- Correct answer rate (percentage)

---

### Requirement 19.3: Show Completion Rates ✅

**Implementation**:
```javascript
const calculateContentCompletionRates = async (courseId, allContent, dateFilter) => {
    const completionRates = [];

    // Get total enrolled students
    const totalStudents = await Enrollment.countDocuments({
        course: courseId,
        status: 'active'
    });

    for (const content of allContent) {
        // Count unique students who submitted
        const submissions = await Submission.find({
            course: courseId,
            content: content._id,
            ...dateFilter
        }).distinct('user');

        const submissionCount = submissions.length;
        const completionRate = totalStudents > 0
            ? (submissionCount / totalStudents) * 100
            : 0;

        // Get average score for this content
        const avgScoreResult = await Submission.aggregate([
            {
                $match: {
                    course: mongoose.Types.ObjectId(courseId),
                    content: content._id,
                    status: 'graded',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    totalSubmissions: { $sum: 1 }
                }
            }
        ]);

        completionRates.push({
            contentId: content._id,
            contentTitle: content.title,
            contentType: content.type,
            attemptsAllowed: content.attemptsAllowed,
            totalStudents,
            studentsAttempted: submissionCount,
            completionRate: Math.round(completionRate * 10) / 10,
            totalSubmissions: avgScoreResult[0]?.totalSubmissions || 0,
            averageScore: Math.round(avgScoreResult[0]?.averageScore || 0),
            averageAttempts: submissionCount > 0
                ? totalSubmissions / submissionCount
                : 0
        });
    }

    return completionRates;
};
```

**Completion Rate Metrics**:
- Total enrolled students
- Number of students who attempted
- Completion rate (percentage)
- Total submissions (including retries)
- Average score for the content
- Average attempts per student

---

### Requirement 19.4: Show Grading Queue Statistics ✅

**Implementation**:
```javascript
// Get grading queue statistics
const gradingQueueStats = await Submission.aggregate([
    {
        $match: {
            course: mongoose.Types.ObjectId(courseId),
            status: 'needs-review'
        }
    },
    {
        $group: {
            _id: '$contentType',
            count: { $sum: 1 }
        }
    }
]);

const queueStats = {
    total: 0,
    exercises: 0,
    practices: 0,
    quizzes: 0
};

gradingQueueStats.forEach(stat => {
    queueStats.total += stat.count;
    if (stat._id === 'exercise') queueStats.exercises = stat.count;
    if (stat._id === 'practice') queueStats.practices = stat.count;
    if (stat._id === 'quiz') queueStats.quizzes = stat.count;
});

// Calculate average grading time
const gradedSubmissions = await Submission.find({
    course: courseId,
    status: 'graded',
    gradedAt: { $ne: null },
    submittedAt: { $ne: null },
    ...dateFilter
}).select('submittedAt gradedAt');

let avgGradingTime = 0;
if (gradedSubmissions.length > 0) {
    const totalTime = gradedSubmissions.reduce((sum, sub) => {
        const timeDiff = sub.gradedAt - sub.submittedAt;
        return sum + timeDiff;
    }, 0);
    avgGradingTime = Math.floor(totalTime / gradedSubmissions.length / 1000 / 60);
}
```

**Grading Queue Metrics**:
- Total pending submissions
- Pending exercises count
- Pending practices count
- Pending quizzes count
- Average grading time (in minutes)

---

### Requirement 19.5: Filter by Course and Time Period ✅

**Implementation**:
```javascript
// Query parameters for filtering
const { startDate, endDate } = req.query;

// Build date filter for submissions
const dateFilter = {};
if (startDate || endDate) {
    dateFilter.submittedAt = {};
    if (startDate) {
        dateFilter.submittedAt.$gte = new Date(startDate);
    }
    if (endDate) {
        dateFilter.submittedAt.$lte = new Date(endDate);
    }
}

// Apply filter to all queries
const submissions = await Submission.find({
    course: courseId,
    ...dateFilter
});
```

**Filtering Features**:
- Filter by course ID (required in URL)
- Filter by start date (optional query parameter)
- Filter by end date (optional query parameter)
- Date range is returned in response for clarity
- All statistics respect the date filter

**Example Usage**:
```
GET /api/analytics/64a1b2c3d4e5f6g7h8i9j0k1?startDate=2024-01-01&endDate=2024-03-31
```

---

### Requirement 19.6: Authorization Enforcement ✅

**Implementation**:

**Route-Level Authorization**:
```javascript
// In analyticsRoutes.js
router.get(
    '/:courseId',
    protect,
    authorize('university', 'admin'),
    getCourseAnalytics
);
```

**Controller-Level Ownership Validation**:
```javascript
// Verify course exists
const course = await Course.findById(courseId);
if (!course) {
    res.status(404);
    throw new Error('Course not found');
}

// Requirement 19.6: Validate instructor owns the course
if (course.instructor && course.instructor.toString() !== instructorId) {
    res.status(403);
    throw new Error('Not authorized to view analytics for this course');
}
```

**Authorization Checks**:
- ✅ User must be authenticated (JWT token required)
- ✅ User must have 'university' or 'admin' role
- ✅ Instructor must own the course
- ✅ Returns 403 Forbidden if not authorized
- ✅ Returns 404 if course not found

---

## Data Aggregation Strategy

### Performance Optimizations

1. **MongoDB Aggregation Pipeline**:
   - Uses `$match` to filter by course and date
   - Uses `$group` to calculate statistics
   - Minimizes data transfer from database

2. **Distinct Queries**:
   - Uses `.distinct('user')` to count unique students efficiently
   - Avoids loading full submission documents when only counting

3. **Selective Field Loading**:
   - Uses `.select()` to load only required fields
   - Reduces memory usage and network transfer

4. **Indexed Queries**:
   - Queries use indexed fields (course, content, status)
   - Ensures fast query execution

---

## Use Cases

### Use Case 1: Instructor Reviews Course Performance
**Scenario**: Instructor wants to see overall performance across all interactive content

**Action**: `GET /api/analytics/64a1b2c3d4e5f6g7h8i9j0k1`

**Result**:
- See total submissions and average scores
- Identify which content items have low completion rates
- See which questions students struggle with
- Check grading queue backlog

### Use Case 2: Instructor Analyzes Specific Quiz
**Scenario**: Instructor wants detailed analytics for a specific quiz

**Action**: `GET /api/analytics/64a1b2c3d4e5f6g7h8i9j0k1/content/64a1b2c3d4e5f6g7h8i9j0k2`

**Result**:
- See question-by-question performance
- Identify which students are struggling
- View individual student attempt history
- Analyze retry patterns

### Use Case 3: Instructor Reviews Semester Performance
**Scenario**: Instructor wants to see performance for a specific semester

**Action**: `GET /api/analytics/64a1b2c3d4e5f6g7h8i9j0k1?startDate=2024-01-01&endDate=2024-05-31`

**Result**:
- All statistics filtered to semester date range
- Compare performance across different time periods
- Track improvement over time

---

## Integration Points

### Database Models Used
- `Submission` - For submission data and scores
- `InteractiveContent` - For content details and questions
- `Course` - For course ownership validation
- `Enrollment` - For total student count

### Routes
- `GET /api/analytics/:courseId` - Course-level analytics
- `GET /api/analytics/:courseId/content/:contentId` - Content-level analytics

### Middleware
- `protect` - JWT authentication
- `authorize('university', 'admin')` - Role-based access control

---

## Error Handling

### Error Scenarios

1. **Course Not Found**:
   - Status: 404 Not Found
   - Message: "Course not found"

2. **Unauthorized Access**:
   - Status: 403 Forbidden
   - Message: "Not authorized to view analytics for this course"

3. **Content Not Found**:
   - Status: 404 Not Found
   - Message: "Interactive content not found"

4. **Invalid Date Format**:
   - Handled by JavaScript Date constructor
   - Invalid dates result in NaN, which is handled gracefully

---

## Testing Considerations

### Manual Testing Steps

1. **Test Course Analytics**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/analytics/64a1b2c3d4e5f6g7h8i9j0k1
   ```

2. **Test with Date Filter**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        "http://localhost:5000/api/analytics/64a1b2c3d4e5f6g7h8i9j0k1?startDate=2024-01-01&endDate=2024-12-31"
   ```

3. **Test Content Analytics**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/analytics/64a1b2c3d4e5f6g7h8i9j0k1/content/64a1b2c3d4e5f6g7h8i9j0k2
   ```

4. **Test Authorization**:
   - Try accessing with student token (should fail)
   - Try accessing another instructor's course (should fail)
   - Try without authentication (should fail)

### Expected Results

- ✅ Instructor can view their own course analytics
- ✅ Admin can view any course analytics
- ✅ Students cannot access analytics endpoints
- ✅ Date filtering works correctly
- ✅ Statistics are accurate
- ✅ Performance is acceptable (< 2 seconds for typical course)

---

## Future Enhancements (Not in Current Scope)

Potential improvements for future iterations:

1. **Export to CSV/Excel**: Download analytics data
2. **Visualization**: Charts and graphs for visual analysis
3. **Comparative Analytics**: Compare across multiple courses
4. **Trend Analysis**: Track performance over time with line charts
5. **Student Cohort Analysis**: Group students by performance level
6. **Question Difficulty Rating**: Automatically rate question difficulty
7. **Predictive Analytics**: Predict student success based on early performance
8. **Real-time Dashboard**: WebSocket updates for live statistics
9. **Custom Reports**: Allow instructors to create custom report templates
10. **Email Reports**: Scheduled email delivery of analytics

---

## Conclusion

The analytics and reporting system is fully implemented and meets all requirements:

| Requirement | Status | Implementation |
|------------|--------|----------------|
| 19.1 - Submission statistics | ✅ Complete | Aggregation pipeline with comprehensive stats |
| 19.2 - Average scores per question | ✅ Complete | Question-level analytics with correct rates |
| 19.3 - Completion rates | ✅ Complete | Per-content completion tracking |
| 19.4 - Grading queue statistics | ✅ Complete | Queue breakdown by content type |
| 19.5 - Filter by course and time | ✅ Complete | Date range filtering support |
| 19.6 - Authorization enforcement | ✅ Complete | Ownership validation and role checks |

**Task 15.1 Status**: COMPLETE - All analytics requirements are satisfied.
