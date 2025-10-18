# Frontend Integration Guide

This guide shows exactly how to integrate WhatsApp verification into your Hebrew community app.

## What You'll Change

You'll modify [index.js](index.js) to replace the simulated SMS code with real WhatsApp verification.

## Step 1: Add API Configuration

At the top of your `index.js`, add:

```javascript
// WhatsApp Verification API URL (replace with your Northflank URL)
const VERIFICATION_API_URL = 'https://your-verification-api.northflank.app';
```

## Step 2: Replace simulateSMSCode Function

Find the `simulateSMSCode()` function and replace it with:

```javascript
// Send verification code via WhatsApp
async function sendWhatsAppCode(phone) {
  try {
    // Show loading state
    const sendButton = document.querySelector('.send-code-btn');
    const originalText = sendButton.textContent;
    sendButton.disabled = true;
    sendButton.textContent = 'שולח...';

    // Call API to send code
    const response = await fetch(`${VERIFICATION_API_URL}/api/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'שגיאה בשליחת הקוד');
    }

    // Show success message
    alert('קוד האימות נשלח לוואטסאפ שלך!');

    // Re-enable button
    sendButton.disabled = false;
    sendButton.textContent = originalText;

    return true;
  } catch (error) {
    console.error('Error sending code:', error);
    alert('שגיאה בשליחת הקוד: ' + error.message);

    // Re-enable button
    const sendButton = document.querySelector('.send-code-btn');
    sendButton.disabled = false;
    sendButton.textContent = 'שלח קוד';

    return false;
  }
}
```

## Step 3: Add Verification Function

Add a new function to verify the code:

```javascript
// Verify the code entered by user
async function verifyWhatsAppCode(phone, code) {
  try {
    const response = await fetch(`${VERIFICATION_API_URL}/api/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'קוד אימות שגוי');
    }

    return true;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}
```

## Step 4: Update Event Handlers

Find where you handle the "send code" button click and update it:

```javascript
// When user clicks "send code" button
sendCodeButton.addEventListener('click', async () => {
  const phone = phoneInput.value;

  if (!validatePhone(phone)) {
    alert('נא להזין מספר טלפון תקין');
    return;
  }

  // Send code via WhatsApp
  const sent = await sendWhatsAppCode(phone);

  if (sent) {
    // Store phone for later verification
    window.currentPhone = phone;

    // Move to code input screen
    showCodeInputScreen();
  }
});
```

Find where you handle the code verification:

```javascript
// When user enters the 4-digit code
verifyButton.addEventListener('click', async () => {
  const code = codeInput.value;

  if (code.length !== 4) {
    alert('נא להזין קוד בן 4 ספרות');
    return;
  }

  try {
    // Show loading
    verifyButton.disabled = true;
    verifyButton.textContent = 'מאמת...';

    // Verify code
    await verifyWhatsAppCode(window.currentPhone, code);

    // Success! Move to next screen
    showSuccessScreen();

  } catch (error) {
    // Show error
    alert('קוד אימות שגוי. נסה שוב.');
    codeInput.value = '';
    verifyButton.disabled = false;
    verifyButton.textContent = 'אמת';
  }
});
```

## Step 5: Add Resend Code Function (Optional)

If you have a "resend code" button:

```javascript
resendButton.addEventListener('click', async () => {
  await sendWhatsAppCode(window.currentPhone);
});
```

## Complete Example

Here's a complete working example:

```javascript
// === Configuration ===
const VERIFICATION_API_URL = 'https://your-verification-api.northflank.app';

// === Phone Validation ===
function validatePhone(phone) {
  // Israeli phone: 05xxxxxxxx (10 digits)
  const israeliFormat = /^05\d{8}$/;
  return israeliFormat.test(phone.replace(/[\s\-]/g, ''));
}

// === Send Code ===
async function sendWhatsAppCode(phone) {
  try {
    const sendButton = document.querySelector('.send-code-btn');
    sendButton.disabled = true;
    sendButton.textContent = 'שולח...';

    const response = await fetch(`${VERIFICATION_API_URL}/api/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'שגיאה בשליחת הקוד');
    }

    alert('קוד האימות נשלח לוואטסאפ שלך!');
    sendButton.disabled = false;
    sendButton.textContent = 'שלח קוד';

    return true;
  } catch (error) {
    console.error('Error:', error);
    alert('שגיאה: ' + error.message);
    document.querySelector('.send-code-btn').disabled = false;
    return false;
  }
}

