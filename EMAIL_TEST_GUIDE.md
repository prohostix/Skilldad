# Email Notification Test Guide

## Quick Email Test

I've added a test endpoint to verify your email configuration is working.

### Test on Production (Render):

**URL**: `https://skilldad-server.onrender.com/api/test-email?email=YOUR_EMAIL@gmail.com`

Replace `YOUR_EMAIL@gmail.com` with your actual email address.

### How to Test:

1. **Open your browser** and visit:
   ```
   https://skilldad-server.onrender.com/api/test-email?email=your.email@gmail.com
   ```

2. **Check the response**:
   - ✅ **Success**: You'll see JSON with `"success": true` and email will arrive in your inbox
   - ❌ **Failure**: You'll see error details showing what's wrong

3. **Check your email inbox** (including spam folder)

### Expected Success Response:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "sentTo": "your.email@gmail.com",
  "messageId": "...",
  "timestamp": "2024-..."
}
```

### Expected Failure Response (if email config is wrong):
```json
{
  "success": false,
  "message": "Failed to send test email",
  "error": "Authentication failed",
  "details": {
    "code": "EAUTH",
    "command": "AUTH PLAIN"
  },
  "configuration": {
    "EMAIL_HOST": "Set",
    "EMAIL_PORT": "Set",
    "EMAIL_USER": "Set",
    "EMAIL_PASSWORD": "Set"
  }
}
```

---

## Common Issues & Solutions:

### Issue 1: "Authentication failed" (EAUTH)
**Cause**: Using regular Gmail password instead of App Password

**Solution**:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Generate App Password for "Mail"
5. Update `EMAIL_PASSWORD` on Render with the 16-character app password
6. Redeploy (happens automatically)

### Issue 2: "Connection timeout" (ETIMEDOUT)
**Cause**: Wrong EMAIL_HOST or EMAIL_PORT

**Solution**:
- For Gmail: `EMAIL_HOST=smtp.gmail.com` and `EMAIL_PORT=465`
- For other providers, check their SMTP settings

### Issue 3: "Email configuration missing"
**Cause**: Environment variables not set on Render

**Solution**:
1. Go to Render Dashboard → skilldad-server → Environment
2. Add all EMAIL_* variables
3. Save (auto-redeploys)

### Issue 4: Email sent but not received
**Possible causes**:
- Email went to spam folder (check spam)
- Wrong recipient email address
- Email provider blocking

**Solution**:
- Check spam/junk folder
- Try different email address
- Check Render logs for "Email sent successfully" message

---

## Check Render Logs:

1. Go to https://dashboard.render.com/
2. Select `skilldad-server`
3. Click "Logs" tab
4. Look for these messages:

**Success indicators**:
```
Email transporter verified successfully
Email sent successfully: <message-id>
```

**Failure indicators**:
```
Email configuration missing
Error sending email: [error details]
Authentication failed
```

---

## Verify Email Variables on Render:

1. Go to https://dashboard.render.com/
2. Select `skilldad-server`
3. Click "Environment"
4. Verify these variables exist and have correct values:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=support@skilldad.com
```

---

## After Fixing Issues:

Once the test email works:

1. **Remove the test endpoint** (for security):
   - Delete `server/routes/testEmailRoute.js`
   - Remove the route from `server/server.js`
   - Commit and push

2. **Test real payment flow**:
   - Make a test payment
   - Check if confirmation email arrives
   - Verify email contains transaction details

3. **Monitor production**:
   - Check Render logs for email sending
   - Verify customers are receiving emails
   - Monitor for any email failures

---

## Alternative: Use SendGrid (Recommended for Production)

If Gmail continues to have issues, switch to SendGrid:

1. **Sign up**: https://sendgrid.com/
2. **Get API Key**: Settings → API Keys
3. **Update Render variables**:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   EMAIL_FROM=support@yourdomain.com
   ```
4. **Verify domain** (optional but recommended)

SendGrid is more reliable for production and has better deliverability.

---

## Summary:

✅ **Email system is implemented correctly**
✅ **Test endpoint added for verification**
⚠️ **Need to verify email credentials on Render**

**Next Steps**:
1. Test using the URL above
2. Check response and logs
3. Fix any authentication issues
4. Verify email arrives in inbox
5. Remove test endpoint after verification

---

**Need Help?**
- Check Render logs for detailed error messages
- Verify Gmail App Password is correct
- Try SendGrid if Gmail doesn't work
- Check spam folder for test emails
