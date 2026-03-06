# Payment Proof Upload Feature - Implementation Guide

## Overview
Students can upload payment proof screenshots which will appear in Admin Panel and Finance Dashboard for review and approval.

## Current Status
✅ **Backend Already Implemented:**
- Payment model has `screenshotUrl` field
- `createManualPayment` function exists in `paymentController.js`
- Route: `POST /api/payment/manual` (protected, student only)
- File upload using multer with `upload.single('screenshot')`
- Creates payment with status='pending'
- Generates transaction ID: `MAN-{timestamp}-{random}`

## What Needs to Be Added

### 1. Student UI - Upload Payment Proof Button

**Location:** `client/src/pages/student/PaymentHistory.jsx` or `MyCourses.jsx`

**Add Upload Modal:**
```jsx
import { Upload, Image } from 'lucide-react';

const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadData, setUploadData] = useState({
  courseId: '',
  amount: '',
  paymentMethod: 'bank_transfer',
  notes: '',
  screenshot: null
});
const [uploading, setUploading] = useState(false);

const handleUploadProof = async (e) => {
  e.preventDefault();
  if (!uploadData.screenshot) {
    showToast('Please select a screenshot', 'error');
    return;
  }

  setUploading(true);
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const formData = new FormData();
    formData.append('screenshot', uploadData.screenshot);
    formData.append('courseId', uploadData.courseId);
    formData.append('amount', uploadData.amount);
    formData.append('paymentMethod', uploadData.paymentMethod);
    formData.append('notes', uploadData.notes);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.post('/api/payment/manual', formData, config);
    
    showToast('Payment proof submitted successfully!', 'success');
    setShowUploadModal(false);
    fetchPaymentHistory(); // Refresh list
    
    // Emit socket event to notify admins
    socket?.emit('paymentProofUploaded', {
      transactionId: data.transactionId,
      studentName: userInfo.name
    });
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to upload proof', 'error');
  } finally {
    setUploading(false);
  }
};
```

**Upload Modal UI:**
```jsx
{showUploadModal && (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
    <GlassCard className="w-full max-w-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Upload Payment Proof</h3>
      <form onSubmit={handleUploadProof} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Select Course *</label>
          <select
            required
            value={uploadData.courseId}
            onChange={(e) => setUploadData({...uploadData, courseId: e.target.value})}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="">Choose course</option>
            {/* Map available courses */}
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Amount Paid *</label>
          <input
            type="number"
            required
            value={uploadData.amount}
            onChange={(e) => setUploadData({...uploadData, amount: e.target.value})}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Payment Method *</label>
          <select
            value={uploadData.paymentMethod}
            onChange={(e) => setUploadData({...uploadData, paymentMethod: e.target.value})}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Upload Screenshot *</label>
          <input
            type="file"
            required
            accept="image/*"
            onChange={(e) => setUploadData({...uploadData, screenshot: e.target.files[0]})}
            className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
          />
          <p className="text-xs text-white/40 mt-1">Upload payment receipt or screenshot</p>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Notes (optional)</label>
          <textarea
            value={uploadData.notes}
            onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="Add any additional information"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(false)}
            className="flex-1 py-2 text-white/70 hover:bg-white/5 rounded-lg"
          >
            Cancel
          </button>
          <ModernButton type="submit" disabled={uploading} className="flex-1">
            {uploading ? 'Uploading...' : 'Submit Proof'}
          </ModernButton>
        </div>
      </form>
    </GlassCard>
  </div>
)}
```

### 2. Admin Panel - View Payment Proofs

**Location:** Admin Dashboard or Finance Dashboard

**Add to Payment List:**
```jsx
// In payment table, add column for proof
<td className="px-6 py-4">
  {payment.screenshotUrl ? (
    <button
      onClick={() => viewProof(payment.screenshotUrl)}
      className="flex items-center gap-2 text-primary hover:text-primary/80"
    >
      <Image size={16} />
      View Proof
    </button>
  ) : (
    <span className="text-white/30 text-sm">No proof</span>
  )}
</td>
```

**Proof Viewer Modal:**
```jsx
const [proofModal, setProofModal] = useState({ open: false, url: '' });

const viewProof = (url) => {
  setProofModal({ open: true, url: `${import.meta.env.VITE_API_URL}/${url}` });
};

{proofModal.open && (
  <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
    <div className="relative max-w-4xl w-full">
      <button
        onClick={() => setProofModal({ open: false, url: '' })}
        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-lg"
      >
        <X size={24} />
      </button>
      <img
        src={proofModal.url}
        alt="Payment Proof"
        className="w-full h-auto rounded-lg"
      />
    </div>
  </div>
)}
```

### 3. Real-Time Updates via WebSocket

