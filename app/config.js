/* Configuration file for app settings */
(function() {
  'use strict';

  // API Configuration
  window.APP_CONFIG = {
    // WhatsApp API endpoint - Update this URL after deploying to Render
    // Current: Temporary Cloudflare tunnel (will expire)
    WHATSAPP_API_URL: 'https://muze-toolbox-heel-builds.trycloudflare.com/api/send',

    // After Render deployment, update to:
    // WHATSAPP_API_URL: 'https://whatsapp-bridge-xxxx.onrender.com/api/send',

    // Alternative: Use relative URL if API is on same domain
    // WHATSAPP_API_URL: '/api/send',

    // Timing configurations (in milliseconds)
    AUTO_PROCEED_DELAY: 500,
    INPUT_FOCUS_DELAY: 100,
    ERROR_FLASH_DURATION: 500,
    FINAL_REDIRECT_DELAY: 1000,

    // Messages
    MESSAGES: {
      PHONE_INVALID: 'Please enter a valid Israeli phone number (e.g. 0501234567).',
      PHONE_MISSING: 'Phone input missing on page.',
      SEND_FAILED: 'Failed to send verification code: ',
      SEND_ERROR: 'Error sending verification code. Please try again.',
      CODE_INCORRECT: 'קוד שגוי. אנא נסה שוב.\nIncorrect code. Please try again.',
      SENDING: 'שולח קוד...',
      LOADING: 'טוען...'
    }
  };
})();
