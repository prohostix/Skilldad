# Render Environment Variables - CRITICAL UPDATE NEEDED

## IMPORTANT: Update These on Render Dashboard

Go to your Render dashboard → skilldad-server → Environment → Add the following variables:

### Zoom Credentials (CRITICAL - Fix Account ID)

```
ZOOM_ACCOUNT_ID=RB_Ow7Q9Qzu4KmF_WAUUSw
ZOOM_CLIENT_ID=Hy_Ow7Q9Qzu4KmF_WAUUSw
ZOOM_CLIENT_SECRET=<your-client-secret>
ZOOM_SDK_KEY=<your-sdk-key>
ZOOM_SDK_SECRET=<your-sdk-secret>
ZOOM_WEBHOOK_SECRET=<your-webhook-secret>
ZOOM_ENCRYPTION_KEY=fb3837389bb86ead184c5a249a3fdc4fe35b1314a9be3ded4689406ed002deea
ZOOM_MOCK_MODE=false
```

### Razorpay Credentials

```
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-razorpay-webhook-secret>
```

### Other Required Variables

Make sure these are also set on Render:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret
- `CLIENT_URL` - Your Vercel frontend URL
- Any other environment variables from your local `.env`

## Steps to Update on Render

1. Go to https://dashboard.render.com
2. Select your `skilldad-server` service
3. Click "Environment" in the left sidebar
4. Update or add each variable above
5. Click "Save Changes"
6. Render will automatically redeploy with the new variables

## Verification

After Render redeploys:
1. Check the logs for any Zoom API errors
2. Test the webhook endpoint: `https://skilldad-server.onrender.com/api/webhooks/zoom`
3. Try creating a live session to verify Zoom integration works

## Common Issues

- If you see "Bad Request" from Zoom API, double-check `ZOOM_ACCOUNT_ID` (should NOT have "Client" at the end)
- If webhook validation fails, verify `ZOOM_WEBHOOK_SECRET` matches your Zoom app
- Make sure `ZOOM_MOCK_MODE=false` for production
