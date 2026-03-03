# Bugfix Requirements Document

## Introduction

The admin panel's user list fails to automatically update when a new user is invited, despite successful user creation in the database and proper WebSocket event emission. Admins must manually refresh the page to see newly invited users, breaking the real-time update functionality. This bug affects the admin workflow and creates confusion about whether the invitation was successful.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin successfully invites a new user through the "Invite User" modal THEN the user list on the admin panel does not display the newly created user

1.2 WHEN the backend emits a `userListUpdate` WebSocket event after user creation THEN the frontend does not update the user list UI in response to this event

1.3 WHEN the frontend calls `fetchUsers()` immediately after successful invitation THEN the user list UI does not refresh to show the new user

1.4 WHEN a new user is created and the admin remains on the user list page THEN the new user only appears after a manual page refresh

### Expected Behavior (Correct)

2.1 WHEN an admin successfully invites a new user through the "Invite User" modal THEN the system SHALL immediately display the newly created user in the user list without requiring a page refresh

2.2 WHEN the backend emits a `userListUpdate` WebSocket event after user creation THEN the system SHALL update the user list UI to reflect the new user

2.3 WHEN the frontend calls `fetchUsers()` immediately after successful invitation THEN the system SHALL refresh the user list UI to display the new user

2.4 WHEN a new user is created and the admin remains on the user list page THEN the system SHALL show the new user in the list within 1-2 seconds without manual intervention

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the admin manually refreshes the page THEN the system SHALL CONTINUE TO display all users including newly invited ones

3.2 WHEN the 30-second polling interval triggers THEN the system SHALL CONTINUE TO fetch and display updated user data

3.3 WHEN a user is invited and the invitation email fails THEN the system SHALL CONTINUE TO display the success message with the appropriate warning about email failure

3.4 WHEN WebSocket events are received for other admin operations THEN the system SHALL CONTINUE TO handle those events correctly

3.5 WHEN the user list is initially loaded on page mount THEN the system SHALL CONTINUE TO fetch and display all existing users correctly
