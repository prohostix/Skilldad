# Razorpay Payment Gateway - Deployment Guide

## Migration Status: ✅ COMPLETE

The Razorpay payment gateway migration is complete and ready for deployment. All Stripe dependencies have been removed and replaced with Razorpay integration.

## Pre-Deployment Checklist

### 1. Environment Variables Configuration

Ensure the following Razorpay environment variables are set in your production environment:

```bash
# Razorpay Credentials (REQUIRED)
RAZORPAY_KEY_ID=your_production_key_id
RAZORPAY_KEY_SECRET=your_production_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Where to get these:**
- Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Go to Settings → API Keys
- Generate production keys (or use test keys for staging)
- Save webhook secret from Settings → Webhooks

### 2. Webhook Configuration

Configure Razorpay webhooks to point to your production server:

**Webhook URL:** `https://your-domain.com/api/payment/webhook`

**Required Events:**
- `payment.captured` - When payment is successfully captured
- `payment.failed` - When payment fails

**Setup Steps:**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. Enter your webhook URL
4. Select the required events above
5. Save the webhook secret to your environment variables

**Detailed Guide:** See `server/docs/RAZORPAY_WEBHOOK_SETUP.md`

### 3. Database Migration

Run the database migration to add Razorpay fields to existing transactions:

```bash
cd server
node scripts/migrations/add-razorpay-fields.js
```

**What it does:**
- Adds `razorpayPaymentId`, `razorpaySignature` fields
- Updates `paymentMethod` enum to match Razorpay values
- Backward compatible - preserves existing data

### 4. Code Verification

All implementation files have been verified with no syntax errors:

✅ `server/services/payment/RazorpayGatewayService.js` - Core payment service
✅ `server/controllers/paymentController.js` - Payment endpoints
✅ `client/src/components/payment/RazorpayCheckout.jsx` - Frontend checkout
✅ `client/src/pages/student/PaymentInitiation.jsx` - Payment initiation
✅ `server/models/payment/Transaction.js` - Updated schema
✅ Server syntax check passed

### 5. Stripe Cleanup Verification

All Stripe references have been removed:

✅ Deleted `server/services/payment/StripeGatewayService.js`
✅ Removed Stripe packages from `package.json` files
✅ Updated `README.md` to reference Razorpay
✅ Updated `RENDER_ENV_VARIABLES.md` with Razorpay credentials
✅ Updated `AdminConfigController.js` to use Razorpay
✅ No Stripe references in production code (only in spec files and security checks)

## Deployment Steps

### For Render.com

1. **Update Environment Variables:**
   - Go to Render Dashboard → Your Service → Environment
   - Add the three Razorpay environment variables listed above
   - Remove old Stripe variables if present
   - Save changes (Render will auto-redeploy)

2. **Verify Deployment:**
   - Check deployment logs for any errors
   - Test the `/api/payment/initiate` endpoint
   - Verify webhook endpoint is accessible: `https://your-domain.com/api/payment/webhook`

3. **Configure Webhooks:**
   - Follow webhook configuration steps above
   - Test webhook delivery from Razorpay dashboard

### For Other Platforms

1. Set environment variables in your platform's dashboard
2. Deploy the updated code
3. Run database migration script
4. Configure Razorpay webhooks
5. Test payment flow

## Testing in Production

### Test Mode (Recommended First)

Use Razorpay test credentials to verify the integration:

1. Set test mode credentials in environment variables
2. Use test payment methods from [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
3. Verify payment flow end-to-end
4. Check webhook events are received and processed

**Test Credentials:**
- Test cards: 4111 1111 1111 1111 (any CVV, future expiry)
- Test UPI: success@razorpay
- Test netbanking: Select any test bank

### Live Mode

After successful testing:

1. Switch to live mode credentials
2. Test with small real transaction
3. Verify course unlocking works
4. Check transaction records in database
5. Monitor logs for any errors

## Payment Methods Supported

The integration supports all Razorpay payment methods:

- 💳 **Cards** - Credit/Debit cards (Visa, Mastercard, RuPay, Amex)
- 📱 **UPI** - All UPI apps (Google Pay, PhonePe, Paytm, etc.)
- 🏦 **Netbanking** - All major Indian banks
- 👛 **Wallets** - Paytm, PhonePe, Mobikwik, etc.
- 💰 **EMI** - Card EMI and Cardless EMI
- 🔄 **Pay Later** - LazyPay, Simpl, etc.

## Security Features

✅ **Signature Verification** - All payments verified using HMAC SHA256
✅ **Webhook Validation** - Webhook signatures verified before processing
✅ **Timing-Safe Comparison** - Uses `crypto.timingSafeEqual` to prevent timing attacks
✅ **Secure Credentials** - All keys stored in environment variables
✅ **Idempotency** - Duplicate webhook events handled gracefully
✅ **Comprehensive Logging** - All payment attempts logged for audit

## Monitoring and Logs

Monitor these key areas after deployment:

1. **Payment Initiation:**
   - Check logs for Razorpay order creation
   - Verify order_id and key_id are returned

2. **Payment Completion:**
   - Monitor signature verification logs
   - Check course unlocking after successful payment

3. **Webhook Events:**
   - Verify webhook events are received
   - Check transaction status updates

4. **Error Handling:**
   - Monitor for API errors from Razorpay
   - Check user-facing error messages

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting to previous deployment
2. Restoring Stripe environment variables
3. Re-deploying Stripe code from git history

**Note:** The database migration is backward compatible, so no rollback needed for schema changes.

## Support and Documentation

- **Razorpay Docs:** https://razorpay.com/docs/
- **API Reference:** https://razorpay.com/docs/api/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhook Guide:** `server/docs/RAZORPAY_WEBHOOK_SETUP.md`
- **Environment Variables:** `server/docs/ENVIRONMENT_VARIABLES.md`

## Post-Deployment Verification

After deployment, verify:

- [ ] Environment variables are set correctly
- [ ] Webhook URL is configured in Razorpay dashboard
- [ ] Test payment completes successfully
- [ ] Course unlocks after successful payment
- [ ] Transaction record is created in database
- [ ] Webhook events are received and processed
- [ ] Error handling works correctly
- [ ] All payment methods work (UPI, Cards, Netbanking, Wallets)

## Contact

For issues or questions during deployment, refer to:
- Razorpay Support: https://razorpay.com/support/
- Internal documentation in `server/docs/`

---

**Migration Completed:** 2024
**Status:** Production Ready ✅
