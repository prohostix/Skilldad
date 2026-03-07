# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - University Retrieves Submissions from Wrong Collection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - university fetching submissions that exist in ExamSubmissionNew but query targets ExamSubmission
  - Test that when submissions exist in ExamSubmissionNew for an exam, `getSubmissionsForExam` returns empty array (because it queries wrong collection)
  - Test that when submission exists in ExamSubmissionNew, `getSubmissionForGrading` returns 404 or null (because it queries wrong collection)
  - Verify code inspection shows `ExamSubmission.find()` and `ExamSubmission.findById()` are used instead of `ExamSubmissionNew`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: "University endpoints return empty/404 when submissions exist in ExamSubmissionNew collection"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Student Submission and Grading Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for student submission operations (submitAnswer, uploadAnswerSheet, submitExam)
  - Observe behavior on UNFIXED code for grading operations (gradeSubmission)
  - Observe behavior on UNFIXED code for student self-retrieval (getMySubmission)
  - Write property-based tests capturing observed behavior patterns:
    - For all student submission operations, verify writes to ExamSubmissionNew
    - For all grading operations, verify updates ExamSubmissionNew
    - For all student self-retrieval operations, verify queries ExamSubmissionNew
    - Verify socket notifications, authorization checks, pagination, and audit logging work
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Fix university retrieval functions to query ExamSubmissionNew

  - [x] 3.1 Update getSubmissionsForExam function
    - Change line 289: Replace `ExamSubmission.find(filter)` with `ExamSubmissionNew.find(filter)`
    - Change line 303: Replace `ExamSubmission.countDocuments(filter)` with `ExamSubmissionNew.countDocuments(filter)`
    - Remove field mapping logic (lines 310-322) since ExamSubmissionNew already has correct field names
    - Update populate and select statements to match ExamSubmissionNew schema fields
    - Verify response format matches frontend expectations
    - _Bug_Condition: isBugCondition(input) where input.userRole IN ['university', 'admin'] AND submissionsExistInExamSubmissionNew(input.examId) AND queryTargetsExamSubmission(input.examId)_
    - _Expected_Behavior: Query ExamSubmissionNew and return all matching submissions with correct data_
    - _Preservation: Student submission functions (submitAnswer, uploadAnswerSheet, submitExam) continue to use ExamSubmissionNew; grading operations continue to use ExamSubmissionNew; authorization, pagination, socket notifications, and audit logging continue to work_
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.2 Update getSubmissionForGrading function
    - Change line 391: Replace `ExamSubmission.findById(submissionId)` with `ExamSubmissionNew.findById(submissionId)`
    - Update populate statements to match ExamSubmissionNew schema
    - Simplify field mapping logic (lines 410-434) since ExamSubmissionNew has consistent field names
    - Update response formatting to use ExamSubmissionNew field names directly
    - Verify all populated fields exist in ExamSubmissionNew schema
    - _Bug_Condition: isBugCondition(input) where input.userRole IN ['university', 'admin'] AND submissionExistsInExamSubmissionNew(input.submissionId) AND queryTargetsExamSubmission(input.submissionId)_
    - _Expected_Behavior: Query ExamSubmissionNew and return submission with answers and student data_
    - _Preservation: Student submission functions continue to use ExamSubmissionNew; grading operations continue to use ExamSubmissionNew_
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Optional cleanup
    - Consider removing the `ExamSubmission` import if no longer used anywhere in the file
    - Add comment explaining why ExamSubmissionNew is the correct model to use
    - Verify no other functions in the file use the old ExamSubmission model

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - University Retrieves Submissions from Correct Collection
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify `getSubmissionsForExam` returns submissions when they exist in ExamSubmissionNew
    - Verify `getSubmissionForGrading` returns submission details when they exist in ExamSubmissionNew
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Student Submission and Grading Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all student submission operations still work correctly
    - Confirm all grading operations still work correctly
    - Confirm socket notifications, authorization, pagination, and audit logging still work
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