// === Verify Code ===
async function verifyWhatsAppCode(phone, code) {
  try {
    const response = await fetch(`${VERIFICATION_API_URL}/api/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'קוד אימות שגוי');
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// === Event Handlers ===
document.querySelector('.send-code-btn').addEventListener('click', async () => {
  const phone = document.querySelector('.phone-input').value;

  if (!validatePhone(phone)) {
    alert('נא להזין מספר טלפון תקין');
    return;
  }

  const sent = await sendWhatsAppCode(phone);

  if (sent) {
    window.currentPhone = phone;
    // Show code input screen (your existing function)
    showCodeInputScreen();
  }
});

document.querySelector('.verify-btn').addEventListener('click', async () => {
  const code = document.querySelector('.code-input').value;

  if (code.length !== 4) {
    alert('נא להזין קוד בן 4 ספרות');
    return;
  }

  try {
    const btn = document.querySelector('.verify-btn');
    btn.disabled = true;
    btn.textContent = 'מאמת...';

    await verifyWhatsAppCode(window.currentPhone, code);

    // Success!
    showSuccessScreen();

  } catch (error) {
    alert('קוד שגוי. נסה שוב.');
    document.querySelector('.code-input').value = '';
    document.querySelector('.verify-btn').disabled = false;
    document.querySelector('.verify-btn').textContent = 'אמת';
  }
});
```

## Testing Checklist

Before deploying to production:

1. ✅ Test with your own phone number
2. ✅ Verify WhatsApp message arrives in Hebrew
3. ✅ Test correct code verification
4. ✅ Test incorrect code (should show error)
5. ✅ Test expired code (wait 5 minutes)
6. ✅ Test resend functionality
7. ✅ Test on mobile device
8. ✅ Check HTTPS is used (not HTTP)

## Error Messages in Hebrew

Add these error messages for better UX:

```javascript
const ERROR_MESSAGES = {
  'Phone number is required': 'נדרש מספר טלפון',
  'No verification code found': 'לא נמצא קוד אימות. בקש קוד חדש.',
  'Verification code expired': 'הקוד פג תוקף. בקש קוד חדש.',
  'Invalid verification code': 'קוד אימות שגוי',
  'Failed to send WhatsApp message': 'שגיאה בשליחת הודעת וואטסאפ'
};

function getHebrewError(englishError) {
  return ERROR_MESSAGES[englishError] || 'שגיאה לא ידועה';
}
```

## What Your Users Will Experience

1. User enters phone: `0509969977`
2. Clicks "שלח קוד" (Send code)
3. Gets WhatsApp message: "קוד האימות שלך: 1234"
4. Enters `1234` in app
5. Clicks "אמת" (Verify)
6. Successfully logged in!

## Important Notes

- ⚠️ The API converts Israeli format (05xxxxxxxx) to international (972xxxxxxxxx) automatically
- ⚠️ Codes expire after 5 minutes
- ⚠️ Use HTTPS URLs only (Northflank provides SSL)
- ⚠️ Test thoroughly before launching to users

## Next Steps

1. Deploy backend to Northflank (see [NORTHFLANK_DEPLOYMENT.md](../NORTHFLANK_DEPLOYMENT.md))
2. Get your API URL from Northflank
3. Update `VERIFICATION_API_URL` in your code
4. Test with your phone number
5. Deploy updated frontend to GitHub Pages
6. Launch! 🚀

---

Need help? Check the logs in Northflank dashboard.