**Backend - Add to paymentController.js:**
```javascript
// After creating payment in createManualPayment
const socketService = require('../services/SocketService');
socketService.broadcastToAdmins('paymentProofUploaded', {
  paymentId: payment._id,
  studentName: student.name,
  courseName: course.title,
  amount: payment.amount,
  transactionId: payment.transactionId,
  timestamp: new Date()
});
```

**Frontend - Admin Dashboard:**
```jsx
import { useSocket } from '../../context/SocketContext';

const socket = useSocket();

useEffect(() => {
  if (!socket) return;

  const handlePaymentProofUploaded = (data) => {
    showToast(`New payment proof from ${data.studentName}`, 'info');
    fetchPayments(); // Refresh payment list
  };

  socket.on('paymentProofUploaded', handlePaymentProofUploaded);

  return () => {
    socket.off('paymentProofUploaded', handlePaymentProofUploaded);
  };
}, [socket]);
```

### 4. Finance Dashboard Integration

**Add Filter for Pending Proofs:**
```jsx
const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

const filteredPayments = payments.filter(p => {
  if (filter === 'pending') return p.status === 'pending' && p.screenshotUrl;
  if (filter === 'approved') return p.status === 'approved';
  if (filter === 'rejected') return p.status === 'rejected';
  return true;
});
```

**Add Approve/Reject Buttons:**
```jsx
const handleApprovePayment = async (paymentId) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    
    await axios.put(`/api/payment/${paymentId}/approve`, {}, config);
    showToast('Payment approved successfully', 'success');
    fetchPayments();
  } catch (error) {
    showToast('Failed to approve payment', 'error');
  }
};

const handleRejectPayment = async (paymentId, reason) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    
    await axios.put(`/api/payment/${paymentId}/reject`, { reason }, config);
    showToast('Payment rejected', 'info');
    fetchPayments();
  } catch (error) {
    showToast('Failed to reject payment', 'error');
  }
};
```

## Backend Endpoints Needed

### Approve Payment
```javascript
// Add to paymentController.js
const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const Payment = require('../models/paymentModel');
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name email')
     .populate('course', 'title');

    // Create enrollment if approved
    const Enrollment = require('../models/enrollmentModel');
    await Enrollment.create({
      student: payment.student._id,
      course: payment.course._id,
      status: 'active',
      progress: 0,
      enrollmentDate: new Date()
    });

    // Notify student
    const socketService = require('../services/SocketService');
    socketService.sendToUser(payment.student._id.toString(), 'paymentApproved', {
      courseName: payment.course.title,
      amount: payment.amount
    });

    res.json({ success: true, message: 'Payment approved', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Reject Payment
```javascript
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const Payment = require('../models/paymentModel');
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        notes: reason,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name email');

    // Notify student
    const socketService = require('../services/SocketService');
    socketService.sendToUser(payment.student._id.toString(), 'paymentRejected', {
      reason: reason
    });

    res.json({ success: true, message: 'Payment rejected', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Add Routes
```javascript
// In paymentRoutes.js
router.put('/:id/approve', protect, authorize('admin', 'finance'), approvePayment);
router.put('/:id/reject', protect, authorize('admin', 'finance'), rejectPayment);
```

## Summary

**Student Flow:**
1. Student goes to Payment History or My Courses
2. Clicks "Upload Payment Proof" button
3. Fills form: course, amount, payment method, screenshot, notes
4. Submits → Payment created with status='pending'
5. Receives confirmation toast

**Admin/Finance Flow:**
1. Receives real-time notification of new payment proof
2. Payment appears in Finance Dashboard with "Pending" status
3. Clicks "View Proof" to see screenshot
4. Reviews payment details
5. Clicks "Approve" or "Reject" with reason
6. Student receives notification of approval/rejection

**Real-Time Updates:**
- Student uploads → Admin/Finance notified instantly
- Admin approves/rejects → Student notified instantly
- Payment list auto-refreshes for all users

## Files to Modify

1. `client/src/pages/student/PaymentHistory.jsx` - Add upload modal
2. `client/src/pages/admin/PaymentMonitoringDashboard.jsx` - Add proof viewer
3. `server/controllers/paymentController.js` - Add approve/reject functions
4. `server/routes/paymentRoutes.js` - Add approve/reject routes
5. Add WebSocket events for real-time updates

## Testing Checklist

- [ ] Student can upload payment proof
- [ ] Screenshot is saved correctly
- [ ] Admin receives real-time notification
- [ ] Admin can view screenshot
- [ ] Admin can approve payment
- [ ] Admin can reject payment with reason
- [ ] Student receives approval/rejection notification
- [ ] Enrollment is created on approval
- [ ] Finance dashboard shows pending proofs
- [ ] Payment history updates in real-time
