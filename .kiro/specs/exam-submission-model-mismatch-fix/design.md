# Exam Submission Model Mismatch Bugfix Design

## Overview

This bugfix addresses a critical data isolation issue where student exam submissions are written to the ExamSubmissionNew model collection but university retrieval endpoints read from the old ExamSubmission model collection. This causes universities to see "NO SUBMISSIONS YET" even when students have successfully submitted exams. The fix involves updating two university-facing functions (`getSubmissionsForExam` and `getSubmissionForGrading`) to query the ExamSubmissionNew model, aligning them with the student submission endpoints.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when universities attempt to fetch exam submissions that were written to ExamSubmissionNew but the query targets the old ExamSubmission model
- **Property (P)**: The desired behavior - universities should retrieve all submissions from the same collection (ExamSubmissionNew) that students write to
- **Preservation**: All student submission functionality (submitAnswer, uploadAnswerSheet, submitExam) and other university functions (gradeSubmission, getMySubmission) that already use ExamSubmissionNew must remain unchanged
- **ExamSubmissionNew**: The current model used for student submissions, located in `server/models/examSubmissionNewModel.js`
- **ExamSubmission**: The old/legacy model that should no longer be used for active submissions
- **getSubmissionsForExam**: Function in `server/controllers/examSubmissionController.js` that fetches all submissions for an exam (university view)
- **getSubmissionForGrading**: Function in `server/controllers/examSubmissionController.js` that fetches a single submission's details for grading

## Bug Details

### Fault Condition

The bug manifests when a university user attempts to view exam submissions through the "Grade Submissions" tab or fetch submission details for grading. The `getSubmissionsForExam` function queries the old ExamSubmission model collection while students write to ExamSubmissionNew, creating a data isolation issue where submissions exist but are invisible to the query.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { examId: string, userId: string, userRole: string }
  OUTPUT: boolean
  
  RETURN (input.userRole IN ['university', 'admin'])
         AND submissionsExistInExamSubmissionNew(input.examId)
         AND queryTargetsExamSubmission(input.examId)
         AND NOT submissionsExistInExamSubmission(input.examId)
