# WhatsApp Verification System - Northflank Deployment Guide

This guide will help you deploy your WhatsApp verification system to Northflank.

## Architecture Overview

```
[GitHub Pages App (Frontend)]
         ↓ HTTPS calls
[Backend API - Port 3000]
  - Endpoints: /api/send-code, /api/verify-code
  - Stores verification codes (5 min expiry)
         ↓ Internal calls
[WhatsApp MCP Bridge - Port 8080]
  - Maintains WhatsApp connection
  - Sends WhatsApp messages
```

## Prerequisites

1. **Northflank Account**
   - Sign up at https://northflank.com
   - Add payment method (won't be charged on free tier)
   - Create a new project

2. **GitHub Repository** (Recommended)
   - Push your code to GitHub for easier deployment
   - Or use Northflank's manual upload feature

## Step 1: Create Northflank Account & Project

1. Go to https://northflank.com and sign up
2. Add payment method (required but won't charge on free tier)
3. Click "Create Project"
4. Name it: `whatsapp-verification`

## Step 2: Deploy WhatsApp MCP Bridge (Service 1)

### Option A: Deploy from GitHub

1. **Push code to GitHub:**
   ```bash
   cd /workspaces/i/whatsapp-mcp/whatsapp-bridge
   git init
   git add .
   git commit -m "WhatsApp MCP Bridge for Northflank"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **In Northflank:**
   - Click "Create Service" → "Combined Service"
   - Name: `whatsapp-bridge`
   - Connect your GitHub repository
   - Branch: `main`
   - Build Configuration:
     - Dockerfile path: `Dockerfile`
     - Context path: `/`
   - Port: `8080`
   - Add Persistent Storage:
     - Mount path: `/app/store`
     - Size: 1 GB (free tier)
   - Click "Create Service"

### Option B: Deploy via Dockerfile Upload

1. In Northflank, click "Create Service" → "Combined Service"
2. Choose "Upload Files" instead of Git
3. Upload the `whatsapp-bridge` folder
4. Configure as above

### Important: Get Internal URL

After deployment, go to service settings and copy the **internal URL**:
- Format: `whatsapp-bridge:8080` or similar
- You'll need this for the Backend API

## Step 3: Deploy Backend API (Service 2)

### From GitHub:

1. **Push code to GitHub:**
   ```bash
   cd /workspaces/i/whatsapp-verification-api
   git init
   git add .
   git commit -m "WhatsApp Verification API for Northflank"
   git remote add origin YOUR_BACKEND_REPO_URL
   git push -u origin main
   ```

2. **In Northflank:**
   - Click "Create Service" → "Combined Service"
   - Name: `verification-api`
   - Connect your GitHub repository
   - Build Configuration:
     - Dockerfile path: `Dockerfile`
   - Port: `3000`
   - Environment Variables:
     - Key: `WHATSAPP_BRIDGE_URL`
     - Value: `http://whatsapp-bridge:8080` (use internal URL from Step 2)
     - Key: `NODE_ENV`
     - Value: `production`
   - Click "Create Service"

### Get Public URL

After deployment, Northflank will give you a public URL like:
- `https://verification-api-xxxxx.northflank.app`

**Save this URL - you'll need it for your frontend!**

## Step 4: Connect WhatsApp (Scan QR Code)

1. In Northflank, go to your `whatsapp-bridge` service
2. Click "Logs" tab
3. You should see a QR code in ASCII art in the logs
4. Open WhatsApp on your phone:
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code from the logs
5. Wait for "Successfully logged in!" message in logs

**Important:** The WhatsApp session is saved in persistent storage, so you won't need to scan again unless you redeploy.

## Step 5: Update Your Frontend App

Open your `app/index.js` and modify the verification functions:

```javascript
// Replace the simulateSMSCode function with real API calls

// Your Backend API URL from Northflank
const API_URL = 'https://verification-api-xxxxx.northflank.app';

async function sendVerificationCode(phone) {
  try {
    const response = await fetch(`${API_URL}/api/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to send code');
    }

    return data;
  } catch (error) {
    console.error('Error sending code:', error);
    throw error;
  }
}

