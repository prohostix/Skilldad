# Deployment Guide - GitHub, Render & Vercel

## Recent Changes Summary

### Fixed Issues:
1. ✅ QuestionBuilder "Add Question" button crash
2. ✅ Exam submission route (404 error)
3. ✅ University grading workflow
4. ✅ Exam submission model mismatch
5. ✅ MCQ auto-grading
6. ✅ Result publishing system
7. ✅ Student result viewing (fixed TypeError)
8. ✅ Result model pre-save hook error

### Key Files Modified:
- `server/models/resultModel.js` - Fixed pre-save hook
- `client/src/pages/student/ExamResult.jsx` - Fixed result data extraction
- `client/src/pages/university/ExamManagement.jsx` - Added publish results button
- `server/controllers/resultController.js` - Result publishing logic
- `server/controllers/examSubmissionController.js` - Auto-grading integration

## Step 1: Commit and Push to GitHub

### Check Git Status
```bash
git status
```

### Stage All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Fix: Exam results system - student viewing, auto-grading, and publishing

- Fixed result model pre-save hook error (removed next callback)
- Fixed student result viewing TypeError (extract result from API response)
- Added publish results button in university panel
- Fixed MCQ auto-grading on submission
- Updated exam submission to use ExamSubmissionNew model
- Added grading progress indicator
- Fixed result authorization for students
- Added Razorpay setup guide"
```

### Push to GitHub
```bash
# Push to main branch
git push origin main

# Or if you're on a different branch
git push origin <your-branch-name>
```

## Step 2: Deploy Backend to Render

### Option A: Automatic Deployment (Recommended)
If you have Render connected to your GitHub repo:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your backend service
3. Render will automatically detect the push and start deploying
4. Wait for deployment to complete (usually 2-5 minutes)
5. Check logs for any errors

### Option B: Manual Deployment
If automatic deployment is not set up:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

### Verify Backend Deployment
```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Should return:
# {"status":"ok","database":"connected","timestamp":"..."}
```

### Important: Update Environment Variables on Render
Make sure these are set in Render dashboard:
1. Go to your service → Environment
2. Add/Update:
   ```
   RAZORPAY_KEY_ID=your_key_here
   RAZORPAY_KEY_SECRET=your_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```
3. Click "Save Changes"
4. Render will automatically redeploy

## Step 3: Deploy Frontend to Vercel

### Option A: Automatic Deployment (Recommended)
If you have Vercel connected to your GitHub repo:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your frontend project
3. Vercel will automatically detect the push and start deploying
4. Wait for deployment to complete (usually 1-3 minutes)
5. Check deployment logs for any errors

### Option B: Manual Deployment via CLI
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Navigate to client directory
cd client

# Deploy
vercel --prod
```

### Option C: Manual Deployment via Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your frontend project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Select "Use existing Build Cache" (optional)
6. Click "Redeploy"

### Verify Frontend Deployment
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the exam results flow:
   - Login as student
   - Go to exams
   - Try to view results
3. Check browser console for errors

## Step 4: Post-Deployment Verification

### Backend Checks
- [ ] Health endpoint responds: `/health`
- [ ] API routes work: `/api/exams`, `/api/results`
- [ ] Database connection successful
- [ ] Environment variables loaded correctly
- [ ] Logs show no errors

### Frontend Checks
- [ ] Application loads without errors
- [ ] Student can view exam results
- [ ] University can publish results
- [ ] MCQ auto-grading works
- [ ] No console errors

### Test Critical Flows
1. **Student Exam Submission**
   - Submit an exam
   - Check if submission is saved
   - Verify MCQ auto-grading

2. **University Grading**
   - View submissions
   - Grade descriptive questions
   - Publish results

3. **Student Result Viewing**
   - View published results
   - Check all data displays correctly
   - No TypeError errors

## Step 5: Monitor Deployments

### Render Monitoring
```bash
# View logs
# Go to Render Dashboard → Your Service → Logs

# Or use Render CLI
render logs -s your-service-name --tail
```

### Vercel Monitoring
```bash
# View logs
# Go to Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs

# Or use Vercel CLI
vercel logs your-deployment-url
```

## Troubleshooting

### Issue: Deployment Failed on Render
**Solution:**
1. Check build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Check Node version compatibility
4. Ensure environment variables are set

### Issue: Deployment Failed on Vercel
**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `vite.config.js` is correct
3. Check for build errors in local environment first
4. Ensure all imports are correct

### Issue: API Calls Failing After Deployment
**Solution:**
1. Check CORS settings in backend
2. Verify `CLIENT_URL` environment variable on Render
3. Check API base URL in frontend
4. Verify Render service is running

### Issue: Environment Variables Not Working
**Solution:**
1. Verify variables are set in Render/Vercel dashboard
2. Restart the service after adding variables
3. Check variable names match exactly (case-sensitive)
4. Don't use quotes around values in dashboard

## Rollback Plan

### If Backend Deployment Fails
```bash
# On Render Dashboard
1. Go to your service
2. Click "Rollback" button
3. Select previous working deployment
4. Confirm rollback
```

### If Frontend Deployment Fails
```bash
# On Vercel Dashboard
1. Go to your project
2. Go to "Deployments" tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"
```

## Quick Commands Reference

```bash
# Git Commands
git status                          # Check changes
git add .                          # Stage all changes
git commit -m "message"            # Commit changes
git push origin main               # Push to GitHub

# Render CLI (optional)
render services list               # List services
render logs -s service-name        # View logs
render deploy -s service-name      # Manual deploy

# Vercel CLI (optional)
vercel                            # Deploy to preview
vercel --prod                     # Deploy to production
vercel logs                       # View logs
vercel ls                         # List deployments
```

## Post-Deployment Checklist

- [ ] Code pushed to GitHub successfully
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables updated
- [ ] Health checks passing
- [ ] Critical flows tested
- [ ] No errors in logs
- [ ] Team notified of deployment

## Support Links

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com

---

**Deployment completed successfully! 🚀**
