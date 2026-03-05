# Authentication 401 Error Fix

## Problem

Users were experiencing 401 (Unauthorized) errors when accessing admin pages like UserList and ExamScheduler. The errors indicated that API requests were failing due to missing or invalid authentication tokens.

## Root Cause

The issue occurred when:
1. User's JWT token expired
2. User's token was invalid or corrupted
3. User was not logged in but somehow bypassed the ProtectedRoute check
4. localStorage had stale or invalid authentication data

## Solution Implemented

### 1. Global Axios Interceptor (`client/src/utils/axiosConfig.js`)

Created a global axios interceptor that:
- Catches all 401 (Unauthorized) responses
- Automatically clears invalid authentication data from localStorage
- Redirects users to the login page with a session expired message
- Prevents multiple redirects by checking current path

```javascript
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);
```

### 2. Enhanced Login Page

Updated `client/src/pages/Login.jsx` to:
- Detect session expiration from URL query parameter
- Display a user-friendly message: "Your session has expired. Please log in again."
- Clear any error messages when user starts typing

### 3. Improved Error Handling in Components

Updated `client/src/pages/admin/UserList.jsx` and `client/src/pages/admin/ExamScheduler.jsx` to:
- Check for userInfo and token before making API requests
- Redirect to login if authentication data is missing
- Handle 401 errors gracefully with proper logging
- Prevent unnecessary API calls when not authenticated

### 4. App.jsx Integration

Added import for axios configuration in `client/src/App.jsx`:
```javascript
import './utils/axiosConfig'; // Setup axios interceptors for 401 handling
```

This ensures the interceptor is loaded when the app starts.

## How It Works

### Before Fix:
1. User tries to access admin page
2. API request fails with 401
3. Error is logged to console
4. Page shows empty data or error message
5. User is confused and doesn't know what to do

### After Fix:
1. User tries to access admin page
2. API request fails with 401
3. Axios interceptor catches the error
4. Authentication data is cleared
5. User is automatically redirected to login page
6. Login page shows: "Your session has expired. Please log in again."
7. User logs in and is redirected back to their intended page

## Testing

To test the fix:

1. **Test Session Expiration:**
   - Log in as admin
   - Manually corrupt the token in localStorage: `localStorage.setItem('userInfo', '{"token":"invalid"}')`
   - Navigate to `/admin/users`
   - Should automatically redirect to login with session expired message

2. **Test Missing Token:**
   - Clear localStorage: `localStorage.clear()`
   - Try to access `/admin/users`
   - Should redirect to login

3. **Test Normal Flow:**
   - Log in with valid credentials
   - Access admin pages
   - Should work normally

## Files Modified

1. **Created:**
   - `client/src/utils/axiosConfig.js` - Global axios interceptor

2. **Modified:**
   - `client/src/App.jsx` - Added axios config import
   - `client/src/pages/Login.jsx` - Added session expired message
   - `client/src/pages/admin/UserList.jsx` - Enhanced error handling
   - `client/src/pages/admin/ExamScheduler.jsx` - Enhanced error handling

## Benefits

1. **Better User Experience:** Users are automatically redirected to login instead of seeing cryptic errors
2. **Security:** Invalid tokens are immediately cleared from localStorage
3. **Consistency:** All 401 errors are handled the same way across the app
4. **Debugging:** Better logging helps identify authentication issues
5. **Maintainability:** Centralized error handling reduces code duplication

## Next Steps

To fully resolve the current issue, the user needs to:

1. **Clear browser cache and localStorage:**
   - Open browser DevTools (F12)
   - Go to Application tab → Storage → Clear site data
   - Or manually: `localStorage.clear()`

2. **Log in again:**
   - Go to `/login`
   - Enter valid credentials
   - System will create a new valid token

3. **Verify fix:**
   - Access admin pages
   - Should work without 401 errors

## Prevention

To prevent this issue in the future:

1. **Token Refresh:** Consider implementing token refresh mechanism
2. **Token Expiration:** Set appropriate token expiration times
3. **Session Management:** Implement proper session management
4. **Error Monitoring:** Add error tracking (e.g., Sentry) to catch authentication issues early

## Additional Notes

- The axios interceptor runs globally for all axios requests
- It only redirects on 401 errors, not other error codes
- The session expired message is only shown when redirected from a 401 error
- Users can still manually navigate to login page without seeing the message
