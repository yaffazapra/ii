# Cloudflare Tunnel Update

## ⚠️ Issue Resolved
**Error:** `ERR_NAME_NOT_RESOLVED` on old tunnel URL
**Cause:** Cloudflare temporary tunnels expire after some time
**Status:** ✅ Fixed

---

## 🆕 New Tunnel Information

### WhatsApp Bridge API
- **New URL:** `https://muze-toolbox-heel-builds.trycloudflare.com/api/send`
- **Status:** ✅ Active and tested
- **Updated in:** `app/config.js` (line 8)

### Old URL (Expired)
- ~~`https://interference-mental-ssl-friendship.trycloudflare.com/api/send`~~

---

## ✅ What Was Updated

1. **Created new Cloudflare tunnel** for port 8080
2. **Updated config.js** with new tunnel URL
3. **Tested endpoint** - working correctly
4. **WhatsApp bridge** running and connected

---

## 🔄 How Tunnel URLs Work

### Temporary Tunnels (Current Setup)
- 🆓 Free to use
- ⏰ Expire after hours/days
- 🔄 Need manual updates when expired
- 🎲 Random URLs each time

### When Tunnel Expires:
1. Error appears: `ERR_NAME_NOT_RESOLVED`
2. Restart tunnel → Get new URL
3. Update `config.js` with new URL
4. Reload app

---

## 🚀 Long-Term Solutions

### Option 1: Deploy to Permanent Hosting
**Recommended for production**

Popular options:
- **Railway** - Free tier available
- **Render** - Free tier with auto-deploy
- **Northflank** - As discussed earlier
- **Fly.io** - Free tier for small apps
- **Heroku** - Paid but reliable

**Benefit:** Permanent URL, no expiration

### Option 2: Named Cloudflare Tunnel
**Free, but requires Cloudflare account**

Steps:
1. Create Cloudflare account
2. Create named tunnel
3. Get permanent tunnel URL
4. Configure in app

**Benefit:** Free permanent URL

### Option 3: Use Codespace Forwarded Port
**If API and app on same domain**

```javascript
// In config.js:
WHATSAPP_API_URL: '/api/send'  // Relative URL
```

---

## 📋 Quick Fix Checklist

When tunnel expires again:

- [ ] Restart WhatsApp bridge: `cd whatsapp-mcp/whatsapp-bridge && go run main.go`
- [ ] Create new tunnel: `cloudflared tunnel --url http://localhost:8080`
- [ ] Copy new URL from terminal output
- [ ] Update `app/config.js` line 8 with new URL
- [ ] Save and reload app
- [ ] Test with a phone number

---

## 🧪 Test Current Setup

### Quick Test:
```bash
curl -X POST https://muze-toolbox-heel-builds.trycloudflare.com/api/send \
  -H "Content-Type: application/json" \
  -d '{"recipient":"972547217798","message":"Test"}'
```

Expected response:
```json
{"success":true,"message":"Message sent to 972547217798"}
```

---

## 📝 Current Status (2025-10-18 21:13 UTC)

| Component | Status | Details |
|-----------|--------|---------|
| WhatsApp Bridge | ✅ Running | Port 8080 |
| Cloudflare Tunnel | ✅ Active | muze-toolbox-heel-builds |
| config.js | ✅ Updated | Line 8 |
| API Endpoint | ✅ Working | Tested successfully |

---

## 💡 Pro Tip

To avoid this issue in production:
1. Deploy WhatsApp bridge to permanent hosting
2. Get a permanent URL (e.g., `https://api.yourapp.com`)
3. Update config.js once and forget about it
4. No more tunnel expiration issues!

---

## 🔗 Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Render Deployment Guide](https://render.com/docs)

---

**Last Updated:** 2025-10-18 21:13 UTC
**Next Action:** Consider deploying to permanent hosting for production use
