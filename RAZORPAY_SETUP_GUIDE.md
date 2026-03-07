# Razorpay Integration Setup Guide

## Quick Setup (5 Steps)

### Step 1: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Generate API Keys (you'll get Key ID and Key Secret)
5. For webhooks: Go to **Settings** → **Webhooks** → Generate webhook secret

### Step 2: Update Environment Variables

Open `server/.env` and update these values:

```env
# Razorpay Payment Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
RAZORPAY_SUCCESS_URL=http://localhost:5173/dashboard/payment-callback?status=success
RAZORPAY_CANCEL_URL=http://localhost:5173/dashboard/payment-callback?status=cancel
```

**For Testing (Test Mode):**
- Use keys starting with `rzp_test_`
- Example: `rzp_test_1234567890abcd`

**For Production (Live Mode):**
- Use keys starting with `rzp_live_`
- Example: `rzp_live_1234567890abcd`

### Step 3: Configure Webhook (Important!)

1. Go to [Razorpay Webhooks](https://dashboard.razorpay.com/app/webhooks)
2. Click **Create New Webhook**
3. Enter webhook URL: `https://your-domain.com/api/payment/webhook`
   - For local testing: Use ngrok or similar tool to expose localhost
   - Example: `https://abc123.ngrok.io/api/payment/webhook`
4. Select events to listen:
   - ✓ `payment.captured`
   - ✓ `payment.failed`
   - ✓ `order.paid`
5. Set **Active** to ON
6. Copy the webhook secret and add to `.env`

### Step 4: Restart Your Server

```bash
cd server
npm start
```

The server will automatically load the new Razorpay credentials.

### Step 5: Test Payment Flow

1. Start both frontend and backend:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. Navigate to a course and click "Enroll" or "Buy Now"
3. You'll see the Razorpay checkout modal
4. Use test card details (see below)

## Test Card Details (Test Mode Only)

### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name

### Failed Payment
- **Card Number**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI
- **UPI ID**: `success@razorpay`
- **UPI ID (Failure)**: `failure@razorpay`

## Verify Integration

### Check Backend Logs
Look for these messages in server console:
```
✓ Razorpay initialized with key: rzp_test_xxxxx
✓ Payment order created: order_xxxxx
✓ Payment verified successfully
✓ Course unlocked for user
```

### Check Database
After successful payment, verify:
1. Transaction status changed to `completed`
2. `razorpay_order_id` and `razorpay_payment_id` are saved
3. Enrollment record created with `paymentStatus: 'completed'`

## Troubleshooting

### Issue: "Razorpay key not found"
**Solution**: Check that `RAZORPAY_KEY_ID` is set in `.env` and server is restarted

### Issue: "Payment verification failed"
**Solution**: 
- Check `RAZORPAY_KEY_SECRET` is correct
- Ensure signature verification is working
- Check server logs for detailed error

### Issue: "Webhook not receiving events"
**Solution**:
- For local testing, use ngrok: `ngrok http 3030`
- Update webhook URL in Razorpay dashboard with ngrok URL
- Ensure webhook secret matches `.env`

### Issue: "Course not unlocking after payment"
**Solution**:
- Check transaction status in database
- Verify enrollment record was created
- Check server logs for errors in payment callback

## Production Deployment Checklist

Before going live:

- [ ] Replace test keys with live keys (`rzp_live_`)
- [ ] Update webhook URL to production domain (HTTPS required)
- [ ] Test with real payment methods
- [ ] Enable payment methods in Razorpay dashboard:
  - Cards (Credit/Debit)
  - UPI
  - Net Banking
  - Wallets (Paytm, PhonePe, etc.)
- [ ] Set up payment notifications/emails
- [ ] Configure refund policy in Razorpay dashboard
- [ ] Enable 2FA for Razorpay account
- [ ] Set up monitoring and alerts

## Payment Flow Overview

```
1. User clicks "Enroll" → Frontend calls /api/payment/initiate
2. Backend creates Razorpay order → Returns order_id
3. Frontend opens Razorpay checkout modal
4. User completes payment → Razorpay processes payment
5. Frontend receives success → Calls /api/payment/callback
6. Backend verifies signature → Unlocks course
7. Razorpay sends webhook → Backend confirms payment
```

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhooks**: https://razorpay.com/docs/webhooks/

## Current Status

✓ Razorpay integration is **FULLY IMPLEMENTED**
✓ Backend service ready
✓ Frontend checkout ready
✓ Webhook handling ready
✓ Transaction management ready

**You just need to add your credentials to `.env` and restart the server!**
