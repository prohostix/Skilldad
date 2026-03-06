# Exam Creation 400 Error Fix

## Issue
Admin users were unable to schedule exams, receiving a 400 (Bad Request) error when attempting to create an exam.

## Root Cause
The exam creation route (`POST /api/exams`) was still using the old `instructor` field instead of the correct `createdBy` field from the Exam schema. This caused validation errors and prevented exam creation.

## Solution
Updated all references in the exam creation route to use the correct schema fields:
- `instructor` → `createdBy`
- Added proper `university` field assignment

## Files Modified

### `server/routes/examRoutes.js`

#### 1. Exam Object Creation (Line ~497)
**Before:**
```javascript
const examObj = {
    ...rest,
    course,
    instructor: req.user._id,
    totalPoints: Number(totalPoints || totalMarks || 100),
    passingScore: Number(req.body.passingScore || req.body.passingMarks || 70)
};
```

**After:**
```javascript
const examObj = {
    ...rest,
    course,
    createdBy: req.user._id,
    university: req.user.role === 'university' ? req.user._id : targetUniversity,
    totalPoints: Number(totalPoints || totalMarks || 100),
    passingScore: Number(req.body.passingScore || req.body.passingMarks || 70)
};
```

#### 2. Populate After Save (Line ~514)
**Before:**
```javascript
savedExam = await savedExam.populate([
    { path: 'course', select: 'title' },
    { path: 'targetUniversity', select: 'name profile' },
    { path: 'instructor', select: 'name email profile' }
]);
```

**After:**
```javascript
savedExam = await savedExam.populate([
    { path: 'course', select: 'title' },
    { path: 'targetUniversity', select: 'name profile' },
    { path: 'createdBy', select: 'name email profile' }
]);
```

#### 3. University Validation Logic (Lines ~453-492)
**Before:**
```javascript
matchingAdminSlot = await Exam.findOne({
    _id: slotId,
    instructor: { $in: adminIds },
    course: course,
    // ...
});

// and

matchingAdminSlot = await Exam.findOne({
    instructor: { $in: adminIds },
    course: course,
    // ...
});

// and

const allSlots = await Exam.find({ instructor: { $in: adminIds }, course: course });
```

**After:**
```javascript
matchingAdminSlot = await Exam.findOne({
    _id: slotId,
    createdBy: { $in: adminIds },
    course: course,
    // ...
});

// and

matchingAdminSlot = await Exam.findOne({
    createdBy: { $in: adminIds },
    course: course,
    // ...
});

// and

const allSlots = await Exam.find({ createdBy: { $in: adminIds }, course: course });
```

## Exam Schema Reference

The correct Exam model schema (`server/models/examModel.js`):
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

## Impact
- Admins can now successfully create and schedule exams
- University users can schedule exams within admin-mandated slots
- Proper creator tracking via `createdBy` field
- Proper university assignment via `university` field

## Testing Checklist
- [x] Admin can create new exam
- [x] Exam is saved with correct `createdBy` field
- [x] Exam is saved with correct `university` field
- [ ] University can schedule exam in admin-mandated slot
- [ ] Validation prevents university from scheduling outside mandated slots
- [ ] Exam details populate correctly after creation
- [ ] Students receive notifications when exam is published

## Related Fixes
This fix is part of a series of changes to align the codebase with the actual Exam schema:
1. Fixed populate calls in GET routes (EXAM_INSTRUCTOR_POPULATE_FIX.md)
2. Added `strictPopulate: false` to mongoose config
3. Fixed exam creation route (this document)

## Notes
- The `createdBy` field tracks who created the exam (admin or university user)
- The `university` field tracks which university the exam belongs to
- For admin-created exams, `university` can be set to a specific university or left as the target university
- For university-created exams, `university` is automatically set to the creating university's ID
