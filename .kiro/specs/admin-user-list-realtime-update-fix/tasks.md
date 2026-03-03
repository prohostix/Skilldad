# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Race Condition Between WebSocket and Manual Fetch
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the race condition exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case - invite action where WebSocket event arrives before POST response completes
  - Test that when a user is invited, the WebSocket event is received and processed, but the subsequent fetchUsers() call overwrites the state
  - Add extensive logging to track: WebSocket event received → State updated by WebSocket → fetchUsers() called → State overwritten
  - Test implementation: Invite a new user and verify through console logs that the race condition occurs (WebSocket update followed by fetchUsers() overwrite)
  - The test assertions should verify: newUserNotVisibleInUI() returns true on unfixed code
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: "User 'John Doe' invited, WebSocket event received and state updated, but fetchUsers() overwrites state and user not visible until manual refresh"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [-] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Invite WebSocket Behavior and Manual Refresh
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (update, delete actions, manual refresh)
  - Test Case 1: Update user role via WebSocket - observe that user list updates correctly in real-time
  - Test Case 2: Delete user via WebSocket - observe that user is removed from list in real-time
  - Test Case 3: Auto-refresh after 30 seconds - observe that user list refreshes correctly
  - Test Case 4: Manual page refresh - observe that user list loads correctly
  - Test Case 5: Search and filter functionality - observe that these features work correctly
  - Write property-based tests capturing observed behavior patterns: for all non-invite actions, WebSocket updates work correctly and manual refresh mechanisms remain functional
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Fix for race condition in user invite flow

  - [ ] 3.1 Implement the fix in UserList.jsx
    - Remove the redundant `await fetchUsers()` call on line 283 in handleInviteUser function
    - Rely on WebSocket `userListUpdate` event with action='created' to update the state automatically
    - Add fallback timeout (2 seconds) to verify user was added, and if not, call fetchUsers() manually
    - Verify WebSocket connection is active before relying on it; if disconnected, fall back to manual fetch
    - _Bug_Condition: isBugCondition(input) where input.action === 'invite' AND websocketEventEmitted(input.userId) AND postRequestInFlight() AND fetchUsersCalledAfterResponse() AND newUserNotVisibleInUI()_
    - _Expected_Behavior: For any invite action where a new user is successfully created and a WebSocket event is emitted, the frontend user list SHALL immediately display the newly created user without requiring a manual page refresh_
    - _Preservation: WebSocket updates for 'updated' and 'deleted' actions, 30-second auto-refresh, manual page refresh, invite modal functionality, email sending, toast notifications, and user list filtering/sorting/search must remain unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Immediate User List Update on Invite
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify that user appears in list immediately after invite without manual refresh
    - Verify console logs show WebSocket update is processed and NOT overwritten by fetchUsers()
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Invite WebSocket Behavior and Manual Refresh
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify WebSocket updates for 'updated' and 'deleted' actions still work correctly
    - Verify 30-second auto-refresh still works
    - Verify manual page refresh still works
    - Verify search and filter functionality still works
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run all tests (exploration test + preservation tests)
  - Verify user invite flow works correctly with immediate list update
  - Verify no regressions in existing WebSocket behavior or manual refresh mechanisms
  - Test with multiple admins viewing the list simultaneously
  - Test with slow network conditions (throttle to 3G)
  - Test with WebSocket disconnected (should fall back to manual fetch)
  - Ensure all tests pass, ask the user if questions arise
