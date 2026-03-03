# Frontend Implementation Guide - Course Interactive Content

## Overview
This guide provides detailed instructions for implementing the frontend React components for the interactive content feature. The backend API is complete, and this document will help you build the user interfaces for students and instructors.

---

## Architecture Overview

```
Frontend Components Structure:
├── Student Components
│   ├── InteractiveContentPlayer (Task 17)
│   │   ├── QuestionRenderer
│   │   ├── SubmissionFeedback
│   │   └── Timer
│   └── ProgressDashboard (Task 20)
│       ├── ProgressOverview
│       └── SubmissionHistory
├── Instructor Components
│   ├── InteractiveContentBuilder (Task 16)
│   │   ├── ContentForm
│   │   ├── QuestionBuilder
│   │   └── ContentList
│   ├── ManualGradingQueue (Task 19)
│   │   ├── PendingSubmissionsList
│   │   └── GradingForm
│   └── AnalyticsDashboard (Task 21)
│       ├── StatisticsCards
│       ├── QuestionAnalytics
│       └── CompletionRates
└── Shared Components
    ├── ContentCard
    └── ScoreDisplay
```

---

## Task 17: Student Content Player

### 17.1 InteractiveContentPlayer Component

**Location**: `client/src/components/interactive/InteractiveContentPlayer.jsx`

**Purpose**: Main component for students to view and complete interactive content

**Props**:
```javascript
{
  contentId: string,
  courseId: string,
  moduleId: string,
  onComplete: function
}
```

**State Management**:
```javascript
const [content, setContent] = useState(null);
const [answers, setAnswers] = useState([]);
const [startTime, setStartTime] = useState(null);
const [timeRemaining, setTimeRemaining] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submissionResult, setSubmissionResult] = useState(null);
const [loading, setLoading] = useState(true);
```

**API Calls**:
```javascript
// Fetch content
GET /api/courses/${courseId}/modules/${moduleId}/content

// Submit answers
POST /api/submissions
Body: {
  contentId,
  answers: [{ questionId, answerValue }],
  startedAt: startTime
}

// Retry submission
POST /api/submissions/${submissionId}/retry
Body: {
  answers: [{ questionId, answerValue }],
  startedAt: startTime
}
```

**Component Structure**:
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuestionRenderer from './QuestionRenderer';
import Timer from './Timer';
import SubmissionFeedback from './SubmissionFeedback';

