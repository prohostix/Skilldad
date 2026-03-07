# Bugfix Requirements Document

## Introduction

The university panel displays "NO SUBMISSIONS YET" even when students have successfully submitted exams. This occurs because the student submission endpoint writes to the ExamSubmissionNew model collection, while the university retrieval endpoint reads from the old ExamSubmission model collection. This model mismatch creates a data isolation issue where submissions exist in the database but are invisible to universities attempting to grade them.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a student submits an exam via `/api/exam-submissions/:submissionId/submit` THEN the system writes the submission to the ExamSubmissionNew model collection

1.2 WHEN a university fetches submissions via `/api/submissions/exam/:examId` using the `getSubmissionsForExam` function THEN the system queries the old ExamSubmission model collection

1.3 WHEN a university views the "Grade Submissions" tab after students have submitted exams THEN the system displays "NO SUBMISSIONS YET" because the query returns zero results from the wrong collection

1.4 WHEN a university attempts to view submission details for grading via `/api/exam-submissions/:submissionId` using the `getSubmissionForGrading` function THEN the system queries the old ExamSubmission model and returns 404 or incorrect data

### Expected Behavior (Correct)

2.1 WHEN a student submits an exam via `/api/exam-submissions/:submissionId/submit` THEN the system SHALL write the submission to the ExamSubmissionNew model collection

2.2 WHEN a university fetches submissions via `/api/submissions/exam/:examId` using the `getSubmissionsForExam` function THEN the system SHALL query the ExamSubmissionNew model collection (same collection as student writes)

2.3 WHEN a university views the "Grade Submissions" tab after students have submitted exams THEN the system SHALL display all submitted exams with student name, email, status, submission time, and grading options

2.4 WHEN a university attempts to view submission details for grading via `/api/exam-submissions/:submissionId` using the `getSubmissionForGrading` function THEN the system SHALL query the ExamSubmissionNew model and return the correct submission data

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the `submitAnswer` function auto-saves student answers THEN the system SHALL CONTINUE TO use the ExamSubmissionNew model

3.2 WHEN the `uploadAnswerSheet` function saves PDF answer sheets THEN the system SHALL CONTINUE TO use the ExamSubmissionNew model

3.3 WHEN the `submitExam` function finalizes exam submission THEN the system SHALL CONTINUE TO use the ExamSubmissionNew model

3.4 WHEN the `gradeSubmission` function grades a submission THEN the system SHALL CONTINUE TO use the ExamSubmissionNew model

3.5 WHEN the `getMySubmission` function retrieves a student's own submission THEN the system SHALL CONTINUE TO use the ExamSubmissionNew model

3.6 WHEN socket notifications are sent for exam submissions THEN the system SHALL CONTINUE TO send the `EXAM_SUBMISSION_RECEIVED` notification

3.7 WHEN authorization checks validate university access to exam submissions THEN the system SHALL CONTINUE TO verify the university owns the exam

3.8 WHEN pagination and filtering are applied to submission lists THEN the system SHALL CONTINUE TO support status filtering, sorting, and page limits
