# Frontend Content Player Implementation - Course Interactive Content

## Overview
This document outlines the implementation plan for the student-facing interactive content player components. These components allow students to view and complete exercises, practices, and quizzes.

## Implementation Status: ⚠️ SPECIFICATION COMPLETE - IMPLEMENTATION PENDING

This document provides the complete specification for frontend implementation. The actual React components need to be built based on these specifications.

---

## Component Architecture

```
InteractiveContentPlayer (Main Container)
├── ContentHeader (Title, Description, Instructions)
├── ContentMetadata (Time Limit, Attempts Remaining)
├── Timer (For Timed Content)
├── QuestionRenderer (Renders Questions)
│   ├── MultipleChoiceQuestion
│   ├── TrueFalseQuestion
│   ├── ShortAnswerQuestion
│   ├── CodeSubmissionQuestion
│   └── EssayQuestion
├── SubmissionControls (Submit Button, Validation)
├── FeedbackDisplay (Results, Solutions)
└── RetryControls (Retry Button, Attempt Info)
```

---

## Task 17.1: InteractiveContentPlayer Component

### File Location
`client/src/components/interactive/InteractiveContentPlayer.jsx`

### Component Responsibilities
- Display content title, description, and instructions
- Show time limit and remaining attempts
- Render questions with appropriate input controls
- Implement timer for timed content
- Track start time for time spent calculation

### Props Interface
```javascript
{
  contentId: string,           // ID of the interactive content
  courseId: string,            // ID of the course
  onComplete: function,        // Callback when submission completes
  onBack: function            // Callback to return to course view
}
```

### State Management
```javascript
const [content, setContent] = useState(null);
const [answers, setAnswers] = useState([]);
const [startTime, setStartTime] = useState(null);
const [timeRemaining, setTimeRemaining] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submissionResult, setSubmissionResult] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### API Integration
```javascript
// Fetch content details
GET /api/courses/:courseId/modules/:moduleId/content

// Submit answers
POST /api/submissions
Body: {
  contentId: string,
  answers: Array<{questionId, answerValue}>,
  startedAt: Date
}
```

### Timer Implementation
```javascript
useEffect(() => {
  if (content?.timeLimit && startTime) {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = (content.timeLimit * 60 * 1000) - elapsed;
      
      if (remaining <= 0) {
        // Auto-submit when time expires
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }
}, [content, startTime]);
```

### UI Layout
```jsx
<div className="interactive-content-player">
  <ContentHeader 
    title={content.title}
    description={content.description}
    instructions={content.instructions}
  />
  
  <ContentMetadata
    type={content.type}
    timeLimit={content.timeLimit}
    attemptsAllowed={content.attemptsAllowed}
    userAttempts={content.userAttempts}
    remainingAttempts={content.remainingAttempts}
  />
  
  {content.timeLimit && (
    <Timer 
      timeRemaining={timeRemaining}
      totalTime={content.timeLimit * 60 * 1000}
    />
  )}
  
  <div className="questions-container">
    {content.questions.map((question, index) => (
      <QuestionRenderer
        key={question._id}