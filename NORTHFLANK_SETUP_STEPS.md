# Northflank Deployment - Step-by-Step Guide

Your code is now on GitHub at: **https://github.com/yaffazapra/i**

Follow these exact steps to deploy both services to Northflank.

---

## ✅ Prerequisites (Already Done!)
- ✅ Northflank account created
- ✅ Project "whatsapp-verification" created
- ✅ Code pushed to GitHub

---

## Step 1: Connect GitHub to Northflank (One-Time Setup)

1. Open Northflank dashboard: https://app.northflank.com
2. Go to your project: **whatsapp-verification**
3. Click your profile icon (top right) → **Account Settings**
4. Click **Git Integrations** in left sidebar
5. Click **Connect GitHub**
6. Authorize Northflank to access your GitHub account
7. Select repositories → Choose **yaffazapra/i**
8. Click **Install & Authorize**

✅ GitHub is now connected!

---

## Step 2: Deploy WhatsApp Bridge Service (Service 1 of 2)

### 2.1 Create the Service

1. In your **whatsapp-verification** project
2. Click **Create Service** button (big green button)
3. Select **Combined Service** (combines build + deployment)

### 2.2 Configure Git Source

**Service Details:**
- Name: `whatsapp-bridge`
- Description: `WhatsApp MCP Bridge for sending messages`

**Git Repository:**
- VCS Provider: **GitHub**
- Repository: **yaffazapra/i**
- Branch: **main**

**Build Configuration:**
- Build Method: **Dockerfile**
- Dockerfile Path: `whatsapp-mcp/whatsapp-bridge/Dockerfile`
- Build Context: `whatsapp-mcp/whatsapp-bridge`

### 2.3 Configure Deployment

**Port Configuration:**
- Port: `8080`
- Protocol: **HTTP**
- Public Access: ✅ **Enable** (so you can see logs and QR code)

**Resources:**
- CPU: **0.2 vCPU** (smallest - free tier)
- Memory: **512 MB** (smallest - free tier)

### 2.4 Add Persistent Storage (CRITICAL!)

Click **Add Volume** or **Storage**:
- Volume Name: `whatsapp-session`
- Mount Path: `/app/store`
- Size: **1 GB**
- Storage Type: **HDD** (cheapest)

⚠️ **This is critical!** Without this, WhatsApp will disconnect on every restart.

### 2.5 Environment Variables

Add these (if prompted):
- No environment variables needed for this service

### 2.6 Deploy

1. Click **Create Service**
2. Northflank will start building the Docker image
3. Wait 2-5 minutes for build to complete
4. Service will automatically start after build

---

## Step 3: Get WhatsApp QR Code and Connect

### 3.1 View Logs

1. Click on **whatsapp-bridge** service
2. Click **Logs** tab
3. Wait 30-60 seconds
4. You should see ASCII art QR code in the logs

### 3.2 Scan QR Code

1. Open **WhatsApp** on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code from the Northflank logs
5. Wait for "Successfully logged in!" message in logs

✅ WhatsApp is now connected 24/7!

### 3.3 Get Internal Service URL

1. In **whatsapp-bridge** service page
2. Click **Networking** tab
3. Copy the **Internal URL** (looks like: `whatsapp-bridge:8080`)
4. **Save this URL** - you'll need it in the next step!

Example internal URL: `whatsapp-bridge:8080` or `whatsapp-bridge.whatsapp-verification.svc.cluster.local:8080`

---

## Step 4: Deploy Backend API Service (Service 2 of 2)

### 4.1 Create the Service

1. Back in your **whatsapp-verification** project
2. Click **Create Service** again
3. Select **Combined Service**

### 4.2 Configure Git Source

**Service Details:**
- Name: `verification-api`
- Description: `Backend API for phone verification`

**Git Repository:**
- VCS Provider: **GitHub**
- Repository: **yaffazapra/i**
- Branch: **main**

**Build Configuration:**
- Build Method: **Dockerfile**
- Dockerfile Path: `whatsapp-verification-api/Dockerfile`
- Build Context: `whatsapp-verification-api`

### 4.3 Configure Deployment

**Port Configuration:**
- Port: `3000`
- Protocol: **HTTP**
- Public Access: ✅ **Enable** (your frontend will call this)

**Resources:**
- CPU: **0.2 vCPU** (smallest - free tier)
- Memory: **512 MB** (smallest - free tier)

### 4.4 Environment Variables (IMPORTANT!)

Add these environment variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `WHATSAPP_BRIDGE_URL` | `http://whatsapp-bridge:8080` | Internal URL from Step 3.3 |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `3000` | Port number |

⚠️ **Replace `whatsapp-bridge:8080` with the actual internal URL you copied in Step 3.3!**

### 4.5 No Storage Needed

This service stores codes in memory, so no persistent storage needed.

### 4.6 Deploy

1. Click **Create Service**
2. Wait 1-3 minutes for build
3. Service will start automatically

---

## Step 5: Get Your API URL

### 5.1 Find Public URL

