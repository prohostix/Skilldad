# Delete Test University (university@test.com)

## Method 1: Run the Cleanup Script (Recommended)

I've created a script to safely delete the test university user.

### Steps:

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Run the script:**
   ```bash
   node scripts/deleteTestUniversity.js
   ```

3. **Expected output:**
   ```
   Connected to MongoDB
   Found user: {
     id: [user_id],
     name: Tech University,
     email: university@test.com,
     role: university
   }
   ✅ Successfully deleted user: university@test.com
   ✅ Verified: User has been removed from database
   ```

## Method 2: MongoDB Shell

If you prefer using MongoDB shell directly:

1. **Connect to MongoDB:**
   ```bash
   mongosh "your_connection_string"
   ```

2. **Switch to your database:**
   ```javascript
   use your_database_name
   ```

3. **Delete the user:**
   ```javascript
   db.users.deleteOne({ email: "university@test.com" })
   ```

4. **Verify deletion:**
   ```javascript
   db.users.findOne({ email: "university@test.com" })
   // Should return null
   ```

## Method 3: MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `users` collection
4. Find the document with email: "university@test.com"
5. Click the trash icon to delete
6. Confirm deletion

## Method 4: Using Admin Panel (If Delete Feature Exists)

1. Login as admin
2. Go to Admin Panel → Universities
3. Find "Tech University" (university@test.com)
4. Click delete button
5. Confirm deletion

## Important Notes

⚠️ **Before Deleting:**
- This will permanently delete the user account
- Any courses, exams, or sessions created by this university will remain but will be orphaned
- Students enrolled in courses from this university will keep their enrollments

⚠️ **Related Data:**
You may also want to clean up:
- Courses where this university is the instructor
- Exams scheduled by this university
- Live sessions created by this university
- Enrollments in their courses

## Cleanup Related Data (Optional)

If you want to also remove all related data, run these MongoDB commands:

```javascript
// Get the university user ID first
const uni = db.users.findOne({ email: "university@test.com" })
const uniId = uni._id

// Delete courses
db.courses.deleteMany({ instructor: uniId })

// Delete exams
db.exams.deleteMany({ university: uniId })

// Delete live sessions
db.livesessions.deleteMany({ instructor: uniId })

// Finally delete the user
db.users.deleteOne({ email: "university@test.com" })
```

## Verification

After deletion, verify the user is gone:

```bash
# Using the script
node scripts/deleteTestUniversity.js

# Or in MongoDB shell
db.users.findOne({ email: "university@test.com" })
// Should return null
```

## Troubleshooting

**Script fails to connect:**
- Check your `.env` file has correct `MONGO_URI`
- Ensure MongoDB is running
- Check network connectivity

**User not found:**
- Verify the email is exactly "university@test.com"
- Check if user was already deleted
- Verify you're connected to the correct database

**Permission denied:**
- Ensure your MongoDB user has delete permissions
- Check database access rights