async function verifyCode(phone, code) {
  try {
    const response = await fetch(`${API_URL}/api/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Invalid code');
    }

    return data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

// Update your existing event handlers to use these functions
```

## Step 6: Test the Complete Flow

1. Open your GitHub Pages app
2. Enter an Israeli phone number (e.g., 0509969977)
3. Click send code button
4. Check your WhatsApp - you should receive a message with 4-digit code
5. Enter the code in your app
6. Should successfully verify!

## Monitoring & Debugging

### Check Logs

**WhatsApp Bridge Logs:**
```
Northflank → whatsapp-bridge → Logs tab
```
Look for:
- QR code display
- "Successfully logged in!"
- Message sending confirmations

**Backend API Logs:**
```
Northflank → verification-api → Logs tab
```
Look for:
- "Sent code XXXX to 972xxxxxxxxx"
- "Successfully verified 972xxxxxxxxx"

### Debug Endpoint

Test your backend API directly:
```bash
# Check if backend is alive
curl https://verification-api-xxxxx.northflank.app/health

# Check debug info (remove this endpoint in production!)
curl https://verification-api-xxxxx.northflank.app/api/debug
```

### Test Sending Code

```bash
curl -X POST https://verification-api-xxxxx.northflank.app/api/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "0509969977"}'
```

## Free Tier Limits

Your setup uses:
- **Service 1:** WhatsApp Bridge (Go app)
- **Service 2:** Backend API (Node.js)
- **Storage:** 1 GB for WhatsApp session
- **Bandwidth:** First 10 GB free

You have exactly 2 services in the free tier, which is perfect for this setup!

## Troubleshooting

### QR Code Not Appearing in Logs
- Wait 30-60 seconds after deployment
- Check if service is running (not crashed)
- Rebuild the service if needed

### WhatsApp Session Lost
- Check if persistent storage is attached to `/app/store`
- Verify mount path is correct
- May need to re-scan QR code after first deployment

### "Failed to send WhatsApp message"
- Check that WhatsApp is connected (check logs)
- Verify `WHATSAPP_BRIDGE_URL` environment variable is correct
- Test internal connectivity between services

### CORS Errors in Frontend
- Backend has CORS enabled, should work
- If issues persist, check browser console for specific error
- Verify API URL is correct (https, not http)

### Code Not Received
- Check phone number format (should be 972xxxxxxxxx)
- Verify WhatsApp is connected
- Check backend logs for errors
- Test with your own number first

## Cost Monitoring

Monitor your usage in Northflank dashboard:
- Keep compute under $20/month (free tier limit)
- Keep bandwidth under 10 GB/month
- Monitor active verification codes (should auto-expire)

## Security Notes

1. **Remove debug endpoint** before going fully live:
   - Delete the `/api/debug` route from server.js

2. **Add rate limiting** to prevent abuse:
   - Limit requests per IP
   - Limit codes per phone number per day

3. **Environment variables:**
   - Never commit sensitive data
   - Use Northflank's secret management

4. **HTTPS only:**
   - Always use HTTPS URLs for API calls
   - Northflank provides SSL automatically

## Next Steps

Once deployed and tested:
1. Remove debug endpoints
2. Add rate limiting
3. Monitor usage in Northflank dashboard
4. Consider adding logging/analytics
5. Set up alerts for service failures

## Support

- **Northflank Docs:** https://northflank.com/docs
- **Northflank Community:** https://community.northflank.com
- **WhatsApp MCP Issues:** https://github.com/lharries/whatsapp-mcp/issues

---

**Your deployment is ready! 🚀**

Remember: Keep an eye on your free tier usage in the Northflank dashboard.