END FUNCTION
```

### Examples

- **Example 1**: Student submits exam via `/api/exam-submissions/:submissionId/submit` → writes to ExamSubmissionNew → University views "Grade Submissions" tab → `getSubmissionsForExam` queries ExamSubmission (old) → returns empty array → displays "NO SUBMISSIONS YET"

- **Example 2**: Student completes exam and clicks "Submit" → submission saved to ExamSubmissionNew with status 'submitted' → University clicks "View Submissions" for that exam → query finds 0 results in ExamSubmission collection → UI shows no submissions available

- **Example 3**: University attempts to grade a specific submission via `/api/exam-submissions/:submissionId` → `getSubmissionForGrading` queries ExamSubmission (old) → returns 404 or incorrect data → grading interface fails to load

- **Edge Case**: If old submissions exist in ExamSubmission collection but new submissions are in ExamSubmissionNew, the university would only see the old submissions and miss all recent ones

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Student submission functions (submitAnswer, uploadAnswerSheet, submitExam) must continue to write to ExamSubmissionNew
- The gradeSubmission function must continue to use ExamSubmissionNew for updating grades
- The getMySubmission function must continue to use ExamSubmissionNew for student self-retrieval
- Socket notifications for exam submissions must continue to work
- Authorization checks validating university access must continue to work
- Pagination, filtering, and sorting functionality must continue to work
- Auto-grading for MCQ exams must continue to work
- Audit logging for submission events must continue to work

**Scope:**
All inputs that do NOT involve university retrieval of exam submissions should be completely unaffected by this fix. This includes:
- Student submission workflows (answer saving, file uploads, exam finalization)
- Student viewing their own submissions
- Grading operations (manual and auto-grading)
- Any other endpoints or functions not explicitly modified

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Model Import Mismatch**: The controller file imports both `ExamSubmission` (old) and `ExamSubmissionNew` models, but the university retrieval functions use the wrong one
   - Line 3: `const ExamSubmission = require('../models/examSubmissionModel');`
   - Lines 289, 303: `getSubmissionsForExam` uses `ExamSubmission.find()` and `ExamSubmission.countDocuments()`
   - Line 391: `getSubmissionForGrading` uses `ExamSubmission.findById()`

2. **Inconsistent Model Usage**: Student-facing functions correctly use ExamSubmissionNew (lines 18, 73, 145, 349), but university-facing functions use the old model

3. **Legacy Code Retention**: The old ExamSubmission model was kept for "backward compatibility" (line 3 comment) but is now causing data isolation

4. **Field Mapping Complexity**: The `getSubmissionsForExam` function includes field mapping logic (lines 310-322) to convert old model fields to new format, suggesting awareness of the model difference but incorrect implementation

## Correctness Properties

Property 1: Fault Condition - University Retrieves Submissions from Correct Collection

_For any_ request where a university user fetches exam submissions via `getSubmissionsForExam` or `getSubmissionForGrading`, and submissions exist in the ExamSubmissionNew collection for that exam, the fixed functions SHALL query the ExamSubmissionNew model and return all matching submissions with correct data.

**Validates: Requirements 2.2, 2.3, 2.4**

Property 2: Preservation - Student Submission Behavior Unchanged

_For any_ student submission operation (submitAnswer, uploadAnswerSheet, submitExam, getMySubmission), the fixed code SHALL produce exactly the same behavior as the original code, continuing to use the ExamSubmissionNew model and preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.5**

Property 3: Preservation - Grading and Other Operations Unchanged

_For any_ grading operation (gradeSubmission) or other non-retrieval operations, the fixed code SHALL produce exactly the same behavior as the original code, continuing to use the ExamSubmissionNew model and preserving all existing functionality including socket notifications, authorization checks, pagination, and audit logging.

**Validates: Requirements 3.4, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

**File**: `server/controllers/examSubmissionController.js`

**Functions to Modify**: `getSubmissionsForExam` and `getSubmissionForGrading`

**Specific Changes**:

1. **Update getSubmissionsForExam (lines 271-327)**:
   - Change line 289: Replace `ExamSubmission.find(filter)` with `ExamSubmissionNew.find(filter)`
   - Change line 303: Replace `ExamSubmission.countDocuments(filter)` with `ExamSubmissionNew.countDocuments(filter)`
   - Update field mapping (lines 310-322): Remove mapping logic since ExamSubmissionNew already has correct field names
   - Update populate and select statements to match ExamSubmissionNew schema fields

2. **Update getSubmissionForGrading (lines 367-453)**:
   - Change line 391: Replace `ExamSubmission.findById(submissionId)` with `ExamSubmissionNew.findById(submissionId)`
   - Update populate statements to match ExamSubmissionNew schema
   - Simplify field mapping logic (lines 410-434) since ExamSubmissionNew has consistent field names
   - Update response formatting to use ExamSubmissionNew field names directly

3. **Remove Unnecessary Field Mapping**:
   - ExamSubmissionNew uses `submittedAt` (not `endTime`)
   - ExamSubmissionNew uses `obtainedMarks` (not `score`)
   - ExamSubmissionNew has `answers` array with proper structure
   - Remove conversion logic that maps old fields to new fields

4. **Verify Schema Compatibility**:
   - Ensure all populated fields exist in ExamSubmissionNew schema
   - Ensure all selected fields match ExamSubmissionNew field names
   - Ensure response format matches what the frontend expects

5. **Optional Cleanup**:
   - Consider removing the `ExamSubmission` import if no longer used
   - Add comment explaining why ExamSubmissionNew is the correct model to use

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by verifying the query targets the wrong collection, then verify the fix works correctly by confirming queries target ExamSubmissionNew and preserve all existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that university retrieval functions query the wrong collection while student submissions write to the correct collection.

**Test Plan**: Create test submissions in ExamSubmissionNew, then call university retrieval endpoints and verify they fail to find the submissions (because they query ExamSubmission). Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Empty Submissions List Test**: Create submission in ExamSubmissionNew → Call `getSubmissionsForExam` → Verify returns empty array (will fail on unfixed code)
2. **Submission Not Found Test**: Create submission in ExamSubmissionNew → Call `getSubmissionForGrading` with submission ID → Verify returns 404 (will fail on unfixed code)
3. **Model Mismatch Test**: Verify `getSubmissionsForExam` uses `ExamSubmission.find()` in source code (will confirm on unfixed code)
4. **Collection Isolation Test**: Insert submission directly into ExamSubmissionNew collection → Query both collections → Verify ExamSubmission is empty while ExamSubmissionNew has data (will confirm on unfixed code)

**Expected Counterexamples**:
- University endpoints return empty results or 404 errors when submissions exist in ExamSubmissionNew
- Code inspection shows `ExamSubmission` model is used instead of `ExamSubmissionNew`
- Database queries confirm data exists in ExamSubmissionNew collection but not in ExamSubmission collection

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (university fetching submissions), the fixed functions query ExamSubmissionNew and return correct data.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := getSubmissionsForExam_fixed(input.examId)
  ASSERT result.submissions.length > 0
  ASSERT result.submissions[0].student EXISTS
  ASSERT result.submissions[0].submittedAt EXISTS
  ASSERT queryUsesExamSubmissionNew(input.examId)
END FOR
```

