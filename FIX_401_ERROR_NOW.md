# Fix 401 Error - Quick Solution

## Your Issue

You're seeing 401 (Unauthorized) errors when trying to access admin pages. This means your authentication token is invalid or expired.

## Quick Fix (2 minutes)

### Option 1: Clear and Re-login (Easiest)

1. **Open browser DevTools:**
   - Press `F12` or `Ctrl+Shift+I`

2. **Clear localStorage:**
   - Go to "Console" tab
   - Type: `localStorage.clear()`
   - Press Enter

3. **Refresh the page:**
   - Press `F5` or `Ctrl+R`

4. **Log in again:**
   - You'll be redirected to login page
   - Use your admin credentials:
     - Email: `admin@skilldad.com`
     - Password: `123456`

5. **Done!** You should now be able to access all admin pages.

### Option 2: Manual localStorage Fix

1. **Open DevTools** (`F12`)
2. **Go to Application tab**
3. **Click "Storage" → "Local Storage" → your domain**
4. **Delete these items:**
   - `userInfo`
   - `token`
5. **Refresh page** (`F5`)
6. **Log in again**

## What I Fixed

I've implemented automatic handling for this issue:

1. **Global Error Handler:** Now when you get a 401 error, you'll automatically be redirected to login
2. **Session Expired Message:** You'll see a clear message: "Your session has expired. Please log in again."
3. **Better Error Handling:** All admin pages now check for valid authentication before making requests

## Why This Happened

Your JWT authentication token either:
- Expired (tokens have a limited lifetime)
- Got corrupted in localStorage
- Was invalidated on the server

## After You Log In

Everything should work normally:
- ✅ User List will load
- ✅ Exam Scheduler will load
- ✅ All admin features will work
- ✅ Future 401 errors will auto-redirect you to login

## Still Having Issues?

If you still see 401 errors after logging in:

1. **Check server is running:**
   ```bash
   cd server
   npm start
   ```

2. **Check MongoDB is running:**
   - Use the batch script: `start_mongodb_with_data.bat`
   - Or: `net start MongoDB`

3. **Verify your credentials:**
   - Make sure you're using the correct admin email and password

4. **Check server logs:**
   - Look for authentication errors in the server console

## Files I Modified

- ✅ `client/src/utils/axiosConfig.js` - Created global 401 handler
- ✅ `client/src/App.jsx` - Added axios interceptor
- ✅ `client/src/pages/Login.jsx` - Added session expired message
- ✅ `client/src/pages/admin/UserList.jsx` - Better error handling
- ✅ `client/src/pages/admin/ExamScheduler.jsx` - Better error handling

## Technical Details

See `AUTHENTICATION_401_FIX.md` for complete technical documentation.