const InteractiveContentPlayer = ({ contentId, courseId, moduleId, onComplete }) => {
  // State declarations...

  useEffect(() => {
    fetchContent();
    setStartTime(new Date());
  }, [contentId]);

  const fetchContent = async () => {
    try {
      const { data } = await axios.get(
        `/api/courses/${courseId}/modules/${moduleId}/content`
      );
      const selectedContent = data.content.find(c => c._id === contentId);
      setContent(selectedContent);
      
      // Initialize answers array
      const initialAnswers = selectedContent.questions.map(q => ({
        questionId: q._id,
        answerValue: ''
      }));
      setAnswers(initialAnswers);
      
      // Set timer if timed content
      if (selectedContent.timeLimit) {
        setTimeRemaining(selectedContent.timeLimit * 60); // Convert to seconds
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex].answerValue = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    const unanswered = answers.some(a => !a.answerValue);
    if (unanswered) {
      alert('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/submissions', {
        contentId,
        answers,
        startedAt: startTime
      });
      
      setSubmissionResult(data);
      if (onComplete) onComplete(data);
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert(error.response?.data?.message || 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers(content.questions.map(q => ({
      questionId: q._id,
      answerValue: ''
    })));
    setStartTime(new Date());
    setSubmissionResult(null);
    if (content.timeLimit) {
      setTimeRemaining(content.timeLimit * 60);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!content) return <div>Content not found</div>;

  return (
    <div className="interactive-content-player">
      {/* Header */}
      <div className="content-header">
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <div className="content-meta">
          <span>Type: {content.type}</span>
          {content.attemptsAllowed !== -1 && (
            <span>Attempts: {content.userAttempts || 0} / {content.attemptsAllowed}</span>
          )}
          {content.timeLimit && (
            <Timer 
              timeRemaining={timeRemaining}
              onTimeUp={handleSubmit}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions</h3>
        <p>{content.instructions}</p>
      </div>

      {/* Questions */}
      {!submissionResult ? (
        <div className="questions-container">
          {content.questions.map((question, index) => (
            <QuestionRenderer
              key={question._id}
              question={question}
              questionNumber={index + 1}
              value={answers[index]?.answerValue}
              onChange={(value) => handleAnswerChange(index, value)}
              disabled={isSubmitting}
            />
          ))}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      ) : (
        <SubmissionFeedback
          result={submissionResult}
          content={content}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default InteractiveContentPlayer;
```

---

### 17.2 QuestionRenderer Component

**Location**: `client/src/components/interactive/QuestionRenderer.jsx`

**Purpose**: Renders different question types with appropriate input controls

```jsx
import React from 'react';

const QuestionRenderer = ({ question, questionNumber, value, onChange, disabled }) => {
  const renderInput = () => {
    switch (question.questionType) {
      case 'multiple-choice':
        return (
          <div className="multiple-choice">
            {question.options.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="true-false">
            <label className="option-label">
              <input
                type="radio"
                name={`question-${question._id}`}
                value="true"
                checked={value === 'true'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
              <span>True</span>
            </label>
            <label className="option-label">
              <input
                type="radio"
                name={`question-${question._id}`}
                value="false"
                checked={value === 'false'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
              />
              <span>False</span>
            </label>
          </div>
        );

      case 'short-answer':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter your answer"
            className="short-answer-input"
          />
        );

      case 'code-submission':
        return (
          <div className="code-submission">
            <div className="code-header">
              <span>Language: {question.language}</span>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder={question.starterCode || '// Write your code here'}
              className="code-editor"
              rows={15}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        );

      case 'essay':
        return (
          <div className="essay">
            {question.maxWords && (
              <div className="word-count">
                Words: {value.split(/\s+/).filter(w => w).length} / {question.maxWords}
              </div>
            )}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="Write your essay here"
              className="essay-textarea"
              rows={10}
            />
            {question.rubric && (
              <div className="rubric">
                <h4>Grading Rubric:</h4>
                <p>{question.rubric}</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="question-container">
      <div className="question-header">
        <h3>Question {questionNumber}</h3>
        <span className="points">{question.points} points</span>
      </div>
      <div className="question-text">
        {question.questionText}
      </div>
      {question.hints && question.hints.length > 0 && (
        <details className="hints">
          <summary>Hints</summary>
          <ul>
            {question.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="question-input">
        {renderInput()}
      </div>
    </div>
  );
};

export default QuestionRenderer;
```

---

### 17.3 SubmissionFeedback Component

**Location**: `client/src/components/interactive/SubmissionFeedback.jsx`

**Purpose**: Display submission results, feedback, and solutions

```jsx
import React from 'react';

const SubmissionFeedback = ({ result, content, onRetry }) => {
  const canRetry = content.attemptsAllowed === -1 || 
                   (content.userAttempts || 0) < content.attemptsAllowed;

  return (
    <div className="submission-feedback">
      {/* Score Display */}
      <div className="score-card">
        <h2>Submission Complete!</h2>
        <div className="score-display">
          <div className="score-value">{result.score.toFixed(1)}%</div>
          {content.type === 'quiz' && content.passingScore && (
            <div className={`passing-status ${result.isPassing ? 'passed' : 'failed'}`}>
              {result.isPassing ? '✓ Passed' : '✗ Not Passed'}
              <span className="passing-threshold">
                (Passing: {content.passingScore}%)
              </span>
            </div>
          )}
        </div>
        <div className="attempt-info">
          Attempt {result.attemptNumber} of {content.attemptsAllowed === -1 ? '∞' : content.attemptsAllowed}
        </div>
      </div>

      {/* Question Feedback */}
      <div className="questions-feedback">
        <h3>Your Answers</h3>
        {result.answers.map((answer, index) => {
          const question = content.questions[index];
          return (
            <div key={index} className="answer-feedback">
              <div className="question-header">
                <h4>Question {index + 1}</h4>
                <span className={`status ${answer.isCorrect ? 'correct' : answer.isCorrect === null ? 'pending' : 'incorrect'}`}>
                  {answer.isCorrect === null ? 'Pending Review' : 
                   answer.isCorrect ? `✓ Correct (${answer.pointsEarned}/${question.points})` : 
                   `✗ Incorrect (${answer.pointsEarned}/${question.points})`}
                </span>
              </div>
              
              <div className="question-text">{question.questionText}</div>
              
              <div className="your-answer">
                <strong>Your Answer:</strong> {answer.answerValue}
              </div>
              
              {answer.feedback && (
                <div className="feedback">
                  <strong>Feedback:</strong> {answer.feedback}
                </div>
              )}
              
              {answer.correctAnswer && (
                <div className="correct-answer">
                  <strong>Correct Answer:</strong> {answer.correctAnswer}
                </div>
              )}
              
              {answer.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong> {answer.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Retry Button */}
      {canRetry && (
        <button onClick={onRetry} className="retry-button">
          Try Again ({content.remainingAttempts} attempts remaining)
        </button>
      )}
      
      {!canRetry && (
        <div className="no-attempts">
          No more attempts available for this content.
        </div>
      )}
    </div>
  );
};

export default SubmissionFeedback;
```

---

### 17.4 Timer Component

**Location**: `client/src/components/interactive/Timer.jsx`

**Purpose**: Display countdown timer for timed content

```jsx
import React, { useEffect, useState } from 'react';

const Timer = ({ timeRemaining, onTimeUp }) => {
  const [seconds, setSeconds] = useState(timeRemaining);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onTimeUp]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (seconds < 60) return 'timer critical';
    if (seconds < 300) return 'timer warning';
    return 'timer';
  };

  return (
    <div className={getTimerClass()}>
      <span className="timer-icon">⏱</span>
      <span className="timer-value">{formatTime(seconds)}</span>
    </div>
  );
};

export default Timer;
```

---

## Styling Recommendations

### CSS Structure
```css
/* InteractiveContentPlayer.css */
.interactive-content-player {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.content-header {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.content-meta {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.timer {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #e3f2fd;
  border-radius: 4px;
}

.timer.warning {
  background: #fff3cd;
  color: #856404;
}

.timer.critical {
  background: #f8d7da;
  color: #721c24;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.question-container {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.points {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.multiple-choice, .true-false {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-label:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.option-label input[type="radio"]:checked + span {
  font-weight: bold;
  color: #007bff;
}

.short-answer-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 16px;
}

.code-editor {
  width: 100%;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #f8f9fa;
}

.essay-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 16px;
  resize: vertical;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #218838;
}

.submit-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.score-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 30px;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  margin: 20px 0;
}

.passing-status {
  font-size: 24px;
  margin: 10px 0;
}

.passing-status.passed {
  color: #d4edda;
}

.passing-status.failed {
  color: #f8d7da;
}

.answer-feedback {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.status.correct {
  color: #28a745;
  font-weight: bold;
}

.status.incorrect {
  color: #dc3545;
  font-weight: bold;
}

.status.pending {
  color: #ffc107;
  font-weight: bold;
}

.correct-answer {
  background: #d4edda;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.explanation {
  background: #e7f3ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.retry-button {
  width: 100%;
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.retry-button:hover {
  background: #0056b3;
}
```

---

## Integration with Existing Course View

### Add to Module Display

**Location**: Update your existing course/module view component

```jsx
import InteractiveContentPlayer from './components/interactive/InteractiveContentPlayer';

// In your module display component:
const renderModuleContent = (module) => {
  return (
    <div className="module-content">
      {/* Existing video rendering */}
      {module.videos.map(video => (
        <VideoPlayer key={video._id} video={video} />
      ))}
      
      {/* Add interactive content */}
      {module.interactiveContent && module.interactiveContent.map(content => (
        <div key={content._id} className="content-item">
          <div className="content-card">
            <div className="content-icon">
              {content.type === 'quiz' && '📝'}
              {content.type === 'exercise' && '💪'}
              {content.type === 'practice' && '🎯'}
            </div>
            <div className="content-info">
              <h4>{content.title}</h4>
              <p>{content.description}</p>
              <div className="content-meta">
                <span>{content.type}</span>
                {content.userAttempts > 0 && (
                  <span>Attempts: {content.userAttempts}</span>
                )}
              </div>
            </div>
            <button onClick={() => openContentPlayer(content._id)}>
              Start
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const openContentPlayer = (contentId) => {
  // Navigate to content player or open in modal
  navigate(`/courses/${courseId}/content/${contentId}`);
  // OR
  setSelectedContent(contentId);
  setShowPlayer(true);
};
```

---

## API Integration Summary

### Required API Endpoints (Already Implemented)

1. **Get Module Content**
   - `GET /api/courses/:courseId/modules/:moduleId/content`
   - Returns all interactive content for a module with attempt information

2. **Submit Answers**
   - `POST /api/submissions`
   - Body: `{ contentId, answers, startedAt }`
   - Returns: submission result with scores and feedback

3. **Get Submission**
   - `GET /api/submissions/:submissionId`
   - Returns: detailed submission with answers and feedback

4. **Retry Submission**
   - `POST /api/submissions/:submissionId/retry`
   - Body: `{ answers, startedAt }`
   - Returns: new submission result

---

## Testing Checklist

### Functional Testing
- [ ] Content loads correctly
- [ ] All question types render properly
- [ ] Timer counts down correctly
- [ ] Timer auto-submits when time expires
- [ ] Answers are saved correctly
- [ ] Submission validation works
- [ ] Feedback displays correctly
- [ ] Solutions show based on settings
- [ ] Retry functionality works
- [ ] Attempt limits are enforced

### Edge Cases
- [ ] Handle network errors gracefully
- [ ] Handle missing content
- [ ] Handle unenrolled student access
- [ ] Handle exceeded attempt limits
- [ ] Handle time limit exceeded
- [ ] Handle empty answers
- [ ] Handle special characters in answers

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Success feedback is encouraging
- [ ] Navigation is intuitive
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Next Steps

After completing Task 17 (Student Content Player):

1. **Task 18**: Run tests and verify everything works
2. **Task 19**: Implement instructor grading interface
3. **Task 20**: Implement progress dashboard
4. **Task 21**: Implement analytics dashboard
5. **Task 22**: Integrate with module display
6. **Task 23**: Wire up all API routes

---

## Support and Resources

### Existing Components to Reference
- Look at existing course/video player components for styling consistency
- Check authentication context for user role checks
- Review existing form components for validation patterns

### Libraries to Consider
- **React Hook Form**: For form management
- **React Query**: For API state management
- **Monaco Editor**: For code editor (code-submission questions)
- **React Markdown**: For rich text display
- **Framer Motion**: For animations

### Common Pitfalls
1. **Timer Management**: Use useEffect cleanup to prevent memory leaks
2. **State Updates**: Ensure answers array updates immutably
3. **API Errors**: Always handle errors and show user-friendly messages
4. **Validation**: Validate on both client and server
5. **Loading States**: Show loading indicators for better UX

---

## Conclusion

This guide provides the foundation for implementing the student-facing interactive content player. The backend API is fully functional and ready to support these frontend components. Follow the component structure and API integration patterns outlined here for a smooth implementation.

For questions or issues, refer to:
- Backend API documentation in controller files
- Requirements document for feature specifications
- Design document for data models and workflows