1. Click on **verification-api** service
2. Click **Networking** tab
3. Copy the **Public URL** (looks like: `https://verification-api-xxxxx.northflank.app`)
4. **Save this URL** - you'll use it in your frontend!

### 5.2 Test the API

Open your browser or use curl:

**Test health endpoint:**
```
https://verification-api-xxxxx.northflank.app/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-10-18T..."}
```

**Test debug endpoint:**
```
https://verification-api-xxxxx.northflank.app/api/debug
```

You should see:
```json
{
  "whatsappBridgeUrl": "http://whatsapp-bridge:8080",
  "activeCodes": {},
  "codeCount": 0
}
```

✅ If both work, your backend is ready!

---

## Step 6: Update Your Frontend

### 6.1 Update API URL

Open your frontend code (`app/index.js`) and add at the top:

```javascript
const VERIFICATION_API_URL = 'https://verification-api-xxxxx.northflank.app';
```

**Replace with your actual URL from Step 5.1!**

### 6.2 Follow Integration Guide

Follow the complete integration guide here:
- **File:** [app/INTEGRATION_GUIDE.md](app/INTEGRATION_GUIDE.md)

This will show you exactly how to:
- Replace SMS simulation with real WhatsApp API calls
- Add verification code logic
- Handle errors properly

---

## Step 7: Test End-to-End

### 7.1 Test with curl (First)

Send a test code to your phone:

```bash
curl -X POST https://verification-api-xxxxx.northflank.app/api/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "0509969977"}'
```

**Replace with your actual phone number!**

You should:
1. Get JSON response: `{"success":true,"message":"Verification code sent",...}`
2. Receive WhatsApp message on your phone with 4-digit code

Then verify the code:

```bash
curl -X POST https://verification-api-xxxxx.northflank.app/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "0509969977", "code": "1234"}'
```

**Use the actual code you received!**

### 7.2 Test with Your Frontend

1. Open your app (GitHub Pages or locally)
2. Enter your phone number
3. Click "send code"
4. Check your WhatsApp
5. Enter the code
6. Should successfully verify!

---

## 📊 Monitor Your Deployment

### Check Service Status

**Northflank Dashboard:**
- Go to **whatsapp-verification** project
- Both services should show **green checkmark** (Running)

### View Logs

**WhatsApp Bridge logs:**
- Click **whatsapp-bridge** → **Logs**
- Look for: "Successfully logged in", message confirmations

**Backend API logs:**
- Click **verification-api** → **Logs**
- Look for: "Sent code XXXX to 972xxxxxxxxx", "Successfully verified"

### Monitor Usage

**Free Tier Usage:**
- Click project name → **Usage & Billing**
- Check compute usage (stay under $20/month)
- Check bandwidth (stay under 10 GB/month)

---

## 🎉 You're Done!

Your WhatsApp verification system is now live on Northflank!

**What you have:**
- ✅ WhatsApp Bridge running 24/7 (no sleep!)
- ✅ Backend API with public URL
- ✅ Persistent WhatsApp session (won't need to re-scan QR)
- ✅ All on free tier ($0/month)

**Next steps:**
1. Update your frontend with the API URL
2. Test thoroughly with your own phone
3. Deploy frontend to GitHub Pages
4. Launch to users!

---

## 🆘 Troubleshooting

### Build Failed

**Check:**
- Dockerfile path is correct (case-sensitive!)
- Build context is correct
- Logs show specific error

**Common issues:**
- Wrong Dockerfile path: Should be `whatsapp-mcp/whatsapp-bridge/Dockerfile`
- Wrong build context: Should be `whatsapp-mcp/whatsapp-bridge`

### WhatsApp Not Connected

**Check:**
- QR code appeared in logs? (wait 60 seconds)
- Persistent storage mounted to `/app/store`?
- Service didn't crash after QR scan?

**Solution:**
- Restart service to get fresh QR code
- Check logs for error messages

### Backend Can't Reach WhatsApp Bridge

**Check:**
- `WHATSAPP_BRIDGE_URL` environment variable is correct
- Using internal URL (`http://whatsapp-bridge:8080`), not public URL
- Both services in same project

**Solution:**
- Update environment variable
- Restart verification-api service

### CORS Errors in Frontend

**Check:**
- Using HTTPS URL (not HTTP)
- API URL is correct
- Browser console for specific error

**Solution:**
- Backend has CORS enabled, should work
- Check that public URL is correct

---

## 🔄 Making Updates

### Update Code

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. Northflank auto-deploys on push! (if auto-deploy enabled)
4. Or click **Redeploy** button in service page

### Environment Variables

1. Click service → **Environment** tab
2. Edit variables
3. Click **Save**
4. Service restarts automatically

---

## 📞 Support

- **Northflank Docs:** https://northflank.com/docs
- **Community:** https://community.northflank.com
- **GitHub Repo:** https://github.com/yaffazapra/i

---

**Your deployment is ready! 🚀**

Repository: https://github.com/yaffazapra/i
Project: whatsapp-verification on Northflank
