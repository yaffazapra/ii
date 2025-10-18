const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// WhatsApp MCP Bridge URL - will be internal on Northflank
const WHATSAPP_BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:8080';

// Store verification codes in memory (expires in 5 minutes)
const verificationCodes = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Convert Israeli phone format (05xxxxxxxx) to international (972xxxxxxxxx)
function formatPhoneNumber(phone) {
  // Remove any spaces, dashes, or special characters
  phone = phone.replace(/[\s\-\(\)]/g, '');

  // If starts with 0, replace with 972
  if (phone.startsWith('0')) {
    phone = '972' + phone.substring(1);
  }

  // If doesn't start with 972, add it
  if (!phone.startsWith('972')) {
    phone = '972' + phone;
  }

  return phone;
}

// Generate 4-digit verification code
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// POST /api/send-code - Send verification code via WhatsApp
app.post('/api/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Generate verification code
    const code = generateCode();

    // Store code with expiration (5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    verificationCodes.set(formattedPhone, { code, expiresAt });

    // Clean up expired codes
    for (const [key, value] of verificationCodes.entries()) {
      if (value.expiresAt < Date.now()) {
        verificationCodes.delete(key);
      }
    }

    // Send WhatsApp message
    const message = `קוד האימות שלך: ${code}\n\nYour verification code: ${code}\n\nהקוד תקף ל-5 דקות / Code valid for 5 minutes`;

    try {
      const response = await axios.post(`${WHATSAPP_BRIDGE_URL}/api/send`, {
        recipient: formattedPhone,
        message: message
      }, {
        timeout: 10000 // 10 second timeout
      });

      console.log(`Sent code ${code} to ${formattedPhone}`);

      res.json({
        success: true,
        message: 'Verification code sent',
        phone: formattedPhone
      });
    } catch (whatsappError) {
      console.error('WhatsApp bridge error:', whatsappError.message);

      // Still store the code but return error about sending
      res.status(500).json({
        success: false,
        error: 'Failed to send WhatsApp message',
        details: whatsappError.message
      });
    }
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// POST /api/verify-code - Verify the code entered by user
app.post('/api/verify-code', (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and code are required'
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Get stored code
    const stored = verificationCodes.get(formattedPhone);

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found. Please request a new code.'
      });
    }

    // Check if expired
    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(formattedPhone);
      return res.status(400).json({
        success: false,
        error: 'Verification code expired. Please request a new code.'
      });
    }

    // Check if code matches
    if (stored.code !== code.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Code is valid - remove it and return success
    verificationCodes.delete(formattedPhone);

    console.log(`Successfully verified ${formattedPhone}`);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      phone: formattedPhone
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/debug - Debug endpoint (remove in production)
app.get('/api/debug', (req, res) => {
  const codes = {};
  for (const [phone, data] of verificationCodes.entries()) {
    codes[phone] = {
      code: data.code,
      expiresIn: Math.round((data.expiresAt - Date.now()) / 1000) + 's'
    };
  }

  res.json({
    whatsappBridgeUrl: WHATSAPP_BRIDGE_URL,
    activeCodes: codes,
    codeCount: verificationCodes.size
  });
});

app.listen(PORT, () => {
  console.log(`WhatsApp Verification API running on port ${PORT}`);
  console.log(`WhatsApp Bridge URL: ${WHATSAPP_BRIDGE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
