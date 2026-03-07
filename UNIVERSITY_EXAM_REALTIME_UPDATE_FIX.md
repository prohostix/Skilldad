# University Exam Real-Time Update Fix

## Problem
When a university scheduled an exam, it was not updating in real-time in the student panel. Students had to manually refresh the page to see newly scheduled exams.

## Root Causes
1. **Backend Route Authorization**: The `/api/exams/admin/schedule` route only allowed `admin` role, not `university` role
2. **Frontend Socket Listener Missing**: The `StudentExamList` component was not listening for the `EXAM_SCHEDULED` socket event

## Solution Implemented

### 1. Backend Route Authorization Fix
**File**: `server/routes/examRoutes.js`

Updated the following routes to allow both `admin` and `university` roles:
- `POST /api/exams/admin/schedule` - Schedule new exam
- `PUT /api/exams/admin/:examId` - Update exam details
- `DELETE /api/exams/admin/:examId` - Delete exam
- `GET /api/exams/admin/all` - Get all exams

**Changes**:
```javascript
// Before
authorize('admin')

// After
authorize('admin', 'university')
```

### 2. Frontend Real-Time Socket Listener
**File**: `client/src/components/StudentExamList.jsx`

Added socket listener to automatically refresh exam list when new exams are scheduled:

**Changes**:
1. Imported `useSocket` hook from SocketContext
2. Added socket listener for `EXAM_SCHEDULED` event
3. Auto-refreshes exam list when event is received
4. Shows toast notification to student

```javascript
useEffect(() => {
    if (!socket) return;

    const handleExamScheduled = (data) => {
        console.log('[StudentExamList] Received EXAM_SCHEDULED event:', data);
        showToast(`New exam scheduled: ${data.examTitle}`, 'success');
        fetchExams(); // Refresh exam list
    };

    socket.on('EXAM_SCHEDULED', handleExamScheduled);

    return () => {
        socket.off('EXAM_SCHEDULED', handleExamScheduled);
    };
}, [socket]);
```

## How It Works Now

### When University Schedules an Exam:
1. University calls `POST /api/exams/admin/schedule` (now authorized)
2. Backend creates exam in database
3. Backend sends socket notification to all enrolled students:
   ```javascript
   socketService.emitToUser(studentId, 'EXAM_SCHEDULED', {
       examId: exam._id,
       examTitle: exam.title,
       courseId: exam.course._id,
       courseTitle: exam.course.title,
       scheduledStartTime: exam.scheduledStartTime,
       scheduledEndTime: exam.scheduledEndTime,
       duration: exam.duration,
       totalMarks: exam.totalMarks,
       examType: exam.examType,
       message: `New exam scheduled: ${exam.title}`
   });
   ```
4. Student's browser receives socket event
5. `StudentExamList` component automatically refreshes exam list
6. Student sees new exam immediately without page refresh
7. Toast notification appears: "New exam scheduled: [Exam Title]"

## Testing

### Test Scenario 1: University Schedules Exam
1. Login as university user
2. Navigate to exam scheduling page
3. Schedule a new exam for a course
4. Verify exam is created successfully

### Test Scenario 2: Student Receives Real-Time Update
1. Login as student (enrolled in the course)
2. Navigate to "My Exams" page
3. Keep page open
4. Have university schedule a new exam
5. Verify:
   - Toast notification appears
   - Exam list automatically refreshes
   - New exam appears without manual refresh

## Files Modified
1. `server/routes/examRoutes.js` - Updated authorization for exam routes
2. `client/src/components/StudentExamList.jsx` - Added socket listener for real-time updates

## Related Features
- Email notifications (already working)
- WhatsApp notifications (already working)
- Socket notifications (now working for students)
- Admin enrollment notifications (already working)

## Status
✅ **FIXED** - Universities can now schedule exams and students receive real-time updates in their panel.
