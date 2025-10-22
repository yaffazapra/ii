/* Configuration file for app settings */
(function() {
  'use strict';

  // API Configuration
  window.APP_CONFIG = {
    // WhatsApp API endpoint - Update this URL after deploying to Render
    WHATSAPP_API_URL: 'https://whatsapp-bridge-o5uu.onrender.com/api/send',
    WHATSAPP_STATUS_URL: 'https://whatsapp-bridge-o5uu.onrender.com/api/status',

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
      LOADING: 'טוען...',
      WHATSAPP_DISCONNECTED: '⚠️ WhatsApp service needs reconnection. Please contact admin to scan QR code.',
      CHECKING_CONNECTION: 'בודק חיבור...'
    }
  };
})();
