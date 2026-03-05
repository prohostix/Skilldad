# Admin Delete User Feature

## Overview
Added the ability for admins to delete any user directly from the admin panel's user list.

## Changes Made

### 1. Backend Changes

#### Controller (`server/controllers/adminController.js`)
Added new `deleteUser` function:
- **Route**: `DELETE /api/admin/users/:id`
- **Access**: Private (Admin only)
- **Features**:
  - Finds user by ID
  - Prevents admin from deleting their own account
  - Deletes user from database
  - Sends WebSocket notification to update all admin panels in real-time
  - Returns deleted user info for confirmation

#### Routes (`server/routes/adminRoutes.js`)
- Added `deleteUser` to imports
- Added route: `router.delete('/users/:id', protect, checkAdmin, deleteUser)`

### 2. Frontend Changes

#### User List Component (`client/src/pages/admin/UserList.jsx`)
- **Added Trash2 icon** import from lucide-react
- **Added handleDeleteUser function**:
  - Shows confirmation dialog with user name and email
  - Calls DELETE API endpoint
  - Shows success/error toast notification
  - Refreshes user list
  - WebSocket automatically updates the list in real-time

- **Added Delete Button** in the actions column:
  - Red styling to indicate destructive action
  - Trash icon with "Delete" label
  - Appears for all users in the list
  - Hover effect for better UX

### 3. Real-time Updates
- When a user is deleted, WebSocket notifies all connected admin panels
- User is automatically removed from the list without manual refresh
- Toast notification confirms successful deletion

## Security Features

1. **Admin-only access**: Only admins can delete users
2. **Self-protection**: Admins cannot delete their own account
3. **Confirmation dialog**: Requires explicit confirmation before deletion
4. **Audit trail**: Deletion is logged via WebSocket notifications

## User Experience

### Delete Flow:
1. Admin navigates to Admin Panel → Users
2. Finds the user to delete (e.g., university@test.com)
3. Clicks the red "Delete" button
4. Confirmation dialog appears: "Are you sure you want to delete [Name] ([Email])? This action cannot be undone."
5. Admin clicks "OK" to confirm
6. User is deleted from database
7. Success toast appears: "User [Name] deleted successfully"
8. User disappears from the list immediately
9. All other admin panels update in real-time via WebSocket

## API Endpoint

```
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>

Response (Success):
{
  "message": "User deleted successfully",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}

Response (Error - Self-deletion):
{
  "message": "You cannot delete your own account"
}

Response (Error - Not found):
{
  "message": "User not found"
}
```

## Testing

1. **Delete Test University**:
   - Login as admin
   - Go to Admin Panel → Users
   - Find "Tech University" (university@test.com)
   - Click "Delete" button
   - Confirm deletion
   - User is removed from list

2. **Self-deletion Prevention**:
   - Try to delete your own admin account
   - Should show error: "You cannot delete your own account"

3. **Real-time Update**:
   - Open admin panel in two browser windows
   - Delete a user in one window
   - User should disappear from both windows immediately

## UI Components

### Delete Button Styling:
- Background: `bg-red-500/20`
- Text: `text-red-400`
- Border: `border-red-500/30`
- Hover: `hover:bg-red-500/30`
- Icon: Trash2 (14px)
- Label: "Delete"

### Confirmation Dialog:
- Native browser confirm dialog
- Message: "Are you sure you want to delete [Name] ([Email])? This action cannot be undone."

### Toast Notifications:
- Success: Green toast with message "User [Name] deleted successfully"
- Error: Red toast with error message

## Related Features

This delete functionality complements:
- Grant Permission button
- Revoke Permission button
- Invite User feature
- Real-time user list updates via WebSocket

## Future Enhancements

- Add soft delete (mark as deleted instead of permanent deletion)
- Add restore deleted users feature
- Add bulk delete functionality
- Add delete confirmation with password
- Add detailed audit log for deletions
- Add ability to delete related data (courses, exams, etc.)
