# WhatsApp Bridge - Render Deployment Guide

## 🚀 Deploy to Render (Free Tier)

This guide will help you deploy your WhatsApp bridge to Render.com for **permanent hosting** with a **stable URL that never expires**.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Render account (free) - [Sign up here](https://render.com)
- [ ] WhatsApp account for QR code scanning
- [ ] Git installed locally

---

## 🎯 Deployment Steps

### Step 1: Push Code to GitHub

1. **Create a new GitHub repository** (if not already done)
   ```bash
   # In your terminal
   cd /workspaces/i
   git add whatsapp-mcp/whatsapp-bridge/
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Verify files are pushed:**
   - `Dockerfile` ✅
   - `render.yaml` ✅
   - `main.go` ✅
   - `go.mod` ✅
   - `go.sum` ✅

---

### Step 2: Deploy on Render

#### Option A: Deploy via Blueprint (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Blueprint"**

3. **Connect your GitHub repository**
   - Select repository: `yaffazapra/ii` (or your repo name)
   - Branch: `main`

4. **Render will detect `render.yaml`**
   - Service name: `whatsapp-bridge`
   - Type: Web Service (Docker)
   - Plan: Free

5. **Click "Apply"**
   - Render will start building your Docker image
   - Wait 5-10 minutes for first build

6. **Get your permanent URL**
   - Will be something like: `https://whatsapp-bridge-xxxx.onrender.com`

#### Option B: Manual Deploy

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect GitHub repository**
   - Select: `yaffazapra/ii`
   - Root Directory: `whatsapp-mcp/whatsapp-bridge`

4. **Configure Service:**
   - Name: `whatsapp-bridge`
   - Runtime: `Docker`
   - Branch: `main`
   - Dockerfile Path: `./Dockerfile`

5. **Add Disk for Persistent Storage:**
   - Click "Add Disk"
   - Name: `whatsapp-data`
   - Mount Path: `/app/store`
   - Size: 1 GB (free tier)

6. **Set Environment Variables:**
   - `PORT` = `8080`

7. **Click "Create Web Service"**

---

### Step 3: Initial Setup (QR Code Scan)

⚠️ **Important:** The first time you deploy, you need to scan a QR code to authenticate WhatsApp.

#### Using Render Shell:

1. **Go to your service** in Render Dashboard

2. **Click "Shell" tab** (top right)

3. **Wait for QR code to appear** in the logs

4. **Scan QR code** with WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code shown in Render logs

5. **Wait for "Connected to WhatsApp!" message**

6. **Your bridge is now running!**

#### Alternative: View Logs

1. **Go to "Logs" tab** in your service

2. **Look for QR code** in ASCII art format

3. **Scan it** with your phone

---

### Step 4: Update Your App Configuration

Once deployed, update your app's `config.js`:

```javascript
// In: app/config.js
WHATSAPP_API_URL: 'https://YOUR-SERVICE-NAME.onrender.com/api/send'
```

Replace `YOUR-SERVICE-NAME` with your actual Render service URL.

---

## 🎨 Render Dashboard Features

### Logs
- Real-time logs of your application
- View QR codes for WhatsApp authentication
- Debug any issues

### Metrics
- CPU usage
- Memory usage
- Request counts
- Response times

### Shell
- Direct terminal access to your running container
- Useful for debugging

### Settings
- Environment variables
- Auto-deploy settings
- Domain configuration

---

## 💾 Persistent Storage

The `render.yaml` configures a **1GB persistent disk** mounted at `/app/store`.

This stores:
- WhatsApp session data
- Message history database
- Authentication keys

**Important:** This data persists across deployments!

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to GitHub:

1. Make changes to code
2. Commit and push to GitHub
3. Render detects changes
4. Automatically rebuilds and deploys
5. Zero downtime during deploy

---

## 🆓 Free Tier Limits

Render Free Tier includes:
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ 512 MB RAM
- ✅ 1 GB disk storage
- ✅ SSL certificate (HTTPS)
- ✅ Custom domains
- ⚠️ Service spins down after 15 min of inactivity
- ⚠️ Cold start: ~30s to wake up

### Preventing Sleep

Free tier services sleep after 15 minutes of inactivity. To keep it awake:

**Option 1: Upgrade to Paid Plan** ($7/month)
- No sleep
- More resources
- Better performance

**Option 2: Use a Ping Service** (Free)
- [UptimeRobot](https://uptimerobot.com/) - Pings every 5 minutes
- [Cron-job.org](https://cron-job.org/) - Free scheduled requests

**Option 3: Accept the Sleep**
- First request wakes it up (~30s)
- Subsequent requests are fast
- Good for low-traffic apps

---

## 🔧 Troubleshooting

### Build Fails

**Error:** `CGO_ENABLED` issues
**Solution:** Already fixed in updated Dockerfile

**Error:** Go version mismatch
**Solution:** Check `go.mod` version matches Dockerfile

### QR Code Not Showing

1. Check "Logs" tab in Render
2. Wait 1-2 minutes after deploy
3. Look for "Starting WhatsApp client..."
4. QR code appears below that

### WhatsApp Disconnects

1. Go to Render Shell
2. Check logs for connection errors
3. May need to re-scan QR code
4. Check WhatsApp app → Linked Devices

### Database Issues

1. Verify disk is mounted at `/app/store`
2. Check disk usage in Render dashboard
3. May need to clear old data

---

## 🎯 Testing Your Deployment

### Test API Endpoint

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "972547217798",
    "message": "Test from Render!"
  }'
```

Expected response:
```json
{"success":true,"message":"Message sent to 972547217798"}
```

### Test CORS

```bash
curl -X OPTIONS https://YOUR-SERVICE.onrender.com/api/send \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should see:
```
< access-control-allow-origin: *
< access-control-allow-methods: POST, OPTIONS
```

---

## 📊 Monitoring

### Health Checks

Render automatically monitors your service:
- HTTP health checks every 30 seconds
- Automatic restart if service crashes
- Email alerts on failures

### View Metrics

1. Go to service in Render Dashboard
2. Click "Metrics" tab
3. See:
   - Request rate
   - Response times
   - Error rates
   - Resource usage

---

## 🔐 Security Best Practices

### Environment Variables

Store sensitive data as environment variables:

```yaml
envVars:
  - key: API_SECRET
    generateValue: true
  - key: ALLOWED_ORIGINS
    value: https://yourdomain.com
```

### Custom Domain

1. Purchase domain (e.g., from Namecheap)
2. Add to Render service
3. Configure DNS
4. Get free SSL certificate

---

## 🆙 Upgrading

### To Paid Plan ($7/month)

Benefits:
- No sleep/cold starts
- More RAM (512 MB → 2 GB)
- More disk (1 GB → 10 GB)
- Priority support

In Render Dashboard:
1. Go to service settings
2. Click "Upgrade Plan"
3. Select "Starter" plan
4. Enter payment details

---

## 📝 Next Steps After Deployment

1. ✅ **Test the API** with curl commands above

2. ✅ **Update app/config.js** with Render URL

3. ✅ **Test phone verification** end-to-end

4. ✅ **Set up monitoring** (UptimeRobot)

5. ✅ **Configure custom domain** (optional)

6. ✅ **Set up auto-deploy** (already done!)

---

## 🆘 Getting Help

### Render Support
- [Render Docs](https://render.com/docs)
- [Community Forum](https://community.render.com/)
- [Status Page](https://status.render.com/)

### GitHub Issues
- Open issue in your repository
- Tag with "render-deployment"

### Contact
- Render support: support@render.com
- Check logs first!

---

## ✨ Summary

### What You Get:
- ✅ **Permanent URL** (never expires!)
- ✅ **Free HTTPS** (SSL certificate)
- ✅ **Auto-deploy** from GitHub
- ✅ **Persistent storage** for WhatsApp session
- ✅ **Built-in monitoring** and logs
- ✅ **Zero-config deployment** with render.yaml

### Free Tier Trade-offs:
- ⚠️ Sleeps after 15 min (cold start ~30s)
- ⚠️ Limited resources (512 MB RAM)
- ⚠️ Shared infrastructure

### For Production:
- 💰 Upgrade to Starter ($7/month) for always-on
- 🌐 Add custom domain
- 📊 Set up monitoring
- 🔒 Configure security settings

---

**Your WhatsApp bridge is ready for production! 🚀**

---

## 📋 Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] Dockerfile updated (done!)
- [ ] render.yaml created (done!)
- [ ] .dockerignore added (done!)

During deployment:
- [ ] Render service created
- [ ] Disk mounted for storage
- [ ] Environment variables set
- [ ] First build completed

After deployment:
- [ ] QR code scanned
- [ ] WhatsApp connected
- [ ] API tested with curl
- [ ] app/config.js updated
- [ ] End-to-end test successful

---

**Last Updated:** 2025-10-18
**Version:** 1.0
**Status:** Production Ready ✅
