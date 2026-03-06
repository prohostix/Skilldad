# Exam Instructor Populate Error Fix

## Issue
When loading exam details, the application was throwing an error:
```
Error Loading Exam
Cannot populate path 'instructor' because it is not in your schema. Set the 'strictPopulate' option to false to override.
```

## Root Cause
The `Exam` model schema doesn't have an `instructor` field. The schema has:
- `createdBy` - References the user who created the exam
- `university` - References the university
- `course` - References the course

However, the exam routes were trying to populate an `instructor` field that doesn't exist in the schema.

## Solution
Replaced all `.populate('instructor', ...)` calls with `.populate('createdBy', ...)` in the exam routes.

## Files Modified

### `server/routes/examRoutes.js`

#### 1. Get exams by course ID (Line ~263)
**Before:**
```javascript
const exams = await Exam.find({
    course: req.params.courseId,
    isPublished: true
}).populate('instructor', 'name email');
```

**After:**
```javascript
const exams = await Exam.find({
    course: req.params.courseId,
    isPublished: true
}).populate('createdBy', 'name email');
```

#### 2. Get student's exams (Line ~289)
**Before:**
```javascript
const exams = await Exam.find({
    course: { $in: courseIds },
    isPublished: true
}).populate('course', 'title')
    .populate('instructor', 'name')
    .populate('linkedPaper')
    .populate('answerKey');
```

**After:**
```javascript
const exams = await Exam.find({
    course: { $in: courseIds },
    isPublished: true
}).populate('course', 'title')
    .populate('createdBy', 'name')
    .populate('linkedPaper')
    .populate('answerKey');
```

#### 3. Get exam by ID (Line ~347)
**Before:**
```javascript
const exam = await Exam.findById(req.params.id)
    .populate('course', 'title')
    .populate('instructor', 'name email');
```

**After:**
```javascript
const exam = await Exam.findById(req.params.id)
    .populate('course', 'title')
    .populate('createdBy', 'name email');
```

## Exam Schema Reference

For reference, the Exam model (`server/models/examModel.js`) has these relationship fields:
```javascript
{
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}
```

## Testing
- [x] Exam details page loads without errors
- [x] Exam list displays correctly
- [x] Creator information is populated correctly
- [ ] Verify exam creation still works
- [ ] Verify exam editing still works
- [ ] Verify student can view their exams

## Impact
This fix resolves the "Error Loading Exam" issue and allows:
- University users to view exam details
- Students to see their assigned exams
- Proper display of exam creator information

## Notes
- The `createdBy` field contains the user who created the exam (typically a university admin or instructor)
- If you need to display instructor information, you should populate it from the `course` relationship instead:
  ```javascript
  .populate({
    path: 'course',
    select: 'title instructor',
    populate: { path: 'instructor', select: 'name email' }
  })
  ```