**Test Cases**:
1. **Submissions List Retrieved**: Create submission in ExamSubmissionNew → Call fixed `getSubmissionsForExam` → Verify returns submission with correct fields
2. **Submission Details Retrieved**: Create submission in ExamSubmissionNew → Call fixed `getSubmissionForGrading` → Verify returns submission with answers and student data
3. **Pagination Works**: Create 25 submissions → Call with page=1, limit=20 → Verify returns 20 submissions and correct pagination metadata
4. **Status Filtering Works**: Create submissions with different statuses → Call with status='submitted' → Verify only submitted submissions returned
5. **Authorization Works**: Create submission for exam owned by university A → Call as university B → Verify returns 403 error

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (student submissions, grading operations), the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT submitAnswer_original(input) = submitAnswer_fixed(input)
  ASSERT uploadAnswerSheet_original(input) = uploadAnswerSheet_fixed(input)
  ASSERT submitExam_original(input) = submitExam_fixed(input)
  ASSERT gradeSubmission_original(input) = gradeSubmission_fixed(input)
  ASSERT getMySubmission_original(input) = getMySubmission_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-university-retrieval operations

**Test Plan**: Run existing tests for student submission functions on UNFIXED code to capture baseline behavior, then run same tests on FIXED code to verify identical behavior.

**Test Cases**:
1. **Student Answer Submission Preserved**: Submit answer via `submitAnswer` → Verify writes to ExamSubmissionNew and returns success (same as before fix)
2. **File Upload Preserved**: Upload answer sheet via `uploadAnswerSheet` → Verify writes to ExamSubmissionNew and stores file URL (same as before fix)
3. **Exam Finalization Preserved**: Submit exam via `submitExam` → Verify updates status to 'submitted' in ExamSubmissionNew (same as before fix)
4. **Grading Preserved**: Grade submission via `gradeSubmission` → Verify updates ExamSubmissionNew with marks and feedback (same as before fix)
5. **Student Self-Retrieval Preserved**: Get own submission via `getMySubmission` → Verify queries ExamSubmissionNew and returns correct data (same as before fix)
6. **Auto-Grading Preserved**: Submit MCQ exam → Verify auto-grading service is triggered and updates ExamSubmissionNew (same as before fix)
7. **Audit Logging Preserved**: Perform any submission operation → Verify audit log is created (same as before fix)

### Unit Tests

- Test `getSubmissionsForExam` returns submissions from ExamSubmissionNew
- Test `getSubmissionsForExam` with pagination (page, limit parameters)
- Test `getSubmissionsForExam` with status filtering (submitted, graded)
- Test `getSubmissionsForExam` with sorting (submittedAt)
- Test `getSubmissionsForExam` authorization (university owns exam)
- Test `getSubmissionForGrading` returns submission from ExamSubmissionNew
- Test `getSubmissionForGrading` with populated fields (exam, student, answers)
- Test `getSubmissionForGrading` authorization (university owns exam)
- Test edge case: exam with no submissions returns empty array
- Test edge case: invalid exam ID returns 404

### Property-Based Tests

- Generate random exam IDs and verify `getSubmissionsForExam` queries ExamSubmissionNew collection
- Generate random submission IDs and verify `getSubmissionForGrading` queries ExamSubmissionNew collection
- Generate random student submission operations and verify they continue to use ExamSubmissionNew
- Generate random grading operations and verify they continue to use ExamSubmissionNew
- Test that all field names in responses match ExamSubmissionNew schema across many scenarios

### Integration Tests

- Test full flow: Student submits exam → University views submissions list → Submission appears correctly
- Test full flow: Student submits exam → University views submission details → All answers and data appear correctly
- Test full flow: Student submits exam → University grades submission → Grade is saved to ExamSubmissionNew
- Test switching between student and university views with same exam
- Test that old ExamSubmission collection is not queried after fix (monitor database queries)
