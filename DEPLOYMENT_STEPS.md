# Complete Deployment Guide - GitHub → Vercel → Render

## What's Being Deployed:

✅ Enhanced B2B partner invitation emails with credentials
✅ Partner logos seed script and admin endpoint
✅ Razorpay payment integration (complete)
✅ Email notification system improvements

---

## Step 1: Push to GitHub

Run these commands in your terminal:

```bash
# Check current status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add B2B partner features: invitation emails, logos seed, Razorpay integration"

# Push to GitHub
git push origin main
```

**Expected Output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/your-username/your-repo.git
   abc1234..def5678  main -> main
```

---

## Step 2: Vercel (Frontend) - Automatic Deployment

Vercel will automatically detect your push and deploy.

### Monitor Deployment:

1. Go to https://vercel.com/dashboard
2. Select your project (skilldad-client or similar)
3. Check "Deployments" tab
4. Wait for "Building" → "Ready" (1-2 minutes)

### Verify Deployment:

- ✅ Status shows "Ready"
- ✅ Visit your frontend URL
- ✅ Check browser console for errors

**Frontend URL**: https://your-app.vercel.app

---

## Step 3: Render (Backend) - Automatic Deployment

Render will automatically detect your push and deploy.

### Monitor Deployment:

1. Go to https://dashboard.render.com/
2. Select `skilldad-server`
3. Check "Events" tab
4. Wait for "Deploy succeeded" (2-3 minutes)

### Check Logs:

1. Click "Logs" tab
2. Look for:
   ```
   Server running on port 3030
   MongoDB connected successfully
   ```

**Backend URL**: https://skilldad-server.onrender.com

---

## Step 4: Seed Partner Logos (Production)

After Render deployment completes, add the sample companies.

### Option A: Using API Endpoint (Easiest)

1. **Login as Admin** on your platform
2. **Get your admin token** from browser DevTools:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Copy the value of `token`

3. **Call the seed endpoint**:

**Using Browser (Easiest)**:
- Open a new tab
- Paste this URL (replace YOUR_TOKEN):
```
https://skilldad-server.onrender.com/api/admin/partner-logos/seed
```
- You'll need to send a POST request with Authorization header

**Using cURL**:
```bash
curl -X POST https://skilldad-server.onrender.com/api/admin/partner-logos/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Using Postman**:
- Method: POST
- URL: `https://skilldad-server.onrender.com/api/admin/partner-logos/seed`
- Headers:
  - `Authorization: Bearer YOUR_ADMIN_TOKEN`
  - `Content-Type: application/json`
- Click Send

**Expected Response**:
```json
{
  "success": true,
  "message": "Successfully seeded 9 partner logos",
  "partners": [
    { "name": "TechCorp Solutions", "order": 1 },
    { "name": "Global Innovations Ltd", "order": 2 },
    ...
  ]
}
```

### Option B: Using Render Shell

1. Go to Render Dashboard → skilldad-server
2. Click "Shell" tab (top right)
3. Run:
   ```bash
   node scripts/seedPartnerLogos.js
   ```

### Option C: Run Locally Then Sync

1. Run locally:
   ```bash
   cd server
   node scripts/seedPartnerLogos.js
   ```
2. Data will be added to your production MongoDB (if using same database)

---

## Step 5: Verify Everything Works

### Test 1: B2B Partner Invitation Email

1. Login as admin
2. Go to User Management
3. Click "Invite User"
4. Fill in:
   - Name: Test Partner
   - Email: your.email@gmail.com
   - Password: TempPass123
   - Role: Partner
5. Click Invite
6. **Check email inbox** - should receive professional welcome email with credentials

### Test 2: Partner Logos

1. Go to Admin Panel → B2B Partners (or Landing Assets)
2. Should see 9 companies:
   - TechCorp Solutions
   - Global Innovations Ltd
   - Digital Dynamics Inc
   - Enterprise Systems Group
   - CloudTech Partners
   - DataFlow Corporation
   - NextGen Technologies
   - Smart Solutions International
   - Innovate Labs

### Test 3: Email System

1. Visit: `https://skilldad-server.onrender.com/api/test-email?email=your.email@gmail.com`
2. Should receive test email
3. Confirms email system is working

---

## Step 6: Add Real Company Logos (Optional)

The seed script uses placeholder logo paths. To add real logos:

### Method 1: Upload via Admin UI

1. Go to B2B Partners page
2. Click edit icon on each company
3. Upload actual logo file
4. Save

### Method 2: Add Logo Files to Repository

1. Add logo PNG files to: `client/public/assets/logos/`
2. File names:
   - `techcorp.png`
   - `global-innovations.png`
   - `digital-dynamics.png`
   - etc.
3. Commit and push:
   ```bash
   git add client/public/assets/logos/
   git commit -m "Add partner company logos"
   git push origin main
   ```
4. Vercel will auto-deploy with logos

---

## Troubleshooting

### Issue 1: Git Push Fails

**Error**: "Permission denied" or "Authentication failed"

**Solution**:
```bash
# Check remote URL
git remote -v

# If using HTTPS, you may need to update credentials
git config --global credential.helper store

# Try push again
git push origin main
```

### Issue 2: Vercel Deployment Fails

**Check**:
- Go to Vercel Dashboard → Deployments
- Click on failed deployment
- Check build logs for errors
- Common issues:
  - Missing environment variables
  - Build command errors
  - Node version mismatch

**Solution**:
- Fix errors shown in logs
- Push fix to GitHub
- Vercel will auto-retry

### Issue 3: Render Deployment Fails

**Check**:
- Go to Render Dashboard → Events
- Click on failed deployment
- Check logs for errors

**Common Issues**:
- Missing environment variables
- MongoDB connection failed
- Port binding issues

**Solution**:
- Verify all environment variables are set
- Check MongoDB URI is correct
- Check Render logs for specific error

### Issue 4: Seed Endpoint Returns 401 Unauthorized

**Cause**: Invalid or missing admin token

**Solution**:
1. Login as admin on your platform
2. Get fresh token from browser DevTools
3. Use the new token in your request

### Issue 5: Companies Not Showing

**Possible Causes**:
- Seed didn't run successfully
- Frontend not fetching data
- API endpoint issue

**Solution**:
1. Check seed endpoint response (should show success)
2. Check browser console for API errors
3. Verify MongoDB has the data (use MongoDB Compass)
4. Refresh the page

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] GitHub shows latest commit
- [ ] Vercel deployment succeeded
- [ ] Render deployment succeeded
- [ ] Frontend loads without errors
- [ ] Backend API responds
- [ ] Partner logos seed completed
- [ ] 9 companies visible in admin panel
- [ ] Invitation email test successful
- [ ] Email contains credentials
- [ ] Test email endpoint works
- [ ] No console errors in browser
- [ ] No errors in Render logs

---

## Summary

**Commands to Run**:
```bash
# 1. Push to GitHub
git add .
git commit -m "Add B2B partner features and Razorpay integration"
git push origin main

# 2. Wait for auto-deployments (Vercel + Render)

# 3. Seed partner logos (after Render deploys)
curl -X POST https://skilldad-server.onrender.com/api/admin/partner-logos/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**That's it!** Your changes are now live on production.

---

## Need Help?

- **GitHub Issues**: Check repository issues
- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/docs
- **Check Logs**: Always check deployment logs first

---

**Last Updated**: 2024
**Status**: Ready for Deployment ✅
