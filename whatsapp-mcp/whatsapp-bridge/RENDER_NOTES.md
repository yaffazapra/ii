# Render Deployment Notes

## Free Tier Configuration

The current `render.yaml` is configured for Render's **free tier**.

### What's Included (Free):
- ✅ Docker deployment
- ✅ HTTPS/SSL certificate
- ✅ Auto-deploy from GitHub
- ✅ 512 MB RAM
- ✅ Permanent URL

### What's NOT Included (Free):
- ❌ Persistent disk storage
- ❌ Always-on (sleeps after 15 min)

### Trade-offs on Free Tier:

#### WhatsApp Session Storage
- **Without disk:** WhatsApp session resets on each deploy
- **Impact:** Need to re-scan QR code after every deploy
- **Time:** Takes ~1 minute to scan QR code
- **Frequency:** Only when you redeploy (code changes)

#### Message History
- **Without disk:** Message history not saved between deploys
- **Impact:** Chat history resets on redeploy
- **For API use:** Not a problem - messages still send/receive fine

---

## Upgrading to Paid Tier ($7/month)

To add persistent storage and always-on service:

### Benefits:
- ✅ WhatsApp session persists (scan QR once)
- ✅ Message history saved
- ✅ No sleep mode (always instant)
- ✅ Better performance
- ✅ 1GB persistent disk

### How to Upgrade:

1. **Deploy on free tier first** (get it working)

2. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Plan"
   - Click "Change Plan"
   - Select "Starter" ($7/month)

3. **Add Persistent Disk:**
   - In service settings
   - Click "Disks" tab
   - Click "Add Disk"
   - Name: `whatsapp-data`
   - Mount Path: `/app/store`
   - Size: 1 GB
   - Click "Save"

4. **Service will redeploy** with persistent storage

5. **Scan QR code one time** - it will persist!

---

## Recommendation

### For Testing/Development:
**Use Free Tier**
- Perfect for learning and testing
- Re-scanning QR occasionally is fine
- Save $7/month

### For Production:
**Upgrade to Starter**
- Better user experience
- No QR re-scanning
- Professional setup
- Worth the $7/month

---

## Current Configuration

The `render.yaml` in repository root is configured for **free tier**.

To see the full configuration with disk (commented out), check:
`/whatsapp-mcp/whatsapp-bridge/render.yaml`

---

**Bottom Line:** Free tier works great for testing! Upgrade when you're ready for production.
