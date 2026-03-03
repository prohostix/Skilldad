# SendGrid Email Setup Guide

## Why SendGrid?

SendGrid is more reliable than Gmail SMTP for production applications because:
- ✅ No IPv6 connectivity issues
- ✅ Better deliverability rates
- ✅ Free tier: 100 emails/day forever
- ✅ Easy to set up and manage
- ✅ Detailed analytics and tracking
- ✅ No 2FA or app password requirements

## Step-by-Step Setup

### 1. Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Fill in your details:
   - Email address
   - Password
   - Company name (can be "SkillDad" or your name)
3. Verify your email address
4. Complete the onboarding questionnaire

### 2. Create API Key

1. After logging in, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Configure the API key:
   - **Name**: `SkillDad Production`
   - **API Key Permissions**: Select **"Full Access"** (or "Restricted Access" with Mail Send permissions)
4. Click **"Create & View"**
5. **IMPORTANT**: Copy the API key immediately and save it securely
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

### 3. Verify Sender Identity

SendGrid requires you to verify the email address you'll send from:

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in the form:
   - **From Name**: `SkillDad`
   - **From Email Address**: `noreply@skilldad.com` (or use your Gmail if you don't have a custom domain)
   - **Reply To**: `support@skilldad.com` (or your support email)
   - **Company Address**: Your address
   - **City, State, Zip, Country**: Your location
4. Click **"Create"**
5. Check your email and click the verification link
6. Wait for approval (usually instant, but can take up to 24 hours)

**Note**: If you don't have a custom domain, you can use your Gmail address (e.g., `yourname@gmail.com`) as the sender.

### 4. Configure Render Environment Variables

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click on your backend service (skilldad-server)
3. Go to **Environment** tab
4. Add these environment variables:

```
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM=noreply@skilldad.com
EMAIL_SERVICE=sendgrid
```

**Important**: 
- Replace `SG.your_actual_api_key_here` with your actual SendGrid API key
- Replace `noreply@skilldad.com` with the email address you verified in Step 3
- Make sure `EMAIL_SERVICE` is set to exactly `sendgrid` (lowercase)

5. Click **"Save Changes"**
6. Render will automatically redeploy your service

### 5. Test the Integration

After Render finishes deploying (2-3 minutes):

1. Go to your admin panel
2. Try inviting a new user
3. Check if the email is sent successfully
4. Check the user's inbox (and spam folder)

### 6. Monitor Email Delivery

1. Go to SendGrid dashboard → **Activity**
2. You can see all sent emails, delivery status, and any errors
3. If emails are going to spam, you may need to set up domain authentication (optional, for better deliverability)

## Troubleshooting

### Email still not sending?

1. **Check Render logs**:
   - Go to Render dashboard → Your service → Logs
   - Look for `[SendGrid]` messages
   - Check for any error messages

2. **Verify environment variables**:
   - Make sure `SENDGRID_API_KEY` is set correctly
   - Make sure `EMAIL_SERVICE=sendgrid` (exactly, lowercase)
   - Make sure `EMAIL_FROM` matches your verified sender

3. **Check SendGrid dashboard**:
   - Go to Activity tab
   - See if emails are being received by SendGrid
   - Check for any errors or bounces

4. **Verify sender identity**:
   - Make sure the email address in `EMAIL_FROM` is verified in SendGrid
   - Check Settings → Sender Authentication

### Common Errors

**Error: "The from address does not match a verified Sender Identity"**
- Solution: Make sure `EMAIL_FROM` matches exactly the email you verified in Step 3

**Error: "Unauthorized"**
- Solution: Check that your API key is correct and has Mail Send permissions

**Error: "API key not found"**
- Solution: Make sure `SENDGRID_API_KEY` environment variable is set on Render

## Alternative: Using Gmail as Sender

If you don't have a custom domain, you can use your Gmail address:

1. In Step 3, verify your Gmail address (e.g., `yourname@gmail.com`)
2. Set `EMAIL_FROM=yourname@gmail.com` in Render environment variables
3. Emails will be sent from your Gmail address via SendGrid

## Upgrading SendGrid Plan

The free tier (100 emails/day) should be sufficient for most use cases. If you need more:

- **Essentials Plan**: $19.95/month for 50,000 emails
- **Pro Plan**: $89.95/month for 100,000 emails
- **Premier Plan**: Custom pricing for higher volumes

## Support

If you need help:
- SendGrid Documentation: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com/
- SkillDad Support: Check the logs and share them for debugging

## Fallback to Gmail SMTP

If SendGrid doesn't work for any reason, the system will automatically fall back to Gmail SMTP if you have those environment variables configured:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

But SendGrid is strongly recommended for production use!
